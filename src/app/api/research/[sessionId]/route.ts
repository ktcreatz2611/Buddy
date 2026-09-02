import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { researchSessions, claims } from '@/lib/db/schema/research';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { redis } from '@/lib/redis';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const authSession = await auth();
  if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sessionId } = await params;

  const researchSession = await db.query.researchSessions.findFirst({
    where: eq(researchSessions.id, sessionId)
  });

  if (!researchSession) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const sessionClaims = await db.query.claims.findMany({
    where: eq(claims.sessionId, sessionId)
  });

  return NextResponse.json({
    ...researchSession,
    claimCount: sessionClaims.length
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const authSession = await auth();
  if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sessionId } = await params;

  await redis.set(`research:cancel:${sessionId}`, '1', 'EX', 3600);
  
  await db.update(researchSessions)
    .set({ status: 'cancelled' })
    .where(eq(researchSessions.id, sessionId));

  return NextResponse.json({ success: true });
}
