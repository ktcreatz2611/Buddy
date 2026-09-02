import { db } from '@/lib/db';
import { documentChunks, documents } from '@/lib/db/schema/documents';
import { sql } from 'drizzle-orm';
import { embedQuery } from './embedder';

export interface RetrievedChunk {
  content: string;
  documentId: string;
  filename: string;
  pageNumber: number | null;
  sectionPath: string | null;
  similarity: number;
}

export async function retrieveChunks(
  query: string,
  projectId: string,
  options: { topK?: number; minSimilarity?: number } = {}
): Promise<RetrievedChunk[]> {
  const topK = options.topK || 5;
  const minSimilarity = options.minSimilarity || 0.3;
  
  const queryEmbedding = await embedQuery(query);
  const embeddingString = `[${queryEmbedding.join(',')}]`;
  
  // Use pgvector distance operator <=> for cosine distance
  const similarityScore = sql<number>`1 - (${documentChunks.embedding} <=> ${embeddingString}::vector)`;
  
  const results = await db
    .select({
      content: documentChunks.content,
      documentId: documentChunks.documentId,
      filename: documents.filename,
      pageNumber: documentChunks.pageNumber,
      sectionPath: documentChunks.sectionPath,
      similarity: similarityScore,
    })
    .from(documentChunks)
    .innerJoin(documents, sql`${documentChunks.documentId} = ${documents.id}`)
    .where(sql`${documents.projectId} = ${projectId}`)
    .orderBy(sql`${documentChunks.embedding} <=> ${embeddingString}::vector`)
    .limit(topK);
    
  return results.filter(row => row.similarity >= minSimilarity);
}
