import { Worker, Job } from 'bullmq';
import { redis } from '@/lib/redis';
import { db } from '@/lib/db';
import { documents, documentChunks } from '@/lib/db/schema/documents';
import { eq } from 'drizzle-orm';
import { DocumentProcessingJobData } from './queues';
import { parseDocument } from '@/lib/documents/parser';
import { chunkDocument } from '@/lib/documents/chunker';
import { embedTexts } from '@/lib/documents/embedder';
import fs from 'fs/promises';
import path from 'path';

export const documentProcessingWorker = new Worker<DocumentProcessingJobData>(
  'document-processing',
  async (job: Job<DocumentProcessingJobData>) => {
    const { documentId } = job.data;
    
    try {
      // 1. Fetch document record
      const doc = await db.query.documents.findFirst({
        where: eq(documents.id, documentId),
      });
      
      if (!doc || !doc.storageKey) {
        throw new Error('Document not found or missing storage key');
      }
      
      // 2. Read file from storage
      const filePath = path.join(process.cwd(), doc.storageKey);
      const buffer = await fs.readFile(filePath);
      
      // 3. Parse document
      const parsed = await parseDocument(buffer, doc.mimeType || 'application/octet-stream', doc.filename);
      
      // 4. Chunk document
      const chunks = chunkDocument(parsed);
      
      if (chunks.length > 0) {
        // 5. Embed chunks
        const texts = chunks.map(c => c.content);
        const embeddings = await embedTexts(texts);
        
        // 6. Insert chunks
        const chunksToInsert = chunks.map((chunk, idx) => ({
          documentId,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          pageNumber: chunk.pageNumber,
          sectionPath: chunk.sectionPath,
          tokenCount: chunk.tokenCount,
          embedding: embeddings[idx],
        }));
        
        // Insert in batches
        for (let i = 0; i < chunksToInsert.length; i += 100) {
          await db.insert(documentChunks).values(chunksToInsert.slice(i, i + 100));
        }
      }
      
      // 7. Update document status to ready
      await db.update(documents)
        .set({ 
          status: 'ready',
          pageCount: parsed.pageCount || null,
          metadata: parsed.metadata ? JSON.parse(JSON.stringify(parsed.metadata)) : null,
          updatedAt: new Date(),
        })
        .where(eq(documents.id, documentId));
        
    } catch (error) {
      console.error(`Error processing document ${documentId}:`, error);
      
      await db.update(documents)
        .set({ 
          status: 'error',
          updatedAt: new Date(),
        })
        .where(eq(documents.id, documentId));
        
      throw error;
    }
  },
  { connection: redis }
);
