import { db } from '@/lib/db';
import { usageRecords } from '@/lib/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { redis } from '@/lib/redis';

export interface BudgetConfig {
  dailyTokenLimit?: number;
  dailyCostLimit?: number;
  monthlyTokenLimit?: number;
  monthlyCostLimit?: number;
}

export interface UsageStats {
  totalTokens: number;
  totalCost: number;
}

/**
 * Get usage stats for a workspace from a specific start date
 */
async function getStatsFrom(workspaceId: string, startDate: Date): Promise<UsageStats> {
  const result = await db
    .select({
      totalTokens: sql<number>`sum(${usageRecords.totalTokens})`,
      totalCost: sql<number>`sum(${usageRecords.costEstimate})`,
    })
    .from(usageRecords)
    .where(
      and(
        eq(usageRecords.workspaceId, workspaceId),
        gte(usageRecords.createdAt, startDate)
      )
    )
    .execute();

  return {
    totalTokens: Number(result[0]?.totalTokens) || 0,
    totalCost: Number(result[0]?.totalCost) || 0,
  };
}

/**
 * Get generic usage stats by period
 */
export async function getUsageStats(workspaceId: string, period: 'day' | 'week' | 'month'): Promise<UsageStats> {
  const now = new Date();
  let startDate = new Date();
  
  if (period === 'day') {
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'month') {
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  }

  return getStatsFrom(workspaceId, startDate);
}

export async function getBudgetConfig(workspaceId: string): Promise<BudgetConfig> {
  const data = await redis.get(`workspace:${workspaceId}:budget`);
  if (data) {
    try {
      return JSON.parse(data) as BudgetConfig;
    } catch {
      // ignore parse errors
    }
  }
  return {}; // default to no limits
}

export async function setBudgetConfig(workspaceId: string, config: BudgetConfig): Promise<void> {
  await redis.set(`workspace:${workspaceId}:budget`, JSON.stringify(config));
}

/**
 * Check if the workspace has exceeded its budget
 */
export async function checkBudget(workspaceId: string): Promise<{ allowed: boolean; reason?: string; usage: { dailyTokens: number; dailyCost: number; monthlyTokens: number; monthlyCost: number } }> {
  const budget = await getBudgetConfig(workspaceId);
  
  const [dailyStats, monthlyStats] = await Promise.all([
    getUsageStats(workspaceId, 'day'),
    getUsageStats(workspaceId, 'month'),
  ]);
  
  const usage = {
    dailyTokens: dailyStats.totalTokens,
    dailyCost: dailyStats.totalCost,
    monthlyTokens: monthlyStats.totalTokens,
    monthlyCost: monthlyStats.totalCost,
  };

  if (budget.dailyTokenLimit && usage.dailyTokens >= budget.dailyTokenLimit) {
    return { allowed: false, reason: 'Daily token limit exceeded', usage };
  }
  if (budget.dailyCostLimit && usage.dailyCost >= budget.dailyCostLimit) {
    return { allowed: false, reason: 'Daily cost limit exceeded', usage };
  }
  if (budget.monthlyTokenLimit && usage.monthlyTokens >= budget.monthlyTokenLimit) {
    return { allowed: false, reason: 'Monthly token limit exceeded', usage };
  }
  if (budget.monthlyCostLimit && usage.monthlyCost >= budget.monthlyCostLimit) {
    return { allowed: false, reason: 'Monthly cost limit exceeded', usage };
  }

  return { allowed: true, usage };
}

/**
 * Record a usage event
 */
export async function recordUsage(record: {
  workspaceId: string;
  userId: string;
  providerId: string;
  modelId: string;
  messageId?: string;
  researchSessionId?: string;
  operation: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  costEstimate?: number;
}): Promise<void> {
  await db.insert(usageRecords).values({
    workspaceId: record.workspaceId,
    userId: record.userId,
    providerId: record.providerId,
    modelId: record.modelId,
    messageId: record.messageId,
    researchSessionId: record.researchSessionId,
    operation: record.operation,
    inputTokens: record.inputTokens,
    outputTokens: record.outputTokens,
    totalTokens: record.totalTokens,
    costEstimate: record.costEstimate ? record.costEstimate.toString() : null,
  }).execute();
}
