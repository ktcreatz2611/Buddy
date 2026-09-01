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
    const body = await req.json();
    const { content } = body;

    if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

    const message = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
      with: {
        conversation: {
          with: { project: true }
        }
      }
    });

    if (!message || message.role !== 'user') {
      return NextResponse.json({ error: 'Not found or not user message' }, { status: 404 });
    }

    const workspaceId = message.conversation.project.workspaceId;
    const member = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });

    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Look for previous assistant child of the original user message to get the modelId and providerId
    const originalChildren = await db.query.messages.findMany({
      where: eq(messages.parentId, message.id)
    });
    
    // Pick first child as reference for model
    const referenceChild = originalChildren.find(m => m.role === 'assistant');
    
    // Create new user message sibling
    const [newUserMessage] = await db.insert(messages).values({
      conversationId: message.conversationId,
      role: 'user',
      content: [{ type: 'text', text: content }],
      status: 'complete',
      parentId: message.parentId,
    }).returning();

    // Create new assistant placeholder
    const [newAssistantMessage] = await db.insert(messages).values({
      conversationId: message.conversationId,
      role: 'assistant',
      content: [{ type: 'text', text: '' }],
      status: 'pending',
      parentId: newUserMessage.id,
      modelId: referenceChild?.modelId || null,
      providerId: referenceChild?.providerId || null,
    }).returning();

    await db.update(conversations)
      .set({ activeLeafId: newAssistantMessage.id, updatedAt: new Date() })
      .where(eq(conversations.id, message.conversationId));

    // Find credential for this provider
    const providerId = referenceChild?.providerId;
    const modelId = referenceChild?.modelId;
    
    let credentialId = '';
    if (providerId) {
      const cred = await db.query.credentials.findFirst({
        where: and(
          eq((await import('@/lib/db/schema')).credentials.workspaceId, workspaceId),
          eq((await import('@/lib/db/schema')).credentials.providerId, providerId)
        ),
      });
      credentialId = cred?.id ?? '';
    }

    const modelInfo = modelId ? await db.query.models.findFirst({
      where: eq((await import('@/lib/db/schema')).models.id, modelId),
    }) : null;

    const jobData: ChatGenerationJobData = {
      messageId: newAssistantMessage.id,
      conversationId: message.conversationId,
      providerId: providerId ?? '',
      modelId: modelId ?? '',
      modelKey: modelInfo?.modelId ?? modelInfo?.name ?? '',
      credentialId,
    };
    
    await chatGenerationQueue.add('generate-chat', jobData, {
      jobId: newAssistantMessage.id,
    });

    return NextResponse.json({ 
      data: { 
        messageId: newAssistantMessage.id, 
        userMessageId: newUserMessage.id 
      } 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
