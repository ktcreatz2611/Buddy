import { Job } from 'bullmq';
import { db } from '@/lib/db';
import { messages, conversations, credentials } from '@/lib/db/schema';
import { providerRegistry } from '@/lib/providers';
import { ChatGenerationJobData } from './queues';
import { NormalizedMessage, ContentBlock } from '@/lib/providers/types';
import { redis, createRedisConnection } from '@/lib/redis';
import { eq } from 'drizzle-orm';
import { decryptApiKey } from '@/lib/security/encryption';

export async function processChatGeneration(job: Job<ChatGenerationJobData>) {
  const { messageId, conversationId, providerId, modelId, modelKey, credentialId } = job.data;
  
  const pubRedis = createRedisConnection();
  const channelKey = `stream:message:${messageId}`;
  const cancelKey = `cancel:message:${messageId}`;
  
  let accumulatedText = '';
  let lastFlushTime = Date.now();
  const FLUSH_INTERVAL = 500; // ms
  
  try {
    // 1. Update message status to streaming
    await db.update(messages)
      .set({ status: 'streaming', updatedAt: new Date() })
      .where(eq(messages.id, messageId));
    
    // 2. Load and decrypt API key
    const cred = await db.query.credentials.findFirst({
      where: eq(credentials.id, credentialId),
    });
    if (!cred) throw new Error('Credential not found');
    const apiKey = decryptApiKey(cred.encryptedApiKey);
    
    // 3. Build conversation context
    const conversationMessages = await buildConversationContext(conversationId);
    
    // 4. Get provider adapter
    const adapter = providerRegistry.get(providerId);
    
    // 5. Stream the response
    const stream = adapter.chatStream({
      model: modelKey,
      messages: conversationMessages,
    }, apiKey);
    
    let tokenUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    let finishReason = 'stop';
    
    for await (const event of stream) {
      // Check cancellation
      const cancelled = await redis.get(cancelKey);
      if (cancelled) {
        await db.update(messages).set({
          status: 'stopped',
          content: [{ type: 'text', text: accumulatedText }] as any,
          updatedAt: new Date(),
        }).where(eq(messages.id, messageId));
        await pubRedis.publish(channelKey, JSON.stringify({ type: 'stopped' }));
        return;
      }
      
      switch (event.type) {
        case 'text-delta':
          accumulatedText += event.textDelta;
          await pubRedis.publish(channelKey, JSON.stringify(event));
          
          // Periodic flush to DB
          if (Date.now() - lastFlushTime >= FLUSH_INTERVAL) {
            await db.update(messages).set({
              content: [{ type: 'text', text: accumulatedText }] as any,
              updatedAt: new Date(),
            }).where(eq(messages.id, messageId));
            lastFlushTime = Date.now();
          }
          break;
          
        case 'finish':
          tokenUsage = event.usage;
          finishReason = event.finishReason;
          break;
          
        case 'error':
          throw event.error;
      }
    }
    
    // 6. Final flush
    const costEstimate = adapter.estimateCost(tokenUsage, modelKey);
    await db.update(messages).set({
      status: 'complete',
      content: [{ type: 'text', text: accumulatedText }] as any,
      tokenUsage: tokenUsage as any,
      costEstimate: costEstimate?.totalCost?.toString() ?? null,
      updatedAt: new Date(),
    }).where(eq(messages.id, messageId));
    
    await pubRedis.publish(channelKey, JSON.stringify({ type: 'complete', usage: tokenUsage }));
    
  } catch (error: any) {
    // Update message with error status
    await db.update(messages).set({
      status: 'error',
      content: accumulatedText ? [{ type: 'text', text: accumulatedText }] as any : [{ type: 'text', text: '' }] as any,
      error: { message: error.message, type: error.type ?? 'unknown' } as any,
      updatedAt: new Date(),
    }).where(eq(messages.id, messageId));
    
    await pubRedis.publish(channelKey, JSON.stringify({
      type: 'error',
      error: { message: error.message, type: error.type ?? 'unknown' },
    }));
    
    throw error; // Let BullMQ handle retries
  } finally {
    await redis.del(cancelKey);
    await pubRedis.quit();
  }
}

/** Build conversation context by walking the message tree */
async function buildConversationContext(conversationId: string): Promise<NormalizedMessage[]> {
  // Get the conversation to find the active leaf
  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
  });
  if (!conversation?.activeLeafId) return [];
  
  // Walk from active leaf to root via parent_id
  const allMessages = await db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
  });
  
  // Build a map for quick lookup
  const msgMap = new Map(allMessages.map(m => [m.id, m]));
  
  // Walk from leaf to root
  const path: typeof allMessages = [];
  let currentId: string | null = conversation.activeLeafId;
  while (currentId) {
    const msg = msgMap.get(currentId);
    if (!msg) break;
    path.unshift(msg); // Prepend
    currentId = msg.parentId;
  }
  
  // Convert to NormalizedMessage format
  return path
    .filter(m => m.status === 'complete' || m.status === 'streaming')
    .filter(m => m.role !== 'system' || path.indexOf(m) === 0) // Keep only first system message
    .map(m => ({
      role: m.role as NormalizedMessage['role'],
      content: (m.content as ContentBlock[]) || [{ type: 'text' as const, text: '' }],
    }));
}
