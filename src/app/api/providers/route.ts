import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { providers } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, count } from 'drizzle-orm';
import { models } from '@/lib/db/schema';

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
      
      providerList.push({
        ...provider,
        modelsCount: modelsCount[0].count,
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
