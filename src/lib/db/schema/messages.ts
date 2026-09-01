import { pgTable, uuid, text, jsonb, integer, numeric, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { conversations } from './conversations';
import { models, providers } from './providers';
import { attachments } from './attachments';

export const messageStatus = pgEnum('message_status', ['pending', 'streaming', 'complete', 'error', 'stopped']);
export const messageRole = pgEnum('message_role', ['system', 'user', 'assistant', 'tool']);

export type MessageContentBlockType = 'text' | 'code' | 'image' | 'citation' | 'tool_call' | 'tool_result';

export interface MessageContentBlock {
  type: MessageContentBlockType;
  [key: string]: any;
}

export type MessageContent = MessageContentBlock;

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id'),
  role: messageRole('role').notNull(),
  content: jsonb('content').notNull().$type<MessageContent[]>(),
  modelId: uuid('model_id').references(() => models.id),
  providerId: uuid('provider_id').references(() => providers.id),
  status: messageStatus('status').notNull().default('complete'),
  error: jsonb('error'),
  tokenUsage: jsonb('token_usage').$type<TokenUsage | null>(),
  costEstimate: numeric('cost_estimate', { precision: 10, scale: 6 }),
  latencyMs: integer('latency_ms'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  index('idx_messages_conversation_parent').on(table.conversationId, table.parentId),
  index('idx_messages_parent').on(table.parentId),
]);

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  parent: one(messages, {
    fields: [messages.parentId],
    references: [messages.id],
    relationName: 'message_parent_child'
  }),
  children: many(messages, {
    relationName: 'message_parent_child'
  }),
  model: one(models, {
    fields: [messages.modelId],
    references: [models.id],
  }),
  provider: one(providers, {
    fields: [messages.providerId],
    references: [providers.id],
  }),
  attachments: many(attachments),
}));
