import { pgTable, uuid, text, integer, jsonb, timestamp, index, customType } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { projects } from './projects';

export const vector = customType<{ data: number[]; driverParam: string }>({
  dataType(config) {
    return `vector(${(config as any)?.dimensions ?? 384})`;
  },
  toDriver(value) {
    return `[${value.join(',')}]`;
  },
  fromDriver(value) {
    return JSON.parse(value as string);
  },
});

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  mimeType: text('mime_type'),
  sizeBytes: integer('size_bytes'),
  storageKey: text('storage_key').unique(),
  pageCount: integer('page_count'),
  metadata: jsonb('metadata'),
  status: text('status').default('processing'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  index('idx_documents_project').on(table.projectId),
]);

export const documentChunks = pgTable('document_chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  chunkIndex: integer('chunk_index').notNull(),
  content: text('content').notNull(),
  pageNumber: integer('page_number'),
  sectionPath: text('section_path'),
  tokenCount: integer('token_count'),
  embedding: vector('embedding'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  index('idx_document_chunks_document').on(table.documentId),
  // Note: HNSW index needs to be created via raw SQL since it's highly specific to pgvector
]);

export const documentsRelations = relations(documents, ({ one, many }) => ({
  project: one(projects, {
    fields: [documents.projectId],
    references: [projects.id],
  }),
  chunks: many(documentChunks),
}));

export const documentChunksRelations = relations(documentChunks, ({ one }) => ({
  document: one(documents, {
    fields: [documentChunks.documentId],
    references: [documents.id],
  }),
}));
