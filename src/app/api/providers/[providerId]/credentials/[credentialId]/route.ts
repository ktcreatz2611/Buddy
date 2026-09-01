import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { credentials } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { encryptApiKey } from '@/lib/security/encryption';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ providerId: string; credentialId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { credentialId } = await params;

  try {
    const body = await request.json();
    const { label, apiKey } = body;
    const updates: Partial<typeof credentials.$inferInsert> = { updatedAt: new Date() };

    if (label !== undefined) {
      updates.label = label;
    }

    if (apiKey) {
      updates.encryptedApiKey = await encryptApiKey(apiKey);
    }

    const [updated] = await db
      .update(credentials)
      .set(updates)
      .where(eq(credentials.id, credentialId))
      .returning({
        id: credentials.id,
        label: credentials.label,
        updatedAt: credentials.updatedAt,
      });

    if (!updated) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating credential:', error);
    return NextResponse.json({ error: 'Failed to update credential' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ providerId: string; credentialId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { credentialId } = await params;

  try {
    await db.delete(credentials).where(eq(credentials.id, credentialId));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting credential:', error);
    return NextResponse.json({ error: 'Failed to delete credential' }, { status: 500 });
  }
}
