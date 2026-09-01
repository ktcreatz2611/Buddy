import { pgTable, uuid, text, integer, numeric, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces } from './workspaces';
import { users } from './users';
import { providers, models } from './providers';
import { messages } from './messages';
import { researchSessions } from './research';

export const usageRecords = pgTable('usage_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  providerId: uuid('provider_id').notNull().references(() => providers.id),
  modelId: uuid('model_id').notNull().references(() => models.id),
  messageId: uuid('message_id').references(() => messages.id),
  researchSessionId: uuid('research_session_id').references(() => researchSessions.id),
  operation: text('operation').notNull(),
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
  totalTokens: integer('total_tokens'),
  costEstimate: numeric('cost_estimate'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  index('idx_usage_records_workspace_created').on(table.workspaceId, table.createdAt),
  index('idx_usage_records_user').on(table.userId),
  index('idx_usage_records_provider').on(table.providerId),
  index('idx_usage_records_model').on(table.modelId),
  index('idx_usage_records_message').on(table.messageId),
  index('idx_usage_records_research_session').on(table.researchSessionId),
]);

export const usageRecordsRelations = relations(usageRecords, ({ one }) => ({
  workspace: one(workspaces, { fields: [usageRecords.workspaceId], references: [workspaces.id] }),
  user: one(users, { fields: [usageRecords.userId], references: [users.id] }),
  provider: one(providers, { fields: [usageRecords.providerId], references: [providers.id] }),
  model: one(models, { fields: [usageRecords.modelId], references: [models.id] }),
  message: one(messages, { fields: [usageRecords.messageId], references: [messages.id] }),
  researchSession: one(researchSessions, { fields: [usageRecords.researchSessionId], references: [researchSessions.id] }),
}));
