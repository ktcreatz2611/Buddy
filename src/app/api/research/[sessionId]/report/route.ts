import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { researchSessions } from '@/lib/db/schema/research';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { generateReport } from '@/lib/research/report-generator';

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
  if (researchSession.status !== 'complete') {
    return NextResponse.json({ error: 'Report not ready' }, { status: 400 });
  }

  const report = await generateReport(sessionId);

  return NextResponse.json(report);
}
