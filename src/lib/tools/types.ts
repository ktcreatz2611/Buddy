import { z, ZodSchema } from 'zod';

/**
 * The scope of permissions granted to a tool.
 * Determines what resources the tool can access.
 */
export type PermissionScope = 'read_only' | 'network' | 'execute' | 'filesystem';

/**
 * Context provided to a tool during execution.
 */
export interface ToolExecutionContext {
  userId: string;
  sessionId?: string;
  remainingBudget: { turns: number; tokens: number; wallClockMs: number };
  timeout: number;
  callerRole: string;
  allowedTools: string[];
}

/**
 * Definition of a tool that can be executed by the AI or user.
 */
export interface Tool<TInput = any, TOutput = unknown> {
  name: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputSchema: z.ZodType<any, any, any>;
  permissionScope: PermissionScope;
  execute(input: TInput, ctx: ToolExecutionContext): Promise<TOutput>;
}

/**
 * Standardized result format for tool execution.
 */
export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  executionTimeMs: number;
}
