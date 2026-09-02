import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { memories } from '@/lib/db/schema/memories';
import { eq, and, isNull } from 'drizzle-orm';
import { containsSecret } from '@/lib/memory/secret-denylist';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') as any;
    const scopeId = searchParams.get('scopeId');

    if (!scope) {
      return NextResponse.json({ error: 'scope is required' }, { status: 400 });
    }

    let conditions = [eq(memories.scope, scope)];
    if (scopeId) {
      conditions.push(eq(memories.scopeId, scopeId));
    } else if (scope !== 'global') {
      conditions.push(isNull(memories.scopeId)); // global has no scopeId
    }

    const results = await db.query.memories.findMany({
      where: and(...conditions),
    });

    return NextResponse.json({ memories: results });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scope, scopeId, key, value } = body;

    if (!scope || !key || value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const valueString = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (containsSecret(key) || containsSecret(valueString)) {
      return NextResponse.json({ error: 'Cannot save memory containing secrets' }, { status: 400 });
    }

    const result = await db.insert(memories).values({
      scope,
      scopeId: scopeId || null,
      key,
      value,
      source: 'user',
    }).returning();

    return NextResponse.json({ memory: result[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
