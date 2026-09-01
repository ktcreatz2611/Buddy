import { pgTable, uuid, text, jsonb, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';

export const memoryScope = pgEnum('memory_scope', ['global', 'workspace', 'project', 'conversation']);
export const memorySource = pgEnum('memory_source', ['user', 'agent_extracted']);

export const memories = pgTable('memories', {
  id: uuid('id').primaryKey().defaultRandom(),
  scope: memoryScope('scope').notNull(),
  scopeId: uuid('scope_id'),
  key: text('key').notNull(),
  value: jsonb('value').notNull(),
  source: memorySource('source').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  index('idx_memories_scope_scopeId').on(table.scope, table.scopeId),
]);
