import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, real, vector, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: text("platform").notNull(), // 'slack' or 'telegram'
  channelId: text("channel_id").notNull(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  processed: boolean("processed").default(false),
});

export const knowledgePairs = pgTable("knowledge_pairs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  problem: text("problem").notNull(),
  solution: text("solution").notNull(),
  sourceMessageId: uuid("source_message_id").references(() => messages.id, { onDelete: "cascade" }),
  confidenceScore: real("confidence_score").default(0.0),
  embedding: vector("embedding", { dimensions: 1536 }),
  validated: boolean("validated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messagesRelations = relations(messages, ({ many }) => ({
  knowledgePairs: many(knowledgePairs),
}));

export const knowledgePairsRelations = relations(knowledgePairs, ({ one }) => ({
  sourceMessage: one(messages, {
    fields: [knowledgePairs.sourceMessageId],
    references: [messages.id],
  }),
}));

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const insertKnowledgePairSchema = createInsertSchema(knowledgePairs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertKnowledgePair = z.infer<typeof insertKnowledgePairSchema>;
export type KnowledgePair = typeof knowledgePairs.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
