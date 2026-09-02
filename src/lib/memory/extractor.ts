import { db } from '@/lib/db';
import { memories } from '@/lib/db/schema/memories';
import { redactSecrets, containsSecret } from './secret-denylist';

export async function saveMemory(
  scope: 'global' | 'workspace' | 'project' | 'conversation',
  scopeId: string | null,
  key: string,
  value: unknown,
  source: 'user' | 'agent_extracted'
): Promise<void> {
  const valueString = typeof value === 'string' ? value : JSON.stringify(value);
  
  if (containsSecret(key) || containsSecret(valueString)) {
    console.warn(`Attempted to save memory containing secrets. Key: ${key}`);
    // We could either redact and save, or reject entirely. 
    // Rejecting is safer for structured data.
    return;
  }

  await db.insert(memories).values({
    scope,
    scopeId,
    key,
    value,
    source,
  });
}

export async function extractMemories(
  content: string,
  conversationId: string,
  projectId?: string,
  workspaceId?: string
): Promise<void> {
  // Stub implementation. 
  // In a real scenario, this would parse the assistant's structured output (tool calls or JSON)
  // to find memory blocks like: { action: 'save_memory', key: 'user_preference', value: 'likes dark mode' }
  
  // For now, it's just a no-op placeholder
  // Example call:
  // await saveMemory('conversation', conversationId, 'extracted_fact', 'user mentioned testing', 'agent_extracted');
}
