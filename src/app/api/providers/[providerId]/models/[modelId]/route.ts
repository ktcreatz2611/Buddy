import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { models } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ providerId: string; modelId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { modelId } = await params;

  try {
    const body = await request.json();
    const { name, isEnabled, pricing, capabilities, maxContextTokens, maxOutputTokens } = body;

    const updates: Partial<typeof models.$inferInsert> = { updatedAt: new Date() };

    if (name !== undefined) updates.name = name;
    if (isEnabled !== undefined) updates.isEnabled = isEnabled;
    if (capabilities !== undefined) updates.capabilities = capabilities;
    if (maxContextTokens !== undefined) updates.maxContextTokens = maxContextTokens;
    if (maxOutputTokens !== undefined) updates.maxOutputTokens = maxOutputTokens;
    if (pricing?.inputPricePerMToken !== undefined) updates.inputPricePerMToken = pricing.inputPricePerMToken;
    if (pricing?.outputPricePerMToken !== undefined) updates.outputPricePerMToken = pricing.outputPricePerMToken;

    const [updated] = await db
      .update(models)
      .set(updates)
      .where(eq(models.id, modelId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating model:', error);
    return NextResponse.json({ error: 'Failed to update model' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ providerId: string; modelId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { modelId } = await params;

  try {
    await db.delete(models).where(eq(models.id, modelId));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting model:', error);
    return NextResponse.json({ error: 'Failed to delete model' }, { status: 500 });
  }
}
