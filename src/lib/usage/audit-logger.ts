import { db } from '@/lib/db';
import { auditEvents, toolCalls } from '@/lib/db/schema';

/**
 * Log an audit event
 */
export async function logAuditEvent(event: {
  action: string;
  userId: string;
  workspaceId?: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  await db.insert(auditEvents).values({
    action: event.action,
    userId: event.userId,
    workspaceId: event.workspaceId,
    entityType: event.resourceType,
    entityId: event.resourceId,
    details: event.metadata,
    ipAddress: event.ipAddress,
  }).execute();
}

/**
 * Log a tool call execution
 */
export async function logToolCall(call: {
  toolName: string;
  sessionId?: string;
  messageId?: string;
  input: unknown;
  output: unknown;
  durationMs: number;
  success: boolean;
}): Promise<void> {
  await db.insert(toolCalls).values({
    toolName: call.toolName,
    sessionId: call.sessionId,
    messageId: call.messageId,
    input: call.input,
    output: call.output,
    durationMs: call.durationMs,
    success: call.success,
  }).execute();
}
