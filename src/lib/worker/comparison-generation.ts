import { Worker, Job } from 'bullmq';
import { redis } from '@/lib/redis';
import { ComparisonJobData } from './queues';
import { db } from '@/lib/db';
import { comparisons, comparisonResponses, credentials } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { providerRegistry } from '@/lib/providers';
import { decryptApiKey } from '@/lib/security/encryption';

export const comparisonWorker = new Worker(
  'comparison-generation',
  async (job: Job<ComparisonJobData>) => {
    const { comparisonResponseId, comparisonId, providerId, modelKey, credentialId, prompt } = job.data;
    
    await db.update(comparisonResponses)
      .set({ status: 'streaming', startedAt: new Date() })
      .where(eq(comparisonResponses.id, comparisonResponseId));
    
    try {
      const cred = await db.query.credentials.findFirst({
        where: eq(credentials.id, credentialId),
      });
      if (!cred) throw new Error('Credential not found');
      
      const apiKey = await decryptApiKey(cred.encryptedApiKey);
      const adapter = providerRegistry.get(providerId);
      
      const stream = adapter.chatStream(
        {
          model: modelKey,
          messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
        },
        apiKey,
      );
      
      let fullContent = '';
      let lastFlush = Date.now();
      const FLUSH_INTERVAL = 500;
      let inputTokens = 0;
      let outputTokens = 0;
      let totalTokens = 0;
      
      for await (const chunk of stream) {
        const isCancelled = await redis.get(`cancel:comparison:response:${comparisonResponseId}`);
        if (isCancelled) {
          throw new Error('STOPPED');
        }

        if (chunk.type === 'text-delta') {
          fullContent += chunk.textDelta;
          await redis.publish(
            `comparison:response:${comparisonResponseId}`,
            JSON.stringify({ type: 'delta', text: chunk.textDelta })
          );
        } else if (chunk.type === 'finish') {
          inputTokens = chunk.usage?.inputTokens ?? 0;
          outputTokens = chunk.usage?.outputTokens ?? 0;
          totalTokens = chunk.usage?.totalTokens ?? 0;
        } else if (chunk.type === 'error') {
          throw new Error(chunk.error?.message ?? 'Provider error');
        }

        if (Date.now() - lastFlush > FLUSH_INTERVAL) {
          await db.update(comparisonResponses)
            .set({ content: fullContent })
            .where(eq(comparisonResponses.id, comparisonResponseId));
          lastFlush = Date.now();
        }
      }

      const latencyMs = Date.now() - (job.processedOn ?? Date.now());
      const cost = adapter.estimateCost({ inputTokens, outputTokens, totalTokens }, modelKey);

      await redis.publish(
        `comparison:response:${comparisonResponseId}`,
        JSON.stringify({ type: 'complete', latencyMs, inputTokens, outputTokens, totalTokens, estimatedCost: cost?.totalCost ?? null })
      );
      
      await db.update(comparisonResponses)
        .set({
          status: 'complete',
          content: fullContent,
          completedAt: new Date(),
          latencyMs,
          inputTokens,
          outputTokens,
          totalTokens,
          estimatedCost: cost?.totalCost?.toFixed(6) ?? null,
        })
        .where(eq(comparisonResponses.id, comparisonResponseId));
        
    } catch (error: any) {
      if (error.message === 'STOPPED') {
        await db.update(comparisonResponses)
          .set({ status: 'stopped', completedAt: new Date() })
          .where(eq(comparisonResponses.id, comparisonResponseId));
        await redis.publish(`comparison:response:${comparisonResponseId}`, JSON.stringify({ type: 'error', message: 'Stopped by user' }));
      } else {
        await db.update(comparisonResponses)
          .set({ status: 'error', error: error.message || 'Unknown error', completedAt: new Date() })
          .where(eq(comparisonResponses.id, comparisonResponseId));
        await redis.publish(`comparison:response:${comparisonResponseId}`, JSON.stringify({ type: 'error', message: error.message || 'Unknown error' }));
      }
    } finally {
      const allResponses = await db.query.comparisonResponses.findMany({
        where: eq(comparisonResponses.comparisonId, comparisonId),
      });
      
      const allDone = allResponses.every(r => r.status !== 'pending' && r.status !== 'streaming');
      if (allDone) {
        await db.update(comparisons)
          .set({ status: 'complete', updatedAt: new Date() })
          .where(eq(comparisons.id, comparisonId));
      }
    }
  },
  { connection: redis }
);
