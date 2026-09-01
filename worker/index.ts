import 'dotenv/config';
import { Worker } from 'bullmq';
import { createRedisConnection } from '../src/lib/redis';
import { processChatGeneration } from '../src/lib/worker/chat-generation';
import type { ChatGenerationJobData } from '../src/lib/worker/queues';

// Register provider adapters
import '../src/lib/providers/adapters';

const connection = createRedisConnection();

const chatWorker = new Worker<ChatGenerationJobData>(
  'chat-generation',
  async (job) => processChatGeneration(job),
  {
    connection,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000,
    },
  }
);

chatWorker.on('completed', (job) => {
  console.log(`[worker] Job ${job.id} completed for message ${job.data.messageId}`);
});

chatWorker.on('failed', (job, err) => {
  console.error(`[worker] Job ${job?.id} failed:`, err.message);
});

chatWorker.on('error', (err) => {
  console.error('[worker] Worker error:', err);
});

console.log('[worker] Chat generation worker started');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[worker] Shutting down...');
  await chatWorker.close();
  await connection.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[worker] Shutting down...');
  await chatWorker.close();
  await connection.quit();
  process.exit(0);
});
