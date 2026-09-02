import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparisons, comparisonResponses } from '@/lib/db/schema';
import { comparisonQueue } from '@/lib/worker/queues';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ comparisonId: string; responseId: string }> }
) {
  const session = await auth();
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

  const { comparisonId, responseId } = await params;

  const oldResponse = await db.query.comparisonResponses.findFirst({
    where: eq(comparisonResponses.id, responseId),
  });

  if (!oldResponse) return new NextResponse('Not found', { status: 404 });

  const comparison = await db.query.comparisons.findFirst({
    where: eq(comparisons.id, comparisonId),
  });

  if (!comparison) return new NextResponse('Not found', { status: 404 });

  const body = await req.json();
  const { credentialId } = body;

  if (!credentialId) return new NextResponse('Missing credentialId', { status: 400 });

  const [newResponse] = await db.insert(comparisonResponses)
    .values({
      comparisonId,
      modelId: oldResponse.modelId,
      providerId: oldResponse.providerId,
      modelKey: oldResponse.modelKey,
      modelName: oldResponse.modelName,
    })
    .returning();

  await comparisonQueue.add('generate', {
    comparisonResponseId: newResponse.id,
    comparisonId,
    providerId: oldResponse.providerId,
    modelKey: oldResponse.modelKey,
    credentialId,
    prompt: comparison.prompt,
  });

  return NextResponse.json({ id: newResponse.id });
}
