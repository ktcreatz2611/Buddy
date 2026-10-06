import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparisons, comparisonResponses } from '@/lib/db/schema';
import { comparisonQueue } from '@/lib/worker/queues';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const body = await req.json();
    const { conversationId, prompt, models } = body;

    const [comparison] = await db.insert(comparisons)
      .values({ conversationId, prompt })
      .returning();

    const responseIds = [];
    
    for (const model of models) {
      // Lookup the model in DB to get the provider string identifier securely
      const dbModel = await db.query.models.findFirst({
        where: (m, { eq }) => eq(m.id, model.modelId),
        with: { provider: true }
      });

      if (!dbModel || !dbModel.provider) {
        console.error(`Model or provider not found for modelId ${model.modelId}`);
        continue;
      }

      const [response] = await db.insert(comparisonResponses)
        .values({
          comparisonId: comparison.id,
          modelId: model.modelId,
          providerId: dbModel.provider.type, // The string identifier
          modelKey: model.modelKey,
          modelName: model.modelName || model.modelKey,
        })
        .returning();
        
      responseIds.push(response.id);

      // Resolve credential server-side
      const cred = await db.query.credentials.findFirst({
        where: (c, { eq }) => eq(c.providerId, dbModel.provider.id)
      });

      if (!cred) {
        console.error(`No credential found for provider ${dbModel.provider.id}`);
      }

      await comparisonQueue.add('generate', {
        comparisonResponseId: response.id,
        comparisonId: comparison.id,
        providerId: dbModel.provider.type,
        modelKey: model.modelKey,
        credentialId: cred?.id || '',
        prompt,
      });
    }

    return NextResponse.json({ id: comparison.id, responseIds });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const conversationId = url.searchParams.get('conversationId');
  if (!conversationId) return new NextResponse('Missing conversationId', { status: 400 });

  const items = await db.query.comparisons.findMany({
    where: eq(comparisons.conversationId, conversationId),
    orderBy: (c, { desc }) => [desc(c.createdAt)],
  });

  return NextResponse.json(items);
}
