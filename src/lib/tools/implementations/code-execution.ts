import { z } from 'zod';
import { Tool } from '../types';

const inputSchema = z.object({
  language: z.string().describe('The programming language to execute (e.g., python, js)'),
  code: z.string().describe('The source code to execute'),
});

type Input = z.infer<typeof inputSchema>;

/**
 * Code Execution Tool STUB.
 * This tool is a placeholder for a future secure code execution sandbox.
 */
export const codeExecutionTool: Tool<Input, never> = {
  name: 'code_execute',
  description: 'Executes code in an isolated sandbox.',
  permissionScope: 'execute',
  inputSchema,
  execute: async () => {
    throw new Error('Code execution is not yet available. This feature will be implemented in a dedicated security-focused phase.');
  },
};
