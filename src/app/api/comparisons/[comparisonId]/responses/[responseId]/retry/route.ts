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

  const model = await db.query.models.findFirst({
    where: (m, { eq }) => eq(m.id, oldResponse.modelId!),
    with: { provider: true },
  });

  if (!model || !model.provider) {
    return new NextResponse('Model or provider not found', { status: 404 });
  }

  const cred = await db.query.credentials.findFirst({
    where: (c, { eq }) => eq(c.providerId, model.provider.id)
  });

  if (!cred) return new NextResponse('Credential not found', { status: 400 });

  const [newResponse] = await db.insert(comparisonResponses)
    .values({
      comparisonId,
      modelId: oldResponse.modelId,
      providerId: model.provider.type, // USE THE STRING TYPE!
      modelKey: oldResponse.modelKey,
      modelName: oldResponse.modelName,
    })
    .returning();

  await db.delete(comparisonResponses).where(eq(comparisonResponses.id, oldResponse.id));

  await comparisonQueue.add('generate', {
    comparisonResponseId: newResponse.id,
    comparisonId,
    providerId: model.provider.type,
    modelKey: oldResponse.modelKey,
    credentialId: cred.id,
    prompt: comparison.prompt,
  });

  return NextResponse.json({ id: newResponse.id });
}
