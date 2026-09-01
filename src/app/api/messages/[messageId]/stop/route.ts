import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { messages, conversations, workspaceMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { redis } from '@/lib/redis';

export async function POST(req: Request, { params }: { params: Promise<{ messageId: string }> }) {
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

    await redis.set(`cancel:message:${messageId}`, '1', 'EX', 60);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
