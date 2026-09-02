import { NextResponse } from 'next/server';
import { toolRegistry } from '@/lib/tools/implementations'; // Assuming index registers tools

export async function GET() {
  const tools = toolRegistry.list().map(tool => ({
    name: tool.name,
    description: tool.description,
    permissionScope: tool.permissionScope,
    // Note: Serializing Zod schema directly to JSON isn't natively supported by Zod.
    // In a real app, you'd use a package like `zod-to-json-schema`.
    // Returning a simplified representation for now.
    inputSchema: 'Omitted (Requires zod-to-json-schema for full JSON representation)'
  }));

  return NextResponse.json({ tools });
}
