import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { messages, workspaceMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { redis } from '@/lib/redis';

export async function GET(req: Request, { params }: { params: Promise<{ messageId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { messageId } = await params;

  try {
    const message = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
      with: {
        conversation: {
          with: { project: true }
        }
      }
    });

    if (!message) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const member = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, message.conversation.project.workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });

    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const sendEvent = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        if (['complete', 'error', 'stopped'].includes(message.status)) {
          sendEvent({ type: 'content', content: message.content });
          sendEvent({ type: 'status', status: message.status });
          controller.close();
          return;
        }

        // Send existing content first if any
        if (message.content) {
          sendEvent({ type: 'content', content: message.content });
        }

        const subscriber = redis.duplicate();
        await subscriber.subscribe(`stream:message:${messageId}`);

        subscriber.on('message', (channel, eventStr) => {
          try {
            const event = JSON.parse(eventStr);
            sendEvent(event);
            
            if (event.type === 'status' && ['complete', 'error', 'stopped'].includes(event.status)) {
              subscriber.unsubscribe();
              subscriber.quit();
              controller.close();
            }
          } catch (e) {
            console.error('Failed to parse SSE event', e);
          }
        });

        req.signal.addEventListener('abort', () => {
          subscriber.unsubscribe();
          subscriber.quit();
          controller.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
