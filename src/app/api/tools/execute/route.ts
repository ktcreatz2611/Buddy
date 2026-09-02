import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeTool } from '@/lib/tools/executor';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tool, input } = body;

    if (!tool || typeof tool !== 'string') {
      return NextResponse.json({ error: 'Tool name is required' }, { status: 400 });
    }

    // Prepare execution context based on session and constraints
    const ctx = {
      userId: session.user.id || 'unknown',
      sessionId: 'session-stub',
      remainingBudget: { turns: 10, tokens: 10000, wallClockMs: 60000 },
      timeout: 15000,
      callerRole: 'user', // Default role
      allowedTools: ['*'], // Allowing all for now; enforce via policies later
    };

    const result = await executeTool(tool, input, ctx);

    // Note: Tool results are ALWAYS treated as data per spec §13.
    // The executor ensures no prompt-injection parsing happens here.
    return NextResponse.json(result);

  } catch (error) {
    console.error('Tool execution error:', error);
    return NextResponse.json(
      { error: 'Internal server error during tool execution' },
      { status: 500 }
    );
  }
}
