import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparisons } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ comparisonId: string }> }
) {
  const session = await auth();
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

  const { comparisonId } = await params;

  const comparison = await db.query.comparisons.findFirst({
    where: eq(comparisons.id, comparisonId),
    with: {
      responses: true,
    },
  });

  if (!comparison) return new NextResponse('Not found', { status: 404 });

  return NextResponse.json(comparison);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ comparisonId: string }> }
) {
  const session = await auth();
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

  const { comparisonId } = await params;

  await db.delete(comparisons).where(eq(comparisons.id, comparisonId));

  return NextResponse.json({ success: true });
}
