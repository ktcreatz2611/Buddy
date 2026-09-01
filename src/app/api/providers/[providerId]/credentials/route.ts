import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { credentials } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { encryptApiKey } from '@/lib/security/encryption';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ providerId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { providerId } = await params;
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId');

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
  }

  try {
    const creds = await db
      .select({
        id: credentials.id,
        label: credentials.label,
        createdAt: credentials.createdAt,
        updatedAt: credentials.updatedAt,
      })
      .from(credentials)
      .where(
        and(
          eq(credentials.providerId, providerId),
          eq(credentials.workspaceId, workspaceId)
        )
      );

    return NextResponse.json(creds);
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 });
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
    const { apiKey, label, workspaceId } = body;

    if (!apiKey || !workspaceId) {
      return NextResponse.json({ error: 'apiKey and workspaceId are required' }, { status: 400 });
    }

    const encryptedKey = await encryptApiKey(apiKey);

    const [credential] = await db
      .insert(credentials)
      .values({
        providerId,
        workspaceId,
        label: label || 'Default',
        encryptedApiKey: encryptedKey,
      })
      .returning({
        id: credentials.id,
        label: credentials.label,
        createdAt: credentials.createdAt,
      });

    return NextResponse.json(credential);
  } catch (error) {
    console.error('Error creating credential:', error);
    return NextResponse.json({ error: 'Failed to create credential' }, { status: 500 });
  }
}
