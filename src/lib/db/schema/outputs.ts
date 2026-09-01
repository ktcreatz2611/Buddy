import { pgTable, uuid, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { conversations } from './conversations';
import { researchSessions } from './research';

export const generatedOutputs = pgTable('generated_outputs', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'set null' }),
  researchSessionId: uuid('research_session_id').references(() => researchSessions.id, { onDelete: 'set null' }),
  format: text('format').notNull(),
  storageKey: text('storage_key').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  index('idx_generated_outputs_conversation').on(table.conversationId),
  index('idx_generated_outputs_research_session').on(table.researchSessionId),
]);

export const generatedOutputsRelations = relations(generatedOutputs, ({ one }) => ({
  conversation: one(conversations, { fields: [generatedOutputs.conversationId], references: [conversations.id] }),
  researchSession: one(researchSessions, { fields: [generatedOutputs.researchSessionId], references: [researchSessions.id] }),
}));
