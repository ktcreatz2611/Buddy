import { db } from '@/lib/db';
import { researchSessions, claims, evidence, sources, agentTurns, researchQuestions } from '@/lib/db/schema/research';
import { eq } from 'drizzle-orm';

export interface ResearchReport {
  title: string;
  executiveSummary: string;
  researchQuestions: string[];
  methodology: { agents: string[]; tools: string[]; turns: number; models: string[] };
  keyFindings: Array<{ finding: string; confidence: string; evidenceCount: number }>;
  conflictingEvidence: Array<{ claim: string; supporting: string[]; refuting: string[] }>;
  analysis: string;
  limitations: string[];
  conclusion: string;
  sources: Array<{ url?: string; title?: string; publisher?: string; retrievedAt: string }>;
}

export async function generateReport(sessionId: string): Promise<ResearchReport> {
  const session = await db.query.researchSessions.findFirst({
    where: eq(researchSessions.id, sessionId)
  });
  if (!session) throw new Error('Session not found');

  const sessionClaims = await db.query.claims.findMany({ where: eq(claims.sessionId, sessionId) });
  const sessionSources = await db.query.sources.findMany({ where: eq(sources.sessionId, sessionId) });
  const questions = await db.query.researchQuestions.findMany({ where: eq(researchQuestions.sessionId, sessionId) });
  
  const report: ResearchReport = {
    title: session.title || session.question,
    executiveSummary: 'Auto-generated summary based on research.',
    researchQuestions: questions.map(q => q.question),
    methodology: {
      agents: ['investigator', 'analyst'],
      tools: ['web_search', 'document_search'],
      turns: session.turnCount || 0,
      models: []
    },
    keyFindings: sessionClaims.map(c => ({
      finding: c.text,
      confidence: c.confidence?.toString() || '0',
      evidenceCount: 0
    })),
    conflictingEvidence: [],
    analysis: 'Synthesis of findings...',
    limitations: ['Automated research may contain inaccuracies.'],
    conclusion: 'Final conclusion...',
    sources: sessionSources.map(s => ({
      url: s.url || undefined,
      title: s.title || undefined,
      publisher: s.publisher || undefined,
      retrievedAt: s.retrievedAt?.toISOString() || new Date().toISOString()
    }))
  };

  return report;
}
