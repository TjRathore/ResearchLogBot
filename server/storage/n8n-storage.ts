import { n8nService, type KnowledgePair, type Message } from '../services/n8n';
import { generateEmbedding } from '../services/openai';

// Storage adapter that uses n8n as the backend
export class N8nStorage {
  async createMessage(data: {
    platform: string;
    channelId: string;
    userId: string;
    content: string;
    processed?: boolean;
  }): Promise<any> {
    const message = await n8nService.createMessage({
      platform: data.platform,
      channel_id: data.channelId,
      user_id: data.userId,
      content: data.content,
      processed: data.processed || false
    });

    // Trigger processing workflow
    if (!data.processed) {
      await n8nService.processMessage(message);
    }

    return message;
  }

  async getRecentMessages(limit: number = 50): Promise<any[]> {
    try {
      const result = await n8nService.getMessages({ limit });
      return result.data;
    } catch (error) {
      // Return dummy data when n8n is not configured
      return this.getDummyMessages().slice(0, limit);
    }
  }

  private getDummyMessages(): any[] {
    return [
      {
        id: "msg_1736782123465_abc001",
        platform: "slack",
        channel_id: "#engineering",
        user_id: "U12345",
        content: "How do I optimize React component performance? My app is getting slow with complex state.",
        processed: true,
        timestamp: "2024-01-13T10:15:00Z"
      },
      {
        id: "msg_1736782123466_abc002",
        platform: "slack",
        channel_id: "#engineering",
        user_id: "U67890",
        content: "Use React.memo for functional components, useMemo for expensive calculations, and useCallback for function references to prevent unnecessary re-renders.",
        processed: true,
        timestamp: "2024-01-13T10:15:30Z"
      },
      {
        id: "msg_1736782123467_abc003",
        platform: "telegram",
        channel_id: "@devhelp",
        user_id: "123456789",
        content: "What's the best way to handle async operations in JavaScript?",
        processed: true,
        timestamp: "2024-01-13T09:30:00Z"
      },
      {
        id: "msg_1736782123468_abc004",
        platform: "telegram",
        channel_id: "@devhelp",
        user_id: "987654321",
        content: "Use async/await for cleaner code. Always wrap in try-catch blocks and handle errors properly.",
        processed: true,
        timestamp: "2024-01-13T09:30:45Z"
      },
      {
        id: "msg_1736782123469_abc005",
        platform: "slack",
        channel_id: "#database",
        user_id: "U11111",
        content: "How can I improve database query performance? Our queries are taking too long.",
        processed: false,
        timestamp: "2024-01-13T08:45:00Z"
      },
      {
        id: "msg_1736782123470_abc006",
        platform: "slack",
        channel_id: "#devops",
        user_id: "U22222",
        content: "What are Docker best practices for production deployments?",
        processed: true,
        timestamp: "2024-01-13T07:20:00Z"
      },
      {
        id: "msg_1736782123471_abc007",
        platform: "telegram",
        channel_id: "@security",
        user_id: "555666777",
        content: "How do I secure REST APIs effectively? Looking for comprehensive security checklist.",
        processed: true,
        timestamp: "2024-01-12T16:30:00Z"
      },
      {
        id: "msg_1736782123472_abc008",
        platform: "slack",
        channel_id: "#architecture",
        user_id: "U33333",
        content: "What's the difference between SQL and NoSQL databases? When should I use each?",
        processed: false,
        timestamp: "2024-01-12T15:45:00Z"
      },
      {
        id: "msg_1736782123473_abc009",
        platform: "slack",
        channel_id: "#frontend",
        user_id: "U44444",
        content: "How can I implement real-time features in web apps? Need bidirectional communication.",
        processed: true,
        timestamp: "2024-01-12T14:15:00Z"
      },
      {
        id: "msg_1736782123474_abc010",
        platform: "telegram",
        channel_id: "@architecture",
        user_id: "888999000",
        content: "What are microservices design patterns? Building distributed system.",
        processed: true,
        timestamp: "2024-01-12T13:00:00Z"
      },
      {
        id: "msg_1736782123475_abc011",
        platform: "slack",
        channel_id: "#react",
        user_id: "U55555",
        content: "How do I handle state management in large React apps? Redux vs alternatives?",
        processed: false,
        timestamp: "2024-01-12T11:30:00Z"
      },
      {
        id: "msg_1736782123476_abc012",
        platform: "telegram",
        channel_id: "@javascript",
        user_id: "111222333",
        content: "What are the latest JavaScript ES2024 features I should know about?",
        processed: false,
        timestamp: "2024-01-12T10:15:00Z"
      },
      {
        id: "msg_1736782123477_abc013",
        platform: "slack",
        channel_id: "#testing",
        user_id: "U66666",
        content: "How do I write effective unit tests for React components?",
        processed: false,
        timestamp: "2024-01-12T09:45:00Z"
      },
      {
        id: "msg_1736782123478_abc014",
        platform: "slack",
        channel_id: "#deployment",
        user_id: "U77777",
        content: "What's the best CI/CD pipeline setup for modern web applications?",
        processed: false,
        timestamp: "2024-01-12T08:30:00Z"
      },
      {
        id: "msg_1736782123479_abc015",
        platform: "telegram",
        channel_id: "@performance",
        user_id: "444555666",
        content: "How can I optimize API response times? Looking for backend performance tips.",
        processed: false,
        timestamp: "2024-01-12T07:20:00Z"
      }
    ];
  }

