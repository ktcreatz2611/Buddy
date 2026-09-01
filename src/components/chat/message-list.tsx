"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageBubble, type Message } from "./message-bubble"
import { cn } from "@/lib/utils"
import { Bot } from "lucide-react"

interface MessageListProps {
  messages: Message[]
  isLoading?: boolean
  onRegenerate?: (id: string) => void
  onEdit?: (id: string, newContent: string) => void
  onBranchSwitch?: (id: string, direction: "prev" | "next") => void
}

export function MessageList({
  messages,
  isLoading,
  onRegenerate,
  onEdit,
  onBranchSwitch,
}: MessageListProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = React.useState(true)

  // Auto-scroll logic
  React.useEffect(() => {
    if (isAutoScrollEnabled && scrollRef.current) {
      const scrollElement = scrollRef.current
      scrollElement.scrollTop = scrollElement.scrollHeight
    }
  }, [messages, isAutoScrollEnabled])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const { scrollTop, scrollHeight, clientHeight } = target
    const distanceToBottom = scrollHeight - scrollTop - clientHeight
    setIsAutoScrollEnabled(distanceToBottom < 100)
  }

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <Bot className="h-8 w-8 text-zinc-400" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight">How can I help you today?</h3>
        <p className="mt-2 text-sm text-zinc-500 max-w-sm">
          Start a conversation by typing a message below. You can ask me anything, from code explanations to creative writing.
        </p>
      </div>
    )
  }

  return (
    <ScrollArea 
      className="h-full px-4 w-full"
    >
      <div ref={scrollRef} onScroll={handleScroll as any}>
      <div className="mx-auto flex max-w-3xl flex-col gap-2 py-6">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onRegenerate={onRegenerate}
            onEdit={onEdit}
            onBranchSwitch={onBranchSwitch}
          />
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-center gap-4 py-4">
            <div className="h-8 w-8 rounded-full bg-zinc-800 animate-pulse" />
            <div className="flex h-[60px] w-[120px] rounded-2xl bg-zinc-900/50 border border-zinc-800 rounded-tl-sm animate-pulse" />
          </div>
        )}
      </div>
      </div>
    </ScrollArea>
  )
}
