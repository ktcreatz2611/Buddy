import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { retrieveChunks } from '@/lib/documents/retriever';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { query, projectId, topK = 5, minSimilarity = 0.3 } = body;

    if (!query || !projectId) {
      return NextResponse.json({ error: 'Missing query or projectId' }, { status: 400 });
    }

    const chunks = await retrieveChunks(query, projectId, { topK, minSimilarity });

    return NextResponse.json({ results: chunks });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
