import { NormalizedMessage } from '@/lib/providers/types';
import { walkMemories } from './scope-walker';
import { getOrCreateSummary } from './summarizer';
import { db } from '@/lib/db';
import { conversations } from '@/lib/db/schema/conversations';
import { messages } from '@/lib/db/schema/messages';
import { eq } from 'drizzle-orm';
// Assuming retrieveChunks is exported from retriever
// If it doesn't exist yet, this will act as the stub integration
import { retrieveChunks } from '@/lib/documents/retriever';

export interface AssembledContext {
  messages: NormalizedMessage[];
  totalTokens: number;
  breakdown: {
    systemPrompt: number;
    memories: number;
    summary: number;
    ragChunks: number;
    recentMessages: number;
  };
}

export async function assembleContext(options: {
  conversationId: string;
  projectId?: string;
  workspaceId?: string;
  userMessage: string;
  modelMaxTokens: number;
  maxOutputTokens?: number;
  systemPromptTemplate?: string;
}): Promise<AssembledContext> {
  const {
    conversationId,
    projectId,
    workspaceId,
    userMessage,
    modelMaxTokens,
    maxOutputTokens = 4096,
  } = options;

  let systemPromptTemplate = options.systemPromptTemplate || "You are Buddy, a helpful AI assistant...";

  const availableTokens = Math.max(0, modelMaxTokens - maxOutputTokens);
  
  // 1. System Prompt
  const systemPromptTokens = Math.ceil(systemPromptTemplate.length / 4);
  const remainingAfterSystem = Math.max(0, availableTokens - systemPromptTokens);

  // Allocations
  const memoriesBudget = Math.floor(remainingAfterSystem * 0.15);
  const summaryBudget = Math.floor(remainingAfterSystem * 0.10);
  const ragBudget = Math.floor(remainingAfterSystem * 0.25);
  let messagesBudget = remainingAfterSystem - memoriesBudget - summaryBudget - ragBudget;

  const breakdown = {
    systemPrompt: systemPromptTokens,
    memories: 0,
    summary: 0,
    ragChunks: 0,
    recentMessages: 0,
  };

  const finalMessages: NormalizedMessage[] = [];

  // 2. Memories
  const memories = await walkMemories({
    conversationId,
    projectId,
    workspaceId,
    maxTokens: memoriesBudget,
  });
  
  let memoriesText = "";
  if (memories.length > 0) {
    memoriesText = "\n\nRelevant Context (Memories):\n" + memories.map(m => `- ${m.key}: ${JSON.stringify(m.value)}`).join('\n');
    breakdown.memories = Math.ceil(memoriesText.length / 4);
  }
  messagesBudget += (memoriesBudget - breakdown.memories); // redist

  // 3. Summary
  const summary = await getOrCreateSummary(conversationId);
  let summaryText = "";
  if (summary && summary.summary) {
    // Check if it fits
    const estimatedSummaryTokens = Math.ceil(summary.summary.length / 4);
    if (estimatedSummaryTokens <= summaryBudget + messagesBudget) { // can borrow from messages budget if needed, but strict to its own budget normally
      summaryText = `\n\nConversation Summary:\n${summary.summary}`;
      breakdown.summary = Math.ceil(summaryText.length / 4);
    }
  }
  messagesBudget += (summaryBudget - breakdown.summary); // redist

  // 4. RAG Chunks
  let ragText = "";
  if (projectId) {
    try {
      // Stub call to retriever, handle if not implemented
      const chunks = await retrieveChunks(userMessage, projectId, { topK: 5 });
      if (chunks && chunks.length > 0) {
        ragText = "\n\nRelevant Documents:\n" + chunks.map((c: any) => c.text).join('\n\n');
        breakdown.ragChunks = Math.ceil(ragText.length / 4);
      }
    } catch (e) {
      // Retriever might not be implemented yet
      console.warn("RAG retrieval failed or not implemented", e);
    }
  }
  messagesBudget += (ragBudget - breakdown.ragChunks); // redist

  // Combine system prompt with stable context
  const fullSystemPrompt = systemPromptTemplate + memoriesText + summaryText + ragText;
  finalMessages.push({
    role: 'system',
    content: [{ type: 'text', text: fullSystemPrompt }]
  });

  // 5. Recent Messages (walk up from active leaf)
  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId)
  });

  const allDbMessages = await db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId)
  });

  const messageMap = new Map(allDbMessages.map(m => [m.id, m]));
  
  // Find leaf
  let currentLeafId = conversation?.activeLeafId;
  if (!currentLeafId && allDbMessages.length > 0) {
    // fallback to latest by date if no active leaf
    const latest = [...allDbMessages].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    currentLeafId = latest.id;
  }

  const recentMessages: NormalizedMessage[] = [];
  let currentMsgId = currentLeafId;
  let usedMessagesTokens = 0;

  while (currentMsgId && messageMap.has(currentMsgId)) {
    const msg = messageMap.get(currentMsgId)!;
    
    const contentText = msg.content
      .filter(c => c.type === 'text' || c.type === 'code')
      .map(c => c.text || c.code || '')
      .join('\n');
      
    const tokens = Math.ceil(contentText.length / 4);
    
    if (usedMessagesTokens + tokens > messagesBudget) {
      break;
    }

    recentMessages.unshift({
      role: msg.role as 'system' | 'user' | 'assistant' | 'tool',
      content: msg.content as any, // Cast assuming types line up closely enough for assembly
    });

    usedMessagesTokens += tokens;
    currentMsgId = msg.parentId;
  }

  breakdown.recentMessages = usedMessagesTokens;
  finalMessages.push(...recentMessages);

  // 6. Current User Message
  finalMessages.push({
    role: 'user',
    content: [{ type: 'text', text: userMessage }]
  });

  // the new user message tokens are taken out of the final tally for maxTokens
  const userMsgTokens = Math.ceil(userMessage.length / 4);

  return {
    messages: finalMessages,
    totalTokens: breakdown.systemPrompt + breakdown.memories + breakdown.summary + breakdown.ragChunks + breakdown.recentMessages + userMsgTokens,
    breakdown
  };
}
