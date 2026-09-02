import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { claims } from '@/lib/db/schema/research';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sessionId } = await params;

  const sessionClaims = await db.query.claims.findMany({
    where: eq(claims.sessionId, sessionId),
    with: {
      evidenceLinks: {
        with: {
          evidence: true
        }
      }
    }
  });

  return NextResponse.json(sessionClaims);
}


