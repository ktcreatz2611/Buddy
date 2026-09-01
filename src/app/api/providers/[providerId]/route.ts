import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { providers, models, credentials } from '@/lib/db/schema';
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
    const [provider] = await db
      .select()
      .from(providers)
      .where(eq(providers.id, providerId));

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const providerModels = await db
      .select()
      .from(models)
      .where(eq(models.providerId, providerId));

    return NextResponse.json({ ...provider, models: providerModels });
  } catch (error) {
    console.error('Error fetching provider:', error);
    return NextResponse.json({ error: 'Failed to fetch provider' }, { status: 500 });
  }
}

export async function PATCH(
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
    const { name, baseUrl, isEnabled } = body;

    const [updatedProvider] = await db
      .update(providers)
      .set({
        ...(name !== undefined && { name }),
        ...(baseUrl !== undefined && { baseUrl }),
        ...(isEnabled !== undefined && { isEnabled }),
        updatedAt: new Date(),
      })
      .where(eq(providers.id, providerId))
      .returning();

    if (!updatedProvider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    return NextResponse.json(updatedProvider);
  } catch (error) {
    console.error('Error updating provider:', error);
    return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ providerId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { providerId } = await params;

  try {
    await db.delete(providers).where(eq(providers.id, providerId));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting provider:', error);
    return NextResponse.json({ error: 'Failed to delete provider' }, { status: 500 });
  }
}
