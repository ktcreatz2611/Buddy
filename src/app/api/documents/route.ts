import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema/documents';
import { documentProcessingQueue } from '@/lib/worker/queues';
import { auth } from '@/lib/auth';
import { fileTypeFromBuffer } from 'file-type';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const projectId = formData.get('projectId') as string | null;

    if (!file || !projectId) {
      return NextResponse.json({ error: 'Missing file or projectId' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Magic byte validation
    const typeInfo = await fileTypeFromBuffer(buffer);
    const mimeType = typeInfo?.mime || file.type;
    const ext = typeInfo?.ext || file.name.split('.').pop() || '';
    
    const validMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/json',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    const validExts = ['pdf', 'docx', 'txt', 'md', 'csv', 'json', 'xlsx', 'xls', 'png', 'jpg', 'jpeg', 'webp', 'gif'];
    const isImage = mimeType.startsWith('image/');
    
    if (!validMimes.includes(mimeType) && !isImage && !validExts.includes(ext.toLowerCase())) {
      return NextResponse.json({ error: `Unsupported file type: ${mimeType}` }, { status: 400 });
    }

    const uuid = uuidv4();
    // Sanitize filename to avoid weird chars
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageDir = path.join(process.cwd(), 'uploads', projectId);
    const storageKey = path.posix.join('uploads', projectId, `${uuid}-${sanitizedFilename}`);
    
    await fs.mkdir(storageDir, { recursive: true });
    await fs.writeFile(path.join(process.cwd(), storageKey), buffer);

    const [doc] = await db.insert(documents).values({
      projectId,
      filename: file.name,
      mimeType,
      sizeBytes: file.size,
      storageKey,
      status: 'processing',
    }).returning();

    await documentProcessingQueue.add('process-document', {
      documentId: doc.id,
      projectId,
    });

    return NextResponse.json({ document: doc });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const docs = await db.query.documents.findMany({
      where: (docs, { eq }) => eq(docs.projectId, projectId),
      orderBy: (docs, { desc }) => [desc(docs.createdAt)],
    });

    return NextResponse.json({ documents: docs });
  } catch (error) {
    console.error('List docs error:', error);
    return NextResponse.json({ error: 'Failed to list documents' }, { status: 500 });
  }
}
