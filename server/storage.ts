import { 
  messages, 
  knowledgePairs, 
  users, 
  type User, 
  type InsertUser, 
  type Message, 
  type InsertMessage,
  type KnowledgePair,
  type InsertKnowledgePair
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, asc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getUnprocessedMessages(): Promise<Message[]>;
  markMessageAsProcessed(id: string): Promise<void>;
  getRecentMessages(limit?: number): Promise<Message[]>;
  
  // Knowledge Pairs
  createKnowledgePair(pair: InsertKnowledgePair): Promise<KnowledgePair>;
  getKnowledgePairs(limit?: number, offset?: number): Promise<KnowledgePair[]>;
  getKnowledgePairById(id: string): Promise<KnowledgePair | undefined>;
  updateKnowledgePair(id: string, updates: Partial<KnowledgePair>): Promise<KnowledgePair>;
  deleteKnowledgePair(id: string): Promise<void>;
  searchKnowledgePairsByEmbedding(embedding: number[], limit?: number): Promise<(KnowledgePair & { similarity: number })[]>;
  searchKnowledgePairsByKeyword(query: string, limit?: number): Promise<KnowledgePair[]>;
  getKnowledgePairStats(): Promise<{
    total: number;
    validated: number;
    pending: number;
    flagged: number;
  }>;
  
  // Voting functionality
  voteKnowledgePair(id: string, voteType: 'upvote' | 'downvote'): Promise<any>;
  getRelatedKnowledgePairs(id: string, limit?: number): Promise<any[]>;
  incrementViews(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getUnprocessedMessages(): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.processed, false))
      .orderBy(asc(messages.timestamp));
  }

  async markMessageAsProcessed(id: string): Promise<void> {
    await db
      .update(messages)
      .set({ processed: true })
      .where(eq(messages.id, id));
  }

  async getRecentMessages(limit = 50): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .orderBy(desc(messages.timestamp))
      .limit(limit);
  }

  async createKnowledgePair(pair: InsertKnowledgePair): Promise<KnowledgePair> {
    const [newPair] = await db
      .insert(knowledgePairs)
      .values({
        ...pair,
        updatedAt: new Date(),
      })
      .returning();
    return newPair;
  }

  async getKnowledgePairs(limit = 50, offset = 0): Promise<KnowledgePair[]> {
    return db
      .select()
      .from(knowledgePairs)
      .orderBy(desc(knowledgePairs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getKnowledgePairById(id: string): Promise<KnowledgePair | undefined> {
    const [pair] = await db
      .select()
      .from(knowledgePairs)
      .where(eq(knowledgePairs.id, id));
    return pair || undefined;
  }

  async updateKnowledgePair(id: string, updates: Partial<KnowledgePair>): Promise<KnowledgePair> {
    const [updatedPair] = await db
      .update(knowledgePairs)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(knowledgePairs.id, id))
      .returning();
    return updatedPair;
  }

  async deleteKnowledgePair(id: string): Promise<void> {
    await db
      .delete(knowledgePairs)
      .where(eq(knowledgePairs.id, id));
  }

  async searchKnowledgePairsByEmbedding(embedding: number[], limit = 10): Promise<(KnowledgePair & { similarity: number })[]> {
    const embeddingStr = `[${embedding.join(',')}]`;
    
    const results = await db.execute(sql`
      SELECT *, 
             1 - (embedding <=> ${embeddingStr}::vector) as similarity
      FROM knowledge_pairs 
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> ${embeddingStr}::vector
      LIMIT ${limit}
    `);

    return results.rows as (KnowledgePair & { similarity: number })[];
  }

  async searchKnowledgePairsByKeyword(query: string, limit = 10): Promise<KnowledgePair[]> {
    return db.execute(sql`
      SELECT * FROM knowledge_pairs 
      WHERE 
        problem ILIKE ${'%' + query + '%'} OR 
        solution ILIKE ${'%' + query + '%'}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `).then(result => result.rows as KnowledgePair[]);
  }

  async getKnowledgePairStats(): Promise<{
    total: number;
    validated: number;
    pending: number;
    flagged: number;
  }> {
    const totalResult = await db.execute(sql`SELECT COUNT(*) as count FROM knowledge_pairs`);
    const validatedResult = await db.execute(sql`SELECT COUNT(*) as count FROM knowledge_pairs WHERE validated = true`);
    const pendingResult = await db.execute(sql`SELECT COUNT(*) as count FROM knowledge_pairs WHERE validated = false AND confidence_score >= 0.7`);
    const flaggedResult = await db.execute(sql`SELECT COUNT(*) as count FROM knowledge_pairs WHERE confidence_score < 0.7`);

    return {
      total: Number(totalResult.rows[0]?.count || 0),
      validated: Number(validatedResult.rows[0]?.count || 0),
      pending: Number(pendingResult.rows[0]?.count || 0),
      flagged: Number(flaggedResult.rows[0]?.count || 0),
    };
  }
}

export const storage = new DatabaseStorage();
