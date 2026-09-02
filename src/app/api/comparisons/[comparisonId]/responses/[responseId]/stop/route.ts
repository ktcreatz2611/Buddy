import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { auth } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ comparisonId: string; responseId: string }> }
) {
  const session = await auth();
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

  const { responseId } = await params;

  await redis.setex(`cancel:comparison:response:${responseId}`, 3600, '1');

  return NextResponse.json({ success: true });
}
