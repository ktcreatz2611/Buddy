import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { memories } from '@/lib/db/schema/memories';
import { eq, and, isNull } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const confirmHeader = request.headers.get('X-Confirm-Clear');
    if (confirmHeader !== 'true') {
      return NextResponse.json({ error: 'Missing X-Confirm-Clear header' }, { status: 400 });
    }

    const body = await request.json();
    const { scope, scopeId } = body;

    if (!scope) {
      return NextResponse.json({ error: 'scope is required' }, { status: 400 });
    }

    let conditions = [eq(memories.scope, scope)];
    
    if (scopeId) {
      conditions.push(eq(memories.scopeId, scopeId));
    } else if (scope === 'global') {
      // Clear all global memories if no scopeId provided
      conditions.push(isNull(memories.scopeId));
    } else {
      return NextResponse.json({ error: 'scopeId is required for non-global scopes' }, { status: 400 });
    }

    const result = await db.delete(memories)
      .where(and(...conditions))
      .returning();

    return NextResponse.json({ success: true, deletedCount: result.length });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
