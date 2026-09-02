import type { ParsedDocument } from './parser';

export interface TextChunk {
  content: string;
  chunkIndex: number;
  pageNumber?: number;
  sectionPath?: string;
  tokenCount: number;
}

/**
 * Splits a parsed document into structured chunks.
 */
export function chunkDocument(
  parsed: ParsedDocument, 
  options: { maxTokens?: number; overlap?: number } = {}
): TextChunk[] {
  const maxTokens = options.maxTokens || 500;
  const overlap = options.overlap || 50;
  
  const chunks: TextChunk[] = [];
  
  // Very simplistic chunking logic splitting by paragraphs and assembling up to maxTokens.
  // Assuming ~4 characters per token
  const maxChars = maxTokens * 4;
  const overlapChars = overlap * 4;
  
  if (parsed.pages && parsed.pages.length > 0) {
    let globalChunkIndex = 0;
    for (const page of parsed.pages) {
      const pageChunks = splitText(page.content, maxChars, overlapChars);
      for (const text of pageChunks) {
        chunks.push({
          content: text,
          chunkIndex: globalChunkIndex++,
          pageNumber: page.pageNumber,
          sectionPath: page.sectionPath,
          tokenCount: Math.ceil(text.length / 4)
        });
      }
    }
  } else {
    // Split full text
    const textChunks = splitText(parsed.content, maxChars, overlapChars);
    for (let i = 0; i < textChunks.length; i++) {
      const text = textChunks[i];
      chunks.push({
        content: text,
        chunkIndex: i,
        tokenCount: Math.ceil(text.length / 4)
      });
    }
  }

  return chunks;
}

function splitText(text: string, maxChars: number, overlapChars: number): string[] {
  if (!text) return [];
  
  const paragraphs = text.split('\n\n');
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const para of paragraphs) {
    if (currentChunk.length + para.length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Create new chunk with overlap from the end of the previous chunk
      currentChunk = currentChunk.slice(-overlapChars) + '\n\n' + para;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}