  async createKnowledgePair(data: {
    problem: string;
    solution: string;
    confidenceScore: number;
    embedding?: number[];
    validated?: boolean;
    sourceMessageId?: string;
  }): Promise<any> {
    return await n8nService.createKnowledgePair({
      problem: data.problem,
      solution: data.solution,
      confidence_score: data.confidenceScore,
      validated: data.validated || false,
      source_platform: 'system',
      source_channel: 'api'
    });
  }

  async getKnowledgePairs(): Promise<any[]> {
    try {
      const result = await n8nService.getKnowledgePairs();
      return result.data;
    } catch (error) {
      // Return dummy data when n8n is not configured
      return this.getDummyKnowledgePairs();
    }
  }

  private getDummyKnowledgePairs(): any[] {
    return [
      {
        id: "kp_1736782123456_abc123",
        problem: "How do I optimize React component performance?",
        solution: "Use React.memo for functional components, useMemo for expensive calculations, and useCallback for function references to prevent unnecessary re-renders.",
        confidence_score: 0.92,
        validated: true,
        created_at: "2024-01-13T10:15:30Z",
        source_platform: "slack",
        source_channel: "#engineering"
      },
      {
        id: "kp_1736782123457_def456",
        problem: "What's the best way to handle async operations in JavaScript?",
        solution: "Use async/await for cleaner code. Always wrap in try-catch blocks and handle errors properly. Consider using Promise.all() for concurrent operations.",
        confidence_score: 0.88,
        validated: true,
        created_at: "2024-01-13T09:30:45Z",
        source_platform: "telegram",
        source_channel: "@devhelp"
      },
      {
        id: "kp_1736782123458_ghi789",
        problem: "How can I improve database query performance?",
        solution: "Add proper indexes, use EXPLAIN to analyze query plans, avoid N+1 queries with proper joins or batching, and consider caching for frequently accessed data.",
        confidence_score: 0.85,
        validated: false,
        created_at: "2024-01-13T08:45:22Z",
        source_platform: "slack",
        source_channel: "#database"
      },
      {
        id: "kp_1736782123459_jkl012",
        problem: "What are Docker best practices for production?",
        solution: "Use multi-stage builds, run as non-root user, minimize layers, use specific image tags, implement health checks, and regularly update base images for security.",
        confidence_score: 0.91,
        validated: true,
        created_at: "2024-01-13T07:20:15Z",
        source_platform: "slack",
        source_channel: "#devops"
      },
      {
        id: "kp_1736782123460_mno345",
        problem: "How do I secure REST APIs effectively?",
        solution: "Implement proper authentication (JWT/OAuth), use HTTPS, validate all inputs, apply rate limiting, use CORS correctly, and implement proper error handling without exposing sensitive data.",
        confidence_score: 0.89,
        validated: true,
        created_at: "2024-01-12T16:30:10Z",
        source_platform: "telegram",
        source_channel: "@security"
      },
      {
        id: "kp_1736782123461_pqr678",
        problem: "What's the difference between SQL and NoSQL databases?",
        solution: "SQL databases offer ACID compliance and structured relationships but less flexibility. NoSQL provides better scalability and flexibility for unstructured data but with eventual consistency trade-offs.",
        confidence_score: 0.83,
        validated: false,
        created_at: "2024-01-12T15:45:33Z",
        source_platform: "slack",
        source_channel: "#architecture"
      },
      {
        id: "kp_1736782123462_stu901",
        problem: "How can I implement real-time features in web apps?",
        solution: "Use WebSockets for bidirectional communication, Server-Sent Events for server-to-client updates, or WebRTC for peer-to-peer. Consider socket.io for easier WebSocket implementation.",
        confidence_score: 0.87,
        validated: true,
        created_at: "2024-01-12T14:15:28Z",
        source_platform: "slack",
        source_channel: "#frontend"
      },
      {
        id: "kp_1736782123463_vwx234",
        problem: "What are microservices design patterns?",
        solution: "Key patterns include API Gateway, Circuit Breaker, Service Discovery, Event Sourcing, CQRS, and Saga pattern for distributed transactions. Focus on service boundaries and data ownership.",
        confidence_score: 0.90,
        validated: true,
        created_at: "2024-01-12T13:00:55Z",
        source_platform: "telegram",
        source_channel: "@architecture"
      },
      {
        id: "kp_1736782123464_yzab567",
        problem: "How do I handle state management in large React apps?",
        solution: "Consider Redux Toolkit for complex state, Zustand for simpler needs, or React Query for server state. Use context sparingly and prefer component composition over prop drilling.",
        confidence_score: 0.86,
        validated: false,
        created_at: "2024-01-12T11:30:42Z",
        source_platform: "slack",
        source_channel: "#react"
      }
    ];
  }

