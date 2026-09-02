import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { memories } from '@/lib/db/schema/memories';
import { eq } from 'drizzle-orm';
import { containsSecret } from '@/lib/memory/secret-denylist';

export async function GET(request: NextRequest, { params }: { params: Promise<{ memoryId: string }> }) {
  try {
    const { memoryId } = await params;
    
    const result = await db.query.memories.findFirst({
      where: eq(memories.id, memoryId)
    });

    if (!result) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ memory: result });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ memoryId: string }> }) {
  try {
    const { memoryId } = await params;
    const body = await request.json();
    const { value } = body;

    if (value === undefined) {
      return NextResponse.json({ error: 'value is required' }, { status: 400 });
    }

    const valueString = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (containsSecret(valueString)) {
      return NextResponse.json({ error: 'Cannot save memory containing secrets' }, { status: 400 });
    }

    const result = await db.update(memories)
      .set({ value, updatedAt: new Date() })
      .where(eq(memories.id, memoryId))
      .returning();

    if (!result.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ memory: result[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ memoryId: string }> }) {
  try {
    const { memoryId } = await params;
    
    const result = await db.delete(memories).where(eq(memories.id, memoryId)).returning();
    
    if (!result.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
