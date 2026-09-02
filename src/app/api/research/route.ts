import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { researchSessions, researchQuestions } from '@/lib/db/schema/research';
import { eq } from 'drizzle-orm';
import { researchQueue } from '@/lib/worker/queues';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const authSession = await auth();
  if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId, question, config } = await req.json();

  if (!projectId || !question) {
    return NextResponse.json({ error: 'Missing projectId or question' }, { status: 400 });
  }

  const [researchSession] = await db.insert(researchSessions).values({
    projectId,
    question,
    config: config || {},
    status: 'planning',
  }).returning();

  // Decompose question (stub - would use LLM in real impl)
  await db.insert(researchQuestions).values([
    { sessionId: researchSession.id, question: `What is the main evidence for ${question}?`, priority: 1 },
    { sessionId: researchSession.id, question: `Are there conflicting views on ${question}?`, priority: 2 },
  ]);

  await researchQueue.add('research-job', { sessionId: researchSession.id });

  return NextResponse.json(researchSession);
}

export async function GET(req: NextRequest) {
  const authSession = await auth();
  if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
  }

  const sessions = await db.query.researchSessions.findMany({
    where: eq(researchSessions.projectId, projectId),
  });

  return NextResponse.json(sessions);
}
