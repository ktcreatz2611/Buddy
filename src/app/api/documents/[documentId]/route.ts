import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema/documents';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { documentId } = await params;
    
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, documentId),
      with: {
        chunks: {
          columns: { id: true },
        },
      },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      document: {
        ...doc,
        chunkCount: doc.chunks.length,
        chunks: undefined
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get document' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { documentId } = await params;
    
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, documentId),
    });

    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    // Delete file
    if (doc.storageKey) {
      try {
        await fs.unlink(path.join(process.cwd(), doc.storageKey));
      } catch (e) {
        console.error('File delete error:', e);
      }
    }

    // Delete db record (cascade handles chunks)
    await db.delete(documents).where(eq(documents.id, documentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
