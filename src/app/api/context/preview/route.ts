import { NextRequest, NextResponse } from 'next/server';
import { assembleContext } from '@/lib/memory/context-assembler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      conversationId, 
      projectId, 
      workspaceId, 
      userMessage, 
      modelMaxTokens = 128000, 
      maxOutputTokens = 4096 
    } = body;

    if (!conversationId || !userMessage) {
      return NextResponse.json({ error: 'conversationId and userMessage are required' }, { status: 400 });
    }

    const context = await assembleContext({
      conversationId,
      projectId,
      workspaceId,
      userMessage,
      modelMaxTokens,
      maxOutputTokens
    });

    return NextResponse.json({ context });
  } catch (error) {
    console.error('Error assembling context:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
