import { pgTable, uuid, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces } from './workspaces';
import { users } from './users';

export const auditEvents = pgTable('audit_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'set null' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: uuid('entity_id'),
  details: jsonb('details'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  index('idx_audit_events_workspace').on(table.workspaceId),
  index('idx_audit_events_user').on(table.userId),
  index('idx_audit_events_entity').on(table.entityType, table.entityId),
]);

export const auditEventsRelations = relations(auditEvents, ({ one }) => ({
  workspace: one(workspaces, { fields: [auditEvents.workspaceId], references: [workspaces.id] }),
  user: one(users, { fields: [auditEvents.userId], references: [users.id] }),
}));
