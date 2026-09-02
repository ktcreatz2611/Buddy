import { z } from 'zod';
import { Tool } from '../types';
import { validateUrl } from '../ssrf-guard';

const inputSchema = z.object({
  url: z.string().url().describe('The URL to retrieve'),
  maxLength: z.number().optional().default(1048576).describe('Maximum content length in bytes (default 1MB)'),
});

type Input = z.infer<typeof inputSchema>;

interface RetrieverResult {
  content: string;
  title?: string;
  statusCode: number;
}

/**
 * Tool to retrieve content from a given URL safely, with SSRF protection.
 */
export const urlRetrieverTool: Tool<Input, RetrieverResult> = {
  name: 'url_retrieve',
  description: 'Safely retrieves content from a provided URL.',
  permissionScope: 'network',
  inputSchema,
  execute: async (input) => {
    // 1. SSRF Protection: Validate URL
    const validation = await validateUrl(input.url);
    if (!validation.allowed) {
      throw new Error(`Access to URL denied: ${validation.reason}`);
    }

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 10000); // 10 seconds timeout

    try {
      // 2. Fetch URL
      const res = await fetch(input.url, {
        signal: abortController.signal,
        redirect: 'manual', // Prevent automatic following to avoid SSRF bypass via redirect
        headers: {
          'User-Agent': 'Buddy-Workspace-Bot/1.0',
          'Accept': 'text/html,application/xhtml+xml,text/plain,*/*',
        }
      });

      // Handle Redirects safely
      if (res.status >= 300 && res.status < 400 && res.headers.has('location')) {
        const redirectUrl = new URL(res.headers.get('location')!, input.url).toString();
        const redirectValidation = await validateUrl(redirectUrl);
        if (!redirectValidation.allowed) {
          throw new Error('Redirected to a blocked URL');
        }
        // Could implement manual follow here, but for simplicity we'll throw or return partial
        throw new Error(`URL redirected to ${redirectUrl}. Please retrieve the new URL directly.`);
      }

      // Check Content-Length before downloading
      const contentLength = res.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > input.maxLength) {
        throw new Error('Content exceeds maximum length');
      }

      // Download content with length limits
      const text = await res.text();
      
      if (text.length > input.maxLength) {
        throw new Error('Response body exceeds maximum length');
      }

      // Very basic title extraction
      const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : undefined;

      return {
        content: text,
        title,
        statusCode: res.status,
      };

    } finally {
      clearTimeout(timeoutId);
    }
  },
};