  async getKnowledgePairById(id: string): Promise<any> {
    try {
      const result = await n8nService.getKnowledgePairs();
      return result.data.find((pair: any) => pair.id === id) || null;
    } catch (error) {
      const dummyPairs = this.getDummyKnowledgePairs();
      return dummyPairs.find((pair: any) => pair.id === id) || null;
    }
  }

  async updateKnowledgePair(id: string, updates: any): Promise<any> {
    return await n8nService.updateKnowledgePair(id, updates);
  }

  async validateKnowledgePair(id: string): Promise<any> {
    await n8nService.validateKnowledgePair(id);
    return await this.updateKnowledgePair(id, { validated: true });
  }

  async flagKnowledgePair(id: string): Promise<any> {
    await n8nService.flagKnowledgePair(id);
    return await this.updateKnowledgePair(id, { flagged: true });
  }

  async searchKnowledgePairsByEmbedding(embedding: number[], limit: number = 5): Promise<any[]> {
    // For n8n integration, we'll use text-based search since vector search requires special setup
    return [];
  }

  async searchKnowledgePairsByKeyword(query: string, limit: number = 10): Promise<any[]> {
    try {
      return await n8nService.searchKnowledgePairs(query, { limit });
    } catch (error) {
      // Fallback to simple text search on dummy data
      const dummyPairs = this.getDummyKnowledgePairs();
      const searchTerms = query.toLowerCase().split(' ');
      
      const results = dummyPairs.filter((pair: any) => {
        const text = `${pair.problem} ${pair.solution}`.toLowerCase();
        return searchTerms.some(term => text.includes(term));
      });
      
      return results.slice(0, limit);
    }
  }

  async getKnowledgePairStats(): Promise<{
    total: number;
    validated: number;
    pending: number;
    flagged: number;
  }> {
    try {
      const stats = await n8nService.getStats();
      return {
        total: stats.knowledgePairs || 0,
        validated: stats.validated || 0,
        pending: stats.pending || 0,
        flagged: stats.flagged || 0
      };
    } catch (error) {
      // Return dummy stats when n8n is not configured
      const knowledgePairs = this.getDummyKnowledgePairs();
      const validated = knowledgePairs.filter(pair => pair.validated).length;
      const pending = knowledgePairs.filter(pair => !pair.validated && pair.confidence_score >= 0.7).length;
      const flagged = knowledgePairs.filter(pair => pair.confidence_score < 0.7).length;
      
      return {
        total: knowledgePairs.length,
        validated,
        pending,
        flagged
      };
    }
  }

  // Utility methods for processing
  async getUnprocessedMessages(): Promise<any[]> {
    const result = await n8nService.getMessages({ processed: false });
    return result.data;
  }

  async markMessageProcessed(id: string): Promise<void> {
    // This would typically be handled by n8n workflows
    console.log(`Marking message ${id} as processed`);
  }
}

export const n8nStorage = new N8nStorage();