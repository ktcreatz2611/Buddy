import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparisons, comparisonResponses, models, providers } from '@/lib/db/schema';
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
  const { modelId, credentialId } = body;

  if (!modelId) {
    return new NextResponse('Missing modelId', { status: 400 });
  }

  const comparison = await db.query.comparisons.findFirst({
    where: eq(comparisons.id, comparisonId),
    with: {
      responses: true,
    },
  });

  if (!comparison) return new NextResponse('Not found', { status: 404 });

  const completedResponses = comparison.responses.filter(r => r.status === 'complete');
  
  if (completedResponses.length === 0) {
    return new NextResponse('No completed responses to synthesize', { status: 400 });
  }

  const model = await db.query.models.findFirst({
    where: eq(models.modelId, modelId)
  });

  if (!model) return new NextResponse('Model not found', { status: 404 });

  const cred = await db.query.credentials.findFirst({
    where: (c, { eq }) => eq(c.providerId, model.providerId)
  });
  
  if (!cred) return new NextResponse('Credential not found', { status: 400 });

  const synthesisPrompt = `You've been given multiple AI responses to the same question: "${comparison.prompt}"

Here are the responses:
${completedResponses.map((r, i) => `--- Response ${i + 1} (${r.modelName}) ---\n${r.content}\n`).join('\n')}

Please analyze their strengths and differences, then provide a synthesized answer that combines the best parts of all responses.`;

  const provider = await db.query.providers.findFirst({
    where: (p, { eq }) => eq(p.id, model.providerId)
  });

  if (!provider) return new NextResponse('Provider not found', { status: 404 });

  // Create a synthesis response in the comparisons table
  const [synthesisResponse] = await db.insert(comparisonResponses)
    .values({
      comparisonId,
      providerId: provider.type,
      modelKey: model.modelId,
      modelName: `${model.name} (Synthesis)`,
    })
    .returning();

  await comparisonQueue.add('generate', {
    comparisonResponseId: synthesisResponse.id,
    comparisonId,
    providerId: provider.type,
    modelKey: model.modelId,
    credentialId: cred.id,
    prompt: synthesisPrompt,
  });

  return NextResponse.json({ id: synthesisResponse.id });
}
