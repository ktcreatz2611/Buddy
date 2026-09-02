import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { redis } from '@/lib/redis';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const { sessionId } = await params;
  const channel = `research:progress:${sessionId}`;

  const stream = new ReadableStream({
    async start(controller) {
      const subscriber = redis.duplicate();

      subscriber.on('message', (ch: string, message: string) => {
        if (ch !== channel) return;
        controller.enqueue(`data: ${message}\n\n`);
        try {
          const data = JSON.parse(message);
          if (data.type === 'done' || data.status === 'complete' || data.status === 'cancelled' || data.status === 'error') {
            subscriber.unsubscribe();
            subscriber.quit();
            controller.close();
          }
        } catch (_e) { /* ignore parse errors */ }
      });

      await subscriber.subscribe(channel);

      req.signal.addEventListener('abort', () => {
        subscriber.unsubscribe();
        subscriber.quit();
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
