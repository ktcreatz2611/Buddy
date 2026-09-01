import { pgTable, uuid, text, integer, numeric, jsonb, timestamp, index, pgEnum, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { projects } from './projects';
import { models } from './providers';
import { documents } from './documents';

export const researchStatus = pgEnum('research_status', ['planning', 'investigating', 'analyzing', 'synthesizing', 'complete', 'cancelled', 'error']);
export const agentRole = pgEnum('agent_role', ['orchestrator', 'investigator', 'analyst']);
export const claimStatus = pgEnum('claim_status', ['verified', 'probable', 'uncertain', 'conflicting']);
export const questionStatus = pgEnum('question_status', ['open', 'answered', 'deferred']);

export const researchSessions = pgTable('research_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title'),
  question: text('question').notNull(),
  status: researchStatus('status').notNull().default('planning'),
  config: jsonb('config'),
  turnCount: integer('turn_count').default(0),
  totalTokensUsed: integer('total_tokens_used').default(0),
  totalCostEstimate: numeric('total_cost_estimate'),
  startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }),
  completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  index('idx_research_sessions_project').on(table.projectId),
]);

export const agentTurns = pgTable('agent_turns', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => researchSessions.id, { onDelete: 'cascade' }),
  role: agentRole('role').notNull(),
  content: jsonb('content').notNull(),
  modelId: uuid('model_id').references(() => models.id),
  tokenUsage: jsonb('token_usage'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  index('idx_agent_turns_session').on(table.sessionId),
]);

export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => researchSessions.id, { onDelete: 'cascade' }),
  url: text('url'),
  documentId: uuid('document_id').references(() => documents.id),
  title: text('title'),
  publisher: text('publisher'),
  publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
  retrievedAt: timestamp('retrieved_at', { withTimezone: true, mode: 'date' }).defaultNow(),
}, (table) => [
  index('idx_sources_session').on(table.sessionId),
  index('idx_sources_document').on(table.documentId),
]);

export const evidence = pgTable('evidence', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => researchSessions.id, { onDelete: 'cascade' }),
  sourceId: uuid('source_id').notNull().references(() => sources.id, { onDelete: 'cascade' }),
  excerpt: text('excerpt').notNull(),
  relevanceScore: numeric('relevance_score'),
  retrievedAt: timestamp('retrieved_at', { withTimezone: true, mode: 'date' }).defaultNow(),
}, (table) => [
  index('idx_evidence_session').on(table.sessionId),
  index('idx_evidence_source').on(table.sourceId),
]);

export const claims = pgTable('claims', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => researchSessions.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  status: claimStatus('status').notNull().default('uncertain'),
  confidence: numeric('confidence'),
  createdByTurnId: uuid('created_by_turn_id').references(() => agentTurns.id),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  index('idx_claims_session').on(table.sessionId),
]);

export const claimEvidence = pgTable('claim_evidence', {
  claimId: uuid('claim_id').notNull().references(() => claims.id, { onDelete: 'cascade' }),
  evidenceId: uuid('evidence_id').notNull().references(() => evidence.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.claimId, table.evidenceId] }),
  index('idx_claim_evidence_claim').on(table.claimId),
  index('idx_claim_evidence_evidence').on(table.evidenceId),
]);

export const researchQuestions = pgTable('research_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => researchSessions.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  status: questionStatus('status').notNull().default('open'),
  priority: integer('priority').default(0),
  parentQuestionId: uuid('parent_question_id'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  index('idx_research_questions_session').on(table.sessionId),
  index('idx_research_questions_parent').on(table.parentQuestionId),
]);

// Add Relations Below
export const researchSessionsRelations = relations(researchSessions, ({ one, many }) => ({
  project: one(projects, { fields: [researchSessions.projectId], references: [projects.id] }),
  turns: many(agentTurns),
  sources: many(sources),
  evidence: many(evidence),
  claims: many(claims),
  questions: many(researchQuestions),
}));

export const agentTurnsRelations = relations(agentTurns, ({ one }) => ({
  session: one(researchSessions, { fields: [agentTurns.sessionId], references: [researchSessions.id] }),
  model: one(models, { fields: [agentTurns.modelId], references: [models.id] }),
}));

export const sourcesRelations = relations(sources, ({ one, many }) => ({
  session: one(researchSessions, { fields: [sources.sessionId], references: [researchSessions.id] }),
  document: one(documents, { fields: [sources.documentId], references: [documents.id] }),
  evidence: many(evidence),
}));

export const evidenceRelations = relations(evidence, ({ one, many }) => ({
  session: one(researchSessions, { fields: [evidence.sessionId], references: [researchSessions.id] }),
  source: one(sources, { fields: [evidence.sourceId], references: [sources.id] }),
  claimLinks: many(claimEvidence),
}));

export const claimsRelations = relations(claims, ({ one, many }) => ({
  session: one(researchSessions, { fields: [claims.sessionId], references: [researchSessions.id] }),
  createdByTurn: one(agentTurns, { fields: [claims.createdByTurnId], references: [agentTurns.id] }),
  evidenceLinks: many(claimEvidence),
}));

export const claimEvidenceRelations = relations(claimEvidence, ({ one }) => ({
  claim: one(claims, { fields: [claimEvidence.claimId], references: [claims.id] }),
  evidence: one(evidence, { fields: [claimEvidence.evidenceId], references: [evidence.id] }),
}));

export const researchQuestionsRelations = relations(researchQuestions, ({ one, many }) => ({
  session: one(researchSessions, { fields: [researchQuestions.sessionId], references: [researchSessions.id] }),
  parent: one(researchQuestions, { fields: [researchQuestions.parentQuestionId], references: [researchQuestions.id], relationName: 'question_hierarchy' }),
  children: many(researchQuestions, { relationName: 'question_hierarchy' }),
}));
