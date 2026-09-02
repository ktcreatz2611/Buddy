export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolCheckResult {
  allowed: boolean;
  reason?: string;
}

export function checkToolPermission(
  toolCall: ToolCall,
  agentRole: 'investigator' | 'analyst',
  remainingBudget: { turns: number; tokens: number },
  recentCalls: ToolCall[]
): ToolCheckResult {
  if (remainingBudget.turns <= 0 || remainingBudget.tokens <= 0) {
    return { allowed: false, reason: 'Budget exhausted' };
  }

  if (agentRole === 'investigator' && toolCall.name !== 'web_search') {
    return { allowed: false, reason: `Investigator cannot use tool ${toolCall.name}` };
  }

  if (agentRole === 'analyst' && !['web_search', 'document_search'].includes(toolCall.name)) {
    return { allowed: false, reason: `Analyst cannot use tool ${toolCall.name}` };
  }

  const loopCount = recentCalls.filter(
    c => c.name === toolCall.name && JSON.stringify(c.arguments) === JSON.stringify(toolCall.arguments)
  ).length;

  if (loopCount >= 3) {
    return { allowed: false, reason: 'Tool call loop detected' };
  }

  return { allowed: true };
}
