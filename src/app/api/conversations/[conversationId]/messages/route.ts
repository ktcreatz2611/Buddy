import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { conversations, messages, credentials, models, workspaceMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { chatGenerationQueue, ChatGenerationJobData } from '@/lib/worker/queues';

export async function GET(req: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { conversationId } = await params;

  try {
    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
      with: { project: true }
    });

    if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const member = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, conversation.project.workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });

    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const allMessages = await db.query.messages.findMany({
      where: eq(messages.conversationId, conversationId),
    });

    // compute children map
    const childrenMap = new Map<string | null, any[]>();
    for (const msg of allMessages) {
      const pId = msg.parentId;
      if (!childrenMap.has(pId)) childrenMap.set(pId, []);
      childrenMap.get(pId)!.push(msg);
    }

    const messagesMap = new Map(allMessages.map(m => [m.id, m]));
    const activeMessages = [];
    
    let currentId = conversation.activeLeafId;
    while (currentId && messagesMap.has(currentId)) {
      const msg = messagesMap.get(currentId)!;
      // append sibling count
      const siblingsCount = (childrenMap.get(msg.parentId) || []).length;
      activeMessages.push({ ...msg, siblingCount: siblingsCount });
      currentId = msg.parentId;
    }
    
    activeMessages.reverse();

    return NextResponse.json({ data: activeMessages });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { conversationId } = await params;

  try {
    const body = await req.json();
    const { content, modelId, providerId } = body;

    if (!content || !modelId || !providerId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
      with: { project: true }
    });

    if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const workspaceId = conversation.project.workspaceId;

    const member = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });

    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Ensure credential exists
    const cred = await db.query.credentials.findFirst({
      where: and(
        eq(credentials.workspaceId, workspaceId),
        eq(credentials.providerId, providerId)
      )
    });

    if (!cred) {
      return NextResponse.json({ error: 'Provider credential not found' }, { status: 400 });
    }

    const modelInfo = await db.query.models.findFirst({
      where: eq(models.id, modelId)
    });

    if (!modelInfo) return NextResponse.json({ error: 'Model not found' }, { status: 400 });

    const parentId = conversation.activeLeafId || null;

    const [userMessage] = await db.insert(messages).values({
      conversationId,
      role: 'user',
      content: [{ type: 'text', text: content }],
      status: 'complete',
      parentId,
    }).returning();

    const [assistantMessage] = await db.insert(messages).values({
      conversationId,
      role: 'assistant',
      content: [{ type: 'text', text: '' }],
      status: 'pending',
      parentId: userMessage.id,
      modelId,
      providerId
    }).returning();

    await db.update(conversations)
      .set({ activeLeafId: assistantMessage.id, updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));

    const jobData: ChatGenerationJobData = {
      messageId: assistantMessage.id,
      conversationId,
      providerId,
      modelId,
      modelKey: modelInfo.modelId ?? modelInfo.name ?? '',
      credentialId: cred.id,
    };
    
    await chatGenerationQueue.add('generate-chat', jobData, {
      jobId: assistantMessage.id,
    });

    return NextResponse.json({ data: { messageId: assistantMessage.id, userMessageId: userMessage.id } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
