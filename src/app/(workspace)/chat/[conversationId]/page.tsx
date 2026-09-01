import { ChatPanel } from "@/components/chat/chat-panel"

interface ChatPageProps {
  params: Promise<{
    conversationId: string
  }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { conversationId } = await params;
  return (
    <div className="h-full w-full bg-zinc-950">
      <ChatPanel conversationId={conversationId} />
    </div>
  )
}
