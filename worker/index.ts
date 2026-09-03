import 'dotenv/config';
import { Worker } from 'bullmq';
import { redis } from '@/lib/redis';
import { processChatGeneration } from '@/lib/worker/chat-generation';
import { comparisonWorker } from '@/lib/worker/comparison-generation';
import { documentProcessingWorker } from '@/lib/worker/document-processing';
import { researchWorker } from '@/lib/worker/research-worker';

console.log('🚀 Starting Buddy background workers...');

const chatWorker = new Worker('chat-generation', processChatGeneration, {
  connection: redis,
  concurrency: 5,
});

chatWorker.on('completed', (job) => {
  console.log(`[ChatWorker] Job ${job.id} completed`);
});

chatWorker.on('failed', (job, err) => {
  console.error(`[ChatWorker] Job ${job?.id} failed:`, err);
});

console.log('✅ BullMQ Workers active: [chat-generation, comparison-generation, document-processing, research]');

const shutdown = async () => {
  console.log('Stopping workers...');
  await Promise.all([
    chatWorker.close(),
    comparisonWorker.close(),
    documentProcessingWorker.close(),
    researchWorker.close(),
  ]);
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
