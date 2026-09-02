import { z } from 'zod';
import { Tool } from '../types';

const inputSchema = z.object({
  query: z.string().min(1).describe('The search query'),
  maxResults: z.number().optional().default(5).describe('Maximum number of results to return'),
});

type Input = z.infer<typeof inputSchema>;

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * Web search tool using SearXNG.
 */
export const webSearchTool: Tool<Input, { results: SearchResult[] }> = {
  name: 'web_search',
  description: 'Searches the web for recent information using SearXNG.',
  permissionScope: 'network',
  inputSchema,
  execute: async (input) => {
    const searxngUrl = process.env.SEARXNG_URL;
    
    if (!searxngUrl) {
      // Fallback stub if no configured URL
      return {
        results: [
          {
            title: `Mock Search Result for "${input.query}"`,
            url: 'https://example.com',
            snippet: 'This is a mocked response because SEARXNG_URL is not configured.',
          }
        ]
      };
    }

    const url = new URL('/search', searxngUrl);
    url.searchParams.set('q', input.query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('engines', 'google,bing,duckduckgo');

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Web search failed with status ${res.status}`);
    }

    const data = await res.json();
    
    const results: SearchResult[] = (data.results || []).slice(0, input.maxResults).map((r: any) => ({
      title: r.title || '',
      url: r.url || '',
      snippet: r.content || r.snippet || '',
    }));

    return { results };
  },
};
