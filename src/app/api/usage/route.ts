import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { usageRecords } from '@/lib/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { getUsageStats } from '@/lib/usage/budget';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId');
  const period = searchParams.get('period') as 'day' | 'week' | 'month' | null;

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
  }

  try {
    const p = period || 'month';
    const stats = await getUsageStats(workspaceId, p);

    // Get breakdown by provider
    const providerStats = await db
      .select({
        providerId: usageRecords.providerId,
        totalTokens: sql<number>`sum(${usageRecords.totalTokens})`,
        totalCost: sql<number>`sum(${usageRecords.costEstimate})`,
      })
      .from(usageRecords)
      .where(eq(usageRecords.workspaceId, workspaceId))
      .groupBy(usageRecords.providerId)
      .execute();

    // Get breakdown by model
    const modelStats = await db
      .select({
        modelId: usageRecords.modelId,
        totalTokens: sql<number>`sum(${usageRecords.totalTokens})`,
      })
      .from(usageRecords)
      .where(eq(usageRecords.workspaceId, workspaceId))
      .groupBy(usageRecords.modelId)
      .execute();
      
    // Optionally: daily breakdown if requested, etc. We'll return just overall stats for now.

    return NextResponse.json({
      totalTokens: stats.totalTokens,
      totalCost: stats.totalCost,
      tokensByProvider: providerStats.reduce((acc, curr) => ({ ...acc, [curr.providerId]: Number(curr.totalTokens) || 0 }), {}),
      costByProvider: providerStats.reduce((acc, curr) => ({ ...acc, [curr.providerId]: Number(curr.totalCost) || 0 }), {}),
      tokensByModel: modelStats.reduce((acc, curr) => ({ ...acc, [curr.modelId]: Number(curr.totalTokens) || 0 }), {}),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
