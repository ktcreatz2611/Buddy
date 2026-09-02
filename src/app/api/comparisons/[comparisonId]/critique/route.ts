import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparisons, comparisonResponses, models } from '@/lib/db/schema';
import { comparisonQueue } from '@/lib/worker/queues';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ comparisonId: string }> }
) {
  const session = await auth();
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

  const { comparisonId } = await params;
  const body = await req.json();
  const { responseId, critiqueModelId, critiqueCredentialId } = body;

  if (!responseId || !critiqueModelId || !critiqueCredentialId) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  const comparison = await db.query.comparisons.findFirst({
    where: eq(comparisons.id, comparisonId),
  });

  if (!comparison) return new NextResponse('Comparison not found', { status: 404 });

  const responseToCritique = await db.query.comparisonResponses.findFirst({
    where: eq(comparisonResponses.id, responseId),
  });

  if (!responseToCritique || responseToCritique.status !== 'complete') {
    return new NextResponse('Invalid or incomplete response to critique', { status: 400 });
  }

  const model = await db.query.models.findFirst({
    where: eq(models.id, critiqueModelId),
  });

  if (!model) return new NextResponse('Model not found', { status: 404 });

  const critiquePrompt = `Original Prompt: "${comparison.prompt}"
Response to critique:
${responseToCritique.content}

Please evaluate this response. Point out any inaccuracies, logical flaws, or areas for improvement, and then provide a better answer.`;

  const [critiqueResponse] = await db.insert(comparisonResponses)
    .values({
      comparisonId,
      modelId: model.id,
      providerId: model.providerId,
      modelKey: model.modelId,
      modelName: `${model.name} (Critique)`,
    })
    .returning();

  await comparisonQueue.add('generate', {
    comparisonResponseId: critiqueResponse.id,
    comparisonId,
    providerId: model.providerId,
    modelKey: model.modelId,
    credentialId: critiqueCredentialId,
    prompt: critiquePrompt,
  });

  return NextResponse.json({ id: critiqueResponse.id });
}
