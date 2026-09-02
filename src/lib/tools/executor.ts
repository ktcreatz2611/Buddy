import { toolRegistry } from './registry';
import { ToolExecutionContext, ToolResult } from './types';

/**
 * Safely executes a tool by name with the given input and context.
 * Validates existence, permissions, schema, and enforces timeouts.
 *
 * @param toolName The name of the tool to execute.
 * @param input The raw input provided to the tool.
 * @param ctx The execution context (userId, limits, etc).
 * @returns A structured ToolResult with the execution outcome.
 */
export async function executeTool(
  toolName: string,
  input: unknown,
  ctx: ToolExecutionContext
): Promise<ToolResult> {
  const startTime = Date.now();

  try {
    // 1. Validate tool exists
    const tool = toolRegistry.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    // 2. Validate tool is in caller's allowlist
    if (!ctx.allowedTools.includes(toolName) && !ctx.allowedTools.includes('*')) {
      throw new Error(`Tool execution denied: ${toolName} is not in the allowlist.`);
    }

    // 3. Validate input against Zod schema
    const parseResult = tool.inputSchema.safeParse(input);
    if (!parseResult.success) {
      throw new Error(`Invalid input for tool ${toolName}: ${parseResult.error.message}`);
    }

    const validatedInput = parseResult.data;

    // 4. Execute with timeout
    const timeoutMs = ctx.timeout || 10000;
    let timeoutId: NodeJS.Timeout;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Tool execution timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    const executionPromise = tool.execute(validatedInput, ctx);

    // Race execution against timeout
    const result = await Promise.race([executionPromise, timeoutPromise]);
    
    clearTimeout(timeoutId!);

    return {
      success: true,
      data: result,
      executionTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      executionTimeMs: Date.now() - startTime,
    };
  }
}
