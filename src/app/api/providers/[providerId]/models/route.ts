import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { models } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ providerId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { providerId } = await params;

  try {
    const providerModels = await db
      .select()
      .from(models)
      .where(eq(models.providerId, providerId));

    return NextResponse.json(providerModels);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ providerId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { providerId } = await params;

  try {
    const body = await request.json();
    const { modelId, name, capabilities, pricing, maxContextTokens, maxOutputTokens } = body;

    if (!modelId || !name) {
      return NextResponse.json({ error: 'modelId and name are required' }, { status: 400 });
    }

    const [model] = await db
      .insert(models)
      .values({
        providerId,
        modelId,
        name,
        capabilities: capabilities || {},
        inputPricePerMToken: pricing?.inputPricePerMToken || null,
        outputPricePerMToken: pricing?.outputPricePerMToken || null,
        maxContextTokens: maxContextTokens || null,
        maxOutputTokens: maxOutputTokens || null,
      })
      .returning();

    return NextResponse.json(model);
  } catch (error) {
    console.error('Error creating model:', error);
    return NextResponse.json({ error: 'Failed to create model' }, { status: 500 });
  }
}
