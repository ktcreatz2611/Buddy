import { Worker, Job } from 'bullmq';
import { redis } from '@/lib/redis';
import { runOrchestrator } from '@/lib/research/orchestrator';
import { db } from '@/lib/db';
import { researchSessions } from '@/lib/db/schema/research';
import { eq } from 'drizzle-orm';
import { ResearchJobData } from './queues';

export const researchWorker = new Worker<ResearchJobData>(
  'research',
  async (job: Job<ResearchJobData>) => {
    const { sessionId } = job.data;
    try {
      await runOrchestrator(sessionId);
    } catch (error) {
      console.error(`Research job failed for session ${sessionId}:`, error);
      await db.update(researchSessions)
        .set({ status: 'error' })
        .where(eq(researchSessions.id, sessionId));
      redis.publish(`research:progress:${sessionId}`, JSON.stringify({ type: 'status', status: 'error' }));
      throw error;
    }
  },
  { connection: redis }
);

researchWorker.on('failed', (job, err) => {
  console.error(`Research Job ${job?.id} failed:`, err);
});
