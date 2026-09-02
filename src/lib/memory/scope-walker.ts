import { eq, inArray, or, and, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { memories } from '@/lib/db/schema/memories';

export interface ScopedMemory {
  id: string;
  scope: 'global' | 'workspace' | 'project' | 'conversation';
  key: string;
  value: unknown;
  source: 'user' | 'agent_extracted';
}

export async function walkMemories(options: {
  conversationId?: string;
  projectId?: string;
  workspaceId?: string;
  maxTokens?: number;
}): Promise<ScopedMemory[]> {
  const { conversationId, projectId, workspaceId, maxTokens = 2000 } = options;

  // Build conditions based on provided context
  const conditions = [];
  
  // 1. Global (no scopeId usually, or scopeId is null, but we match by scope 'global')
  conditions.push(eq(memories.scope, 'global'));
  
  // 2. Workspace
  if (workspaceId) {
    conditions.push(and(eq(memories.scope, 'workspace'), eq(memories.scopeId, workspaceId)));
  }
  
  // 3. Project
  if (projectId) {
    conditions.push(and(eq(memories.scope, 'project'), eq(memories.scopeId, projectId)));
  }
  
  // 4. Conversation
  if (conversationId) {
    conditions.push(and(eq(memories.scope, 'conversation'), eq(memories.scopeId, conversationId)));
  }

  const allMemories = await db.query.memories.findMany({
    where: or(...conditions),
  });

  // Sort by priority (global -> workspace -> project -> conversation)
  const scopePriority: Record<string, number> = {
    global: 1,
    workspace: 2,
    project: 3,
    conversation: 4,
  };

  const sortedMemories = allMemories.sort((a, b) => {
    return (scopePriority[a.scope] || 99) - (scopePriority[b.scope] || 99);
  });

  const selectedMemories: ScopedMemory[] = [];
  let currentTokens = 0;

  for (const memory of sortedMemories) {
    const memoryString = JSON.stringify(memory.value);
    // rough token estimation: ~4 chars per token
    const estimatedTokens = Math.ceil((memory.key.length + memoryString.length) / 4);

    if (currentTokens + estimatedTokens > maxTokens) {
      break;
    }

    selectedMemories.push(memory as ScopedMemory);
    currentTokens += estimatedTokens;
  }

  return selectedMemories;
}
