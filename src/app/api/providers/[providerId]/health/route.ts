import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { providers, credentials } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { decryptApiKey } from '@/lib/security/encryption';
import { providerRegistry } from '@/lib/providers';

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
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    }

    const [provider] = await db
      .select()
      .from(providers)
      .where(eq(providers.id, providerId));

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const [credential] = await db
      .select()
      .from(credentials)
      .where(
        and(
          eq(credentials.providerId, providerId),
          eq(credentials.workspaceId, workspaceId)
        )
      )
      .limit(1);

    if (!credential) {
      return NextResponse.json({ error: 'No credentials found for this provider in this workspace' }, { status: 404 });
    }

    const apiKey = await decryptApiKey(credential.encryptedApiKey);
    const providerService = providerRegistry.get(provider.type);
    
    if (!providerService || !providerService.healthCheck) {
      return NextResponse.json({ error: 'Health check not supported for this provider type' }, { status: 400 });
    }

    const result = await providerService.healthCheck(apiKey);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error during health check:', error);
    return NextResponse.json({ error: 'Health check failed' }, { status: 500 });
  }
}
