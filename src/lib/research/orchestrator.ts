import { db } from '@/lib/db';
import { researchSessions, agentTurns, claims, researchQuestions } from '@/lib/db/schema/research';
import { eq, desc } from 'drizzle-orm';
import { redis } from '@/lib/redis';
import { embedTexts } from '@/lib/documents/embedder';
import { generateReport } from './report-generator';

export interface ResearchConfig {
  maxTurns: number;         // default 20
  maxTokens: number;        // total token budget, default 100000
  maxWallClockSeconds: number; // default 600 (10 min)
  investigatorModelId: string;
  analystModelId: string;
  credentialId: string;
}

export interface OrchestratorState {
  sessionId: string;
  status: string;
  turnCount: number;
  totalTokensUsed: number;
  openQuestions: Array<{ id: string; question: string; priority: number }>;
  claims: Array<{ id: string; text: string; status: string; confidence: number }>;
  shouldSynthesize: boolean;
  reason?: string;
}

function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] ** 2;
    normB += vecB[i] ** 2;
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function runOrchestrator(sessionId: string): Promise<void> {
  const session = await db.query.researchSessions.findFirst({
    where: eq(researchSessions.id, sessionId)
  });
  if (!session) throw new Error('Session not found');

  const config = session.config as unknown as ResearchConfig;
  const maxTurns = config?.maxTurns || 20;
  const maxTokens = config?.maxTokens || 100000;
  const maxWallClockSeconds = config?.maxWallClockSeconds || 600;

  const startTime = session.startedAt?.getTime() || Date.now();

  let turnCount = session.turnCount || 0;
  let totalTokensUsed = session.totalTokensUsed || 0;

  await db.update(researchSessions).set({ status: 'investigating' }).where(eq(researchSessions.id, sessionId));
  redis.publish(`research:progress:${sessionId}`, JSON.stringify({ type: 'status', status: 'investigating' }));

  while (true) {
    const cancelFlag = await redis.get(`research:cancel:${sessionId}`);
    if (cancelFlag) {
      await db.update(researchSessions).set({ status: 'cancelled' }).where(eq(researchSessions.id, sessionId));
      redis.publish(`research:progress:${sessionId}`, JSON.stringify({ type: 'status', status: 'cancelled' }));
      return;
    }

    if (turnCount >= maxTurns || totalTokensUsed >= maxTokens || (Date.now() - startTime) / 1000 >= maxWallClockSeconds) {
      break;
    }

    const openQs = await db.query.researchQuestions.findMany({
      where: (q, { and, eq }) => and(eq(q.sessionId, sessionId), eq(q.status, 'open')),
    });
    if (openQs.length === 0) {
      break; // No more questions
    }

    const recentTurns = await db.query.agentTurns.findMany({
      where: eq(agentTurns.sessionId, sessionId),
      orderBy: [desc(agentTurns.createdAt)],
      limit: 3
    });

    if (recentTurns.length >= 3) {
      // Check diminishing returns
      // this is a simplified stub, full impl would extract texts and embed
      const texts = recentTurns.map(t => JSON.stringify(t.content));
      const embeddings = await embedTexts(texts);
      if (embeddings.length === 3) {
        const sim1 = cosineSimilarity(embeddings[0], embeddings[1]);
        const sim2 = cosineSimilarity(embeddings[1], embeddings[2]);
        if (sim1 > 0.9 && sim2 > 0.9) {
          break;
        }
      }
    }

    const role = turnCount % 2 === 0 ? 'investigator' : 'analyst';

    // Execute one turn (stub for agent invocation)
    const turnData = {
      role,
      content: { findings: "mock findings", claims: [], evidence: [], newQuestions: [] },
      modelId: role === 'investigator' ? config.investigatorModelId : config.analystModelId,
      tokenUsage: { total: 100 }
    };

    await db.insert(agentTurns).values({
      sessionId,
      role: role as any,
      content: turnData.content,
      modelId: turnData.modelId,
      tokenUsage: turnData.tokenUsage
    });
    redis.publish(`research:progress:${sessionId}`, JSON.stringify({ type: 'turn', role }));

    turnCount++;
    totalTokensUsed += 100;
    
    await db.update(researchSessions).set({
      turnCount,
      totalTokensUsed
    }).where(eq(researchSessions.id, sessionId));
  }

  await db.update(researchSessions).set({ status: 'synthesizing' }).where(eq(researchSessions.id, sessionId));
  redis.publish(`research:progress:${sessionId}`, JSON.stringify({ type: 'status', status: 'synthesizing' }));

  await generateReport(sessionId);

  await db.update(researchSessions).set({ status: 'complete', completedAt: new Date() }).where(eq(researchSessions.id, sessionId));
  redis.publish(`research:progress:${sessionId}`, JSON.stringify({ type: 'status', status: 'complete' }));
  redis.publish(`research:progress:${sessionId}`, JSON.stringify({ type: 'done' }));
}
