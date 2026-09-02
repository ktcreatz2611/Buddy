import { redis } from '@/lib/redis';
import { db } from '@/lib/db';
import { messages } from '@/lib/db/schema/messages';
import { eq } from 'drizzle-orm';
import { redactSecrets } from './secret-denylist';

export interface ConversationSummary {
  summary: string;
  messageCount: number;
  lastMessageId: string;
  tokenCount: number;
}

export async function getOrCreateSummary(
  conversationId: string,
  options?: { forceRefresh?: boolean; summaryInterval?: number }
): Promise<ConversationSummary | null> {
  const { forceRefresh = false, summaryInterval = 10 } = options || {};
  const cacheKey = `summary:${conversationId}`;

  let cachedSummary: ConversationSummary | null = null;
  if (!forceRefresh) {
    const data = await redis.get(cacheKey);
    if (data) {
      try {
        cachedSummary = JSON.parse(data as string);
      } catch (e) {
        // invalid JSON
      }
    }
  }

  // Fetch recent messages to check if we need to summarize
  const allMessages = await db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: (messages, { asc }) => [asc(messages.createdAt)],
  });

  if (allMessages.length === 0) {
    return null;
  }

  const lastMessage = allMessages[allMessages.length - 1];
  
  if (
    cachedSummary && 
    !forceRefresh && 
    (allMessages.length - cachedSummary.messageCount) < summaryInterval
  ) {
    return cachedSummary;
  }

  // MOCK: In the future, call LLM to compress
  // For now, simple concatenation of the last few messages
  const recentMessages = allMessages.slice(-summaryInterval);
  const rawText = recentMessages
    .map((m) => {
      const content = m.content.map(c => c.type === 'text' ? c.text : `[${c.type}]`).join(' ');
      return `${m.role}: ${content}`;
    })
    .join('\n');

  const summaryText = redactSecrets(`Summary of last ${recentMessages.length} messages:\n${rawText}`);
  const estimatedTokens = Math.ceil(summaryText.length / 4);

  const newSummary: ConversationSummary = {
    summary: summaryText,
    messageCount: allMessages.length,
    lastMessageId: lastMessage.id,
    tokenCount: estimatedTokens,
  };

  await redis.set(cacheKey, JSON.stringify(newSummary), 'EX', 60 * 60 * 24 * 7); // 7 days TTL

  return newSummary;
}
