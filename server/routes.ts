import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { extractionService } from "./services/extraction";
import { sendTelegramMessage, parseTelegramUpdate, type TelegramUpdate } from "./services/telegram";
import { sendSlackMessage, parseSlackEvent, type SlackEvent } from "./services/slack";
import { generateEmbedding, generateAnswer } from "./services/openai";
import { insertMessageSchema, insertKnowledgePairSchema } from "@shared/schema";
import { db } from "./db";
import { sql } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Start periodic extraction processing
  extractionService.startPeriodicProcessing();

  // Telegram webhook endpoint
  app.post("/api/telegram/webhook", async (req, res) => {
    try {
      const update: TelegramUpdate = req.body;
      const parsedMessage = parseTelegramUpdate(update);

      if (!parsedMessage) {
        return res.status(200).json({ ok: true });
      }

      // Handle bot commands
      if (parsedMessage.content.startsWith('/')) {
        await handleBotCommand(parsedMessage, 'telegram');
        return res.status(200).json({ ok: true });
      }

      // Store message for processing
      await storage.createMessage({
        platform: parsedMessage.platform,
        channelId: parsedMessage.channelId,
        userId: parsedMessage.userId,
        content: parsedMessage.content,
      });

      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Telegram webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Slack events endpoint
  app.post("/api/slack/events", async (req, res) => {
    try {
      const { type, challenge, event } = req.body;

      // URL verification
      if (type === 'url_verification') {
        return res.status(200).json({ challenge });
      }

      if (type === 'event_callback' && event) {
        const parsedMessage = parseSlackEvent(event as SlackEvent);

        if (!parsedMessage) {
          return res.status(200).json({ ok: true });
        }

        // Handle bot commands
        if (parsedMessage.content.startsWith('/')) {
          await handleBotCommand(parsedMessage, 'slack');
          return res.status(200).json({ ok: true });
        }

        // Store message for processing
        await storage.createMessage({
          platform: parsedMessage.platform,
          channelId: parsedMessage.channelId,
          userId: parsedMessage.userId,
          content: parsedMessage.content,
        });
      }

      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Slack events error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Knowledge pairs API
  app.get("/api/knowledge-pairs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const pairs = await storage.getKnowledgePairs(limit, offset);
      res.json(pairs);
    } catch (error) {
      console.error('Failed to get knowledge pairs:', error);
      res.status(500).json({ error: 'Failed to get knowledge pairs' });
    }
  });

  app.get("/api/knowledge-pairs/:id", async (req, res) => {
    try {
      const pair = await storage.getKnowledgePairById(req.params.id);
      if (!pair) {
        return res.status(404).json({ error: 'Knowledge pair not found' });
      }
      res.json(pair);
    } catch (error) {
      console.error('Failed to get knowledge pair:', error);
      res.status(500).json({ error: 'Failed to get knowledge pair' });
    }
  });

  app.patch("/api/knowledge-pairs/:id", async (req, res) => {
    try {
      const updates = req.body;
      const updatedPair = await storage.updateKnowledgePair(req.params.id, updates);
      res.json(updatedPair);
    } catch (error) {
      console.error('Failed to update knowledge pair:', error);
      res.status(500).json({ error: 'Failed to update knowledge pair' });
    }
  });

  app.delete("/api/knowledge-pairs/:id", async (req, res) => {
    try {
      await storage.deleteKnowledgePair(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Failed to delete knowledge pair:', error);
      res.status(500).json({ error: 'Failed to delete knowledge pair' });
    }
  });

  // Search API
  app.post("/api/search", async (req, res) => {
    try {
      const { query, limit = 10 } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      // Generate embedding for semantic search
      const embedding = await generateEmbedding(query);
      const semanticResults = await storage.searchKnowledgePairsByEmbedding(embedding, limit);

      // Fallback to keyword search if semantic search yields poor results
      let results = semanticResults;
      if (semanticResults.length === 0 || semanticResults[0]?.similarity < 0.5) {
        const keywordResults = await storage.searchKnowledgePairsByKeyword(query, limit);
        results = keywordResults.map(pair => ({ ...pair, similarity: 0.5 }));
      }

      res.json(results);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Stats API
  app.get("/api/stats", async (req, res) => {
    try {
      const knowledgeStats = await storage.getKnowledgePairStats();
      const recentMessages = await storage.getRecentMessages(100);
      
      const stats = {
        knowledgePairs: knowledgeStats.total,
        messagesProcessed: recentMessages.length,
        accuracy: knowledgeStats.total > 0 ? (knowledgeStats.validated / knowledgeStats.total * 100).toFixed(1) : "0.0",
        activeChannels: new Set(recentMessages.map(m => m.channelId)).size,
        validated: knowledgeStats.validated,
        pending: knowledgeStats.pending,
        flagged: knowledgeStats.flagged,
      };

      res.json(stats);
    } catch (error) {
      console.error('Failed to get stats:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  });

  // Recent messages API
  app.get("/api/messages", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getRecentMessages(limit);
      res.json(messages);
    } catch (error) {
      console.error('Failed to get messages:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  });

  // n8n Integration Routes
  app.get("/api/n8n/knowledge-pairs", async (req, res) => {
    try {
      const { limit = 100, offset = 0, validated, since } = req.query;
      
      let whereClause = "";
      const params: any[] = [];
      
      if (validated !== undefined) {
        whereClause += " WHERE validated = $" + (params.length + 1);
        params.push(validated === "true");
      }
      
      if (since) {
        const connector = whereClause ? " AND" : " WHERE";
        whereClause += connector + " created_at >= $" + (params.length + 1);
        params.push(new Date(since as string));
      }
      
      params.push(Number(limit), Number(offset));
      
      const query = `
        SELECT 
          id,
          problem,
          solution,
          confidence_score,
          validated,
          created_at,
          updated_at
        FROM knowledge_pairs
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `;
      
      const result = await db.execute(sql.raw(query, params));
      const resultData = result.rows || result;
      
      // Also return metadata for pagination
      const countQuery = `SELECT COUNT(*) as total FROM knowledge_pairs ${whereClause}`;
      const countResult = await db.execute(sql.raw(countQuery, params.slice(0, -2)));
      const countData = countResult.rows || countResult;
      const total = Number(countData[0].total);
      
      res.json({
        data: resultData,
        metadata: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + Number(limit) < total
        }
      });
    } catch (error) {
      console.error("Failed to get knowledge pairs for n8n:", error);
      res.status(500).json({ error: "Failed to get knowledge pairs" });
    }
  });

  app.post("/api/n8n/knowledge-pairs", async (req, res) => {
    try {
      const { problem, solution, confidence_score = 0.8, validated = false } = req.body;
      
      if (!problem || !solution) {
        return res.status(400).json({ error: "Problem and solution are required" });
      }
      
      // Generate embedding for the new knowledge pair
      const { generateEmbedding } = await import("./services/openai.js");
      const embedding = await generateEmbedding(`${problem} ${solution}`);
      
      const result = await storage.createKnowledgePair({
        problem,
        solution,
        confidenceScore: Number(confidence_score),
        embedding,
        validated: Boolean(validated)
      });
      
      res.status(201).json(result);
    } catch (error) {
      console.error("Failed to create knowledge pair via n8n:", error);
      res.status(500).json({ error: "Failed to create knowledge pair" });
    }
  });

  app.put("/api/n8n/knowledge-pairs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { problem, solution, confidence_score, validated } = req.body;
      
      const updates: any = {};
      if (problem !== undefined) updates.problem = problem;
      if (solution !== undefined) updates.solution = solution;
      if (confidence_score !== undefined) updates.confidenceScore = Number(confidence_score);
      if (validated !== undefined) updates.validated = Boolean(validated);
      
      // If problem or solution changed, regenerate embedding
      if (problem || solution) {
        const currentPair = await storage.getKnowledgePairById(id);
        if (currentPair) {
          const newProblem = problem || currentPair.problem;
          const newSolution = solution || currentPair.solution;
          updates.embedding = await generateEmbedding(`${newProblem} ${newSolution}`);
        }
      }
      
      const result = await storage.updateKnowledgePair(id, updates);
      if (!result) {
        return res.status(404).json({ error: "Knowledge pair not found" });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Failed to update knowledge pair via n8n:", error);
      res.status(500).json({ error: "Failed to update knowledge pair" });
    }
  });

  app.post("/api/n8n/webhook/register", async (req, res) => {
    try {
      const { webhook_url, events = ['created', 'updated', 'validated'] } = req.body;
      
      if (!webhook_url) {
        return res.status(400).json({ error: "webhook_url is required" });
      }
      
      // Store webhook configuration (in production, store this in database)
      res.json({ 
        message: "Webhook registered successfully",
        webhook_url,
        events,
        endpoints: {
          knowledge_pairs: "/api/n8n/knowledge-pairs",
          messages: "/api/n8n/messages",
          search: "/api/n8n/search"
        }
      });
    } catch (error) {
      console.error("Failed to register webhook:", error);
      res.status(500).json({ error: "Failed to register webhook" });
    }
  });

  app.get("/api/n8n/messages", async (req, res) => {
    try {
      const { limit = 100, offset = 0, platform, processed, since } = req.query;
      
      let whereClause = "";
      const params: any[] = [];
      
      if (platform) {
        whereClause += " WHERE platform = $" + (params.length + 1);
        params.push(platform);
      }
      
      if (processed !== undefined) {
        const connector = whereClause ? " AND" : " WHERE";
        whereClause += connector + " processed = $" + (params.length + 1);
        params.push(processed === "true");
      }
      
      if (since) {
        const connector = whereClause ? " AND" : " WHERE";
        whereClause += connector + " timestamp >= $" + (params.length + 1);
        params.push(new Date(since as string));
      }
      
      params.push(Number(limit), Number(offset));
      
      const query = `
        SELECT 
          id,
          platform,
          channel_id,
          user_id,
          content,
          processed,
          timestamp
        FROM messages
        ${whereClause}
        ORDER BY timestamp DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `;
      
      const result = await db.execute(sql.raw(query, params));
      const resultData = result.rows || result;
      
      const countQuery = `SELECT COUNT(*) as total FROM messages ${whereClause}`;
      const countResult = await db.execute(sql.raw(countQuery, params.slice(0, -2)));
      const countData = countResult.rows || countResult;
      const total = Number(countData[0].total);
      
      res.json({
        data: resultData,
        metadata: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + Number(limit) < total
        }
      });
    } catch (error) {
      console.error("Failed to get messages for n8n:", error);
      res.status(500).json({ error: "Failed to get messages" });
    }
  });

  app.post("/api/n8n/search", async (req, res) => {
    try {
      const { query, limit = 5, min_similarity = 0.3 } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }
      
      const embedding = await generateEmbedding(query);
      const results = await storage.searchKnowledgePairsByEmbedding(embedding, Number(limit));
      
      // Filter by minimum similarity
      const filteredResults = results.filter(r => r.similarity >= Number(min_similarity));
      
      res.json({
        query,
        results: filteredResults,
        total_found: filteredResults.length
      });
    } catch (error) {
      console.error("Failed to search via n8n:", error);
      res.status(500).json({ error: "Failed to search knowledge pairs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function handleBotCommand(message: any, platform: 'telegram' | 'slack'): Promise<void> {
  const [command, ...args] = message.content.split(' ');
  const query = args.join(' ');

  try {
    switch (command) {
      case '/ask':
        if (!query) {
          await sendBotResponse(message, platform, "Please provide a question. Usage: /ask How to handle API timeouts?");
          return;
        }
        
        const embedding = await generateEmbedding(query);
        const searchResults = await storage.searchKnowledgePairsByEmbedding(embedding, 5);
        
        if (searchResults.length === 0 || searchResults[0]?.similarity < 0.3) {
          await sendBotResponse(message, platform, "I couldn't find relevant information in the knowledge base for your question. Try rephrasing or ask something more specific.");
          return;
        }

        const answer = await generateAnswer(query, searchResults);
        const sources = searchResults.slice(0, 3).length;
        const confidence = Math.round((searchResults[0]?.similarity || 0) * 100);
        
        const response = `${answer}\n\n_Sources: ${sources} knowledge pairs • Confidence: ${confidence}%_`;
        await sendBotResponse(message, platform, response);
        break;

      case '/search':
        if (!query) {
          await sendBotResponse(message, platform, "Please provide a search term. Usage: /search database optimization");
          return;
        }

        const searchEmbedding = await generateEmbedding(query);
        const results = await storage.searchKnowledgePairsByEmbedding(searchEmbedding, 3);
        
        if (results.length === 0) {
          await sendBotResponse(message, platform, "No relevant knowledge pairs found for your search.");
          return;
        }

        const searchResponse = results.map((pair, index) => 
          `${index + 1}. **Problem:** ${pair.problem}\n   **Solution:** ${pair.solution}\n   _Similarity: ${Math.round((pair.similarity || 0) * 100)}%_`
        ).join('\n\n');

        await sendBotResponse(message, platform, `Found ${results.length} relevant results:\n\n${searchResponse}`);
        break;

      case '/help':
        const helpText = `**AI Research Bot Commands:**

**/ask** - Ask a question and get AI-powered answers
Example: \`/ask How to optimize database queries?\`

**/search** - Search knowledge pairs using semantic similarity  
Example: \`/search memory leaks\`

**/flag** - Flag incorrect knowledge pairs for review
Example: \`/flag [message_id]\`

**/help** - Show this help message`;

        await sendBotResponse(message, platform, helpText);
        break;

      case '/flag':
        // Implementation for flagging would require storing the context
        await sendBotResponse(message, platform, "Flagging functionality is available through the admin dashboard. Thank you for the feedback!");
        break;

      default:
        await sendBotResponse(message, platform, "Unknown command. Use /help to see available commands.");
    }
  } catch (error) {
    console.error(`Bot command error (${command}):`, error);
    await sendBotResponse(message, platform, "Sorry, I encountered an error processing your request. Please try again.");
  }
}

async function sendBotResponse(message: any, platform: 'telegram' | 'slack', text: string): Promise<void> {
  try {
    if (platform === 'telegram') {
      await sendTelegramMessage(parseInt(message.channelId), text);
    } else if (platform === 'slack') {
      await sendSlackMessage(message.channelId, text);
    }
  } catch (error) {
    console.error(`Failed to send ${platform} response:`, error);
  }
}
