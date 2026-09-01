import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { messages, conversations, workspaceMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { chatGenerationQueue, ChatGenerationJobData } from '@/lib/worker/queues';

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

    if (!message || message.role !== 'assistant') {
      return NextResponse.json({ error: 'Not found or not assistant message' }, { status: 404 });
    }

    const workspaceId = message.conversation.project.workspaceId;
    const member = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });

    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const [newAssistantMessage] = await db.insert(messages).values({
      conversationId: message.conversationId,
      role: 'assistant',
      content: [{ type: 'text', text: '' }],
      status: 'pending',
      parentId: message.parentId,
      modelId: message.modelId,
      providerId: message.providerId,
    }).returning();

    await db.update(conversations)
      .set({ activeLeafId: newAssistantMessage.id, updatedAt: new Date() })
      .where(eq(conversations.id, message.conversationId));

    // Lookup credential and model info
    let credentialId = '';
    if (message.providerId) {
      const cred = await db.query.credentials.findFirst({
        where: and(
          eq((await import('@/lib/db/schema')).credentials.workspaceId, workspaceId),
          eq((await import('@/lib/db/schema')).credentials.providerId, message.providerId)
        ),
      });
      credentialId = cred?.id ?? '';
    }

    const modelInfo = message.modelId ? await db.query.models.findFirst({
      where: eq((await import('@/lib/db/schema')).models.id, message.modelId),
    }) : null;

    const jobData: ChatGenerationJobData = {
      messageId: newAssistantMessage.id,
      conversationId: message.conversationId,
      providerId: message.providerId ?? '',
      modelId: message.modelId ?? '',
      modelKey: modelInfo?.modelId ?? modelInfo?.name ?? '',
      credentialId,
    };
    
    await chatGenerationQueue.add('generate-chat', jobData, {
      jobId: newAssistantMessage.id,
    });

    return NextResponse.json({ data: { messageId: newAssistantMessage.id } });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
