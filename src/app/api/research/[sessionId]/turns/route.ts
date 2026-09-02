import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentTurns } from '@/lib/db/schema/research';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sessionId } = await params;

  const turns = await db.query.agentTurns.findMany({
    where: eq(agentTurns.sessionId, sessionId),
    orderBy: [desc(agentTurns.createdAt)]
  });

  return NextResponse.json(turns);
}


