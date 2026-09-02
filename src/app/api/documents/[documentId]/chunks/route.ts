import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documentChunks } from '@/lib/db/schema/documents';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { documentId } = await params;
    
    const chunks = await db.query.documentChunks.findMany({
      where: eq(documentChunks.documentId, documentId),
      orderBy: (chunks, { asc }) => [asc(chunks.chunkIndex)],
      columns: {
        embedding: false, // Exclude heavy embeddings
      }
    });

    return NextResponse.json({ chunks });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get chunks' }, { status: 500 });
  }
}
