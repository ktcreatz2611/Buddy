import { pgTable, uuid, text, boolean, integer, numeric, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces } from './workspaces';

export const providers = pgTable('providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(), // 'openai'|'anthropic'|etc
  name: text('name').notNull(),
  baseUrl: text('base_url'),
  isEnabled: boolean('is_enabled').default(true),
  executionContext: text('execution_context').default('server'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const credentials = pgTable('credentials', {
  id: uuid('id').primaryKey().defaultRandom(),
  providerId: uuid('provider_id').notNull().references(() => providers.id, { onDelete: 'cascade' }),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  encryptedApiKey: text('encrypted_api_key').notNull(),
  label: text('label'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  index('idx_credentials_provider').on(table.providerId),
  index('idx_credentials_workspace').on(table.workspaceId),
]);

export const models = pgTable('models', {
  id: uuid('id').primaryKey().defaultRandom(),
  providerId: uuid('provider_id').notNull().references(() => providers.id, { onDelete: 'cascade' }),
  modelId: text('model_id').notNull(), // e.g. 'gpt-4o'
  name: text('name').notNull(),
  capabilities: jsonb('capabilities'),
  inputPricePerMToken: numeric('input_price_per_m_token'),
  outputPricePerMToken: numeric('output_price_per_m_token'),
  maxContextTokens: integer('max_context_tokens'),
  maxOutputTokens: integer('max_output_tokens'),
  isEnabled: boolean('is_enabled').default(true),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  index('idx_models_provider').on(table.providerId),
]);

export const providersRelations = relations(providers, ({ many }) => ({
  credentials: many(credentials),
  models: many(models),
}));

export const credentialsRelations = relations(credentials, ({ one }) => ({
  provider: one(providers, {
    fields: [credentials.providerId],
    references: [providers.id],
  }),
  workspace: one(workspaces, {
    fields: [credentials.workspaceId],
    references: [workspaces.id],
  }),
}));

export const modelsRelations = relations(models, ({ one }) => ({
  provider: one(providers, {
    fields: [models.providerId],
    references: [providers.id],
  }),
}));
