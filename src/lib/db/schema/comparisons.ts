import { pgTable, uuid, text, timestamp, index, numeric, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { conversations } from './conversations';
import { models } from './providers';

/**
 * Stores requests for model comparisons.
 */
export const comparisons = pgTable('comparisons', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }),
  prompt: text('prompt').notNull(),
  status: text('status').notNull().default('pending'), // 'pending' | 'streaming' | 'complete' | 'error'
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

/**
 * Stores the individual AI responses within a comparison.
 */
export const comparisonResponses = pgTable('comparison_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  comparisonId: uuid('comparison_id').notNull().references(() => comparisons.id, { onDelete: 'cascade' }),
  modelId: uuid('model_id').references(() => models.id),
  providerId: text('provider_id').notNull(), // e.g., 'openai'
  modelKey: text('model_key').notNull(), // e.g., 'gpt-4o'
  modelName: text('model_name').notNull(), // display name
  content: text('content').notNull().default(''),
  status: text('status').notNull().default('pending'), // 'pending' | 'streaming' | 'complete' | 'error' | 'stopped'
  error: text('error'),
  latencyMs: integer('latency_ms'),
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
  totalTokens: integer('total_tokens'),
  estimatedCost: numeric('estimated_cost'),
  startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }),
  completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  index('idx_comparison_responses_comparison').on(table.comparisonId),
]);

export const comparisonsRelations = relations(comparisons, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [comparisons.conversationId],
    references: [conversations.id],
  }),
  responses: many(comparisonResponses),
}));

export const comparisonResponsesRelations = relations(comparisonResponses, ({ one }) => ({
  comparison: one(comparisons, {
    fields: [comparisonResponses.comparisonId],
    references: [comparisons.id],
  }),
  model: one(models, {
    fields: [comparisonResponses.modelId],
    references: [models.id],
  }),
}));
