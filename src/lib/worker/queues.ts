import { Queue } from 'bullmq';
import { redis } from '@/lib/redis';

/** Queue for chat generation jobs */
export const chatGenerationQueue = new Queue('chat-generation', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24h
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

export interface ChatGenerationJobData {
  messageId: string;
  conversationId: string;
  providerId: string;
  modelId: string;
  modelKey: string;
  credentialId: string;  // Worker will decrypt the key itself
}

/** Queue for comparison generation jobs */
export const comparisonQueue = new Queue('comparison-generation', {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { age: 24 * 3600, count: 1000 },
    removeOnFail: { age: 7 * 24 * 3600 },
  },
});

export interface ComparisonJobData {
  comparisonResponseId: string;
  comparisonId: string;
  providerId: string;
  modelKey: string;
  credentialId: string;
  prompt: string;
}

/** Queue for document processing jobs */
export const documentProcessingQueue = new Queue('document-processing', {
  connection: redis,
  defaultJobOptions: { 
    attempts: 2, 
    backoff: { type: 'exponential', delay: 2000 } 
  },
});

export interface DocumentProcessingJobData {
  documentId: string;
  projectId: string;
}

/** Queue for research jobs */
export const researchQueue = new Queue('research', {
  connection: redis,
  defaultJobOptions: { attempts: 1 },
});

export interface ResearchJobData {
  sessionId: string;
}
