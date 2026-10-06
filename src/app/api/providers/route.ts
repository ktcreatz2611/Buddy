import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { providers, models, credentials } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, count } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allProviders = await db.select().from(providers);
    const providerList = [];

    for (const provider of allProviders) {
      const modelsCount = await db
        .select({ count: count() })
        .from(models)
        .where(eq(models.providerId, provider.id));
        
      const providerModels = await db
        .select()
        .from(models)
        .where(eq(models.providerId, provider.id));
        
      const credentialsCount = await db
        .select({ count: count() })
        .from(credentials)
        .where(eq(credentials.providerId, provider.id));
      
      providerList.push({
        ...provider,
        modelsCount: modelsCount[0].count,
        models: providerModels,
        configured: credentialsCount[0].count > 0,
        status: provider.isEnabled ? 'active' : 'inactive',
      });
    }

    return NextResponse.json(providerList);
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, type, baseUrl } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    const [provider] = await db.insert(providers).values({
      name,
      type,
      baseUrl: baseUrl || null,
      isEnabled: true,
    }).returning();

    return NextResponse.json(provider);
  } catch (error) {
    console.error('Error creating provider:', error);
    return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 });
  }
}
