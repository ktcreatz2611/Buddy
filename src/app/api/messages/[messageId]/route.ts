import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { messages, conversations, workspaceMembers, projects } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

async function checkMessageAccess(messageId: string, userId: string) {
  const message = await db.query.messages.findFirst({
    where: eq(messages.id, messageId),
    with: {
      conversation: {
        with: { project: true }
      }
    }
  });

  if (!message) return null;

  const member = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, message.conversation.project.workspaceId),
      eq(workspaceMembers.userId, userId)
    ),
  });

  if (!member) return null;
  return message;
}

export async function GET(req: Request, { params }: { params: Promise<{ messageId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { messageId } = await params;

  try {
    const message = await checkMessageAccess(messageId, session.user.id);
    if (!message) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });

    const siblings = await db.query.messages.findMany({
      where: message.parentId 
        ? eq(messages.parentId, message.parentId)
        : (await import('drizzle-orm')).isNull(messages.parentId)
    });

    return NextResponse.json({
      data: {
        message,
        siblings,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
