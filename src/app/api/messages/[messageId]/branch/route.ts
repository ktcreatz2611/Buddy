import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { messages, conversations, workspaceMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: Request, { params }: { params: Promise<{ messageId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { messageId } = await params;

  try {
    const body = await req.json();
    const { targetMessageId } = body;

    if (!targetMessageId) {
      return NextResponse.json({ error: 'targetMessageId is required' }, { status: 400 });
    }

    const currentMsg = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
      with: {
        conversation: {
          with: { project: true }
        }
      }
    });

    if (!currentMsg) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const member = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, currentMsg.conversation.project.workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });

    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const targetMsg = await db.query.messages.findFirst({
      where: eq(messages.id, targetMessageId)
    });

    if (!targetMsg || targetMsg.parentId !== currentMsg.parentId || targetMsg.conversationId !== currentMsg.conversationId) {
      return NextResponse.json({ error: 'Invalid target message' }, { status: 400 });
    }

    // Walk children to find leaf
    const allMessages = await db.query.messages.findMany({
      where: eq(messages.conversationId, currentMsg.conversationId)
    });

    const childrenMap = new Map<string, any[]>();
    for (const m of allMessages) {
      if (m.parentId) {
        if (!childrenMap.has(m.parentId)) childrenMap.set(m.parentId, []);
        childrenMap.get(m.parentId)!.push(m);
      }
    }

    let leafId = targetMessageId;
    while (childrenMap.has(leafId) && childrenMap.get(leafId)!.length > 0) {
      // Pick first child (latest by some convention, or just first in array)
      // Usually sort by createdAt desc if we want the most recent branch
      const children = childrenMap.get(leafId)!;
      children.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      leafId = children[0].id;
    }

    await db.update(conversations)
      .set({ activeLeafId: leafId, updatedAt: new Date() })
      .where(eq(conversations.id, currentMsg.conversationId));

    // Return the new active path
    const activeMessages = [];
    const messagesMap = new Map(allMessages.map(m => [m.id, m]));
    let currentId: string | null = leafId;
    while (currentId && messagesMap.has(currentId)) {
      const msg = messagesMap.get(currentId)!;
      const siblingsCount = (childrenMap.get(msg.parentId!) || []).length;
      activeMessages.push({ ...msg, siblingCount: siblingsCount });
      currentId = msg.parentId;
    }
    activeMessages.reverse();

    return NextResponse.json({ data: activeMessages });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
