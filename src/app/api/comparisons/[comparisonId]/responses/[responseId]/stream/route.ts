import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparisonResponses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { redis } from '@/lib/redis';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ comparisonId: string; responseId: string }> }
) {
  const session = await auth();
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

  const { responseId } = await params;

  const response = await db.query.comparisonResponses.findFirst({
    where: eq(comparisonResponses.id, responseId),
  });

  if (!response) return new NextResponse('Not found', { status: 404 });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Replay persisted content
      if (response.content) {
        send({ type: 'replay', text: response.content });
      }

      // If already terminal, send final event and close
      if (response.status === 'complete' || response.status === 'error' || response.status === 'stopped') {
        send({
          type: response.status,
          message: response.error ?? undefined,
          latencyMs: response.latencyMs,
          inputTokens: response.inputTokens,
          outputTokens: response.outputTokens,
          totalTokens: response.totalTokens,
          estimatedCost: response.estimatedCost,
        });
        controller.close();
        return;
      }

      // Subscribe to live updates via Redis pub/sub
      const channel = `comparison:response:${responseId}`;
      const subscriber = redis.duplicate();
      
      subscriber.on('message', (ch: string, message: string) => {
        if (ch !== channel) return;
        try {
          const data = JSON.parse(message);
          send(data);
          if (data.type === 'complete' || data.type === 'error') {
            subscriber.unsubscribe(channel);
            subscriber.quit();
            controller.close();
          }
        } catch {
          // ignore parse errors
        }
      });

      await subscriber.subscribe(channel);

      req.signal.addEventListener('abort', () => {
        subscriber.unsubscribe(channel).catch(() => {});
        subscriber.quit().catch(() => {});
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
