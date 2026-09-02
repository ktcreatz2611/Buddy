/**
 * Embedding service for document chunks
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  // In a real implementation, we would call an LLM provider (e.g. OpenAI)
  // For now, return random 384-dimensional embeddings as a stub.
  
  // Process in batches of 100 texts to simulate limits
  const embeddings: number[][] = [];
  
  for (const _ of texts) {
    const embedding = Array.from({ length: 384 }, () => Math.random() - 0.5);
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    embeddings.push(embedding.map(val => val / magnitude));
  }
  
  return embeddings;
}

export async function embedQuery(query: string): Promise<number[]> {
  const [embedding] = await embedTexts([query]);
  return embedding;
}
