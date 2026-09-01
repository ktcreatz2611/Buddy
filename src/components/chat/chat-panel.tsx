"use client"

import * as React from "react"
import { MessageList } from "./message-list"
import { ChatInput } from "./chat-input"
import { type Message } from "./message-bubble"
import { useChatStream } from "@/hooks/use-chat-stream"
import { v4 as uuidv4 } from "uuid"

interface ChatPanelProps {
  conversationId: string
}

// Temporary mock models list. In a real app, fetch from API.
const MOCK_MODELS = [
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" }
]

export function ChatPanel({ conversationId }: ChatPanelProps) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [activeMessageId, setActiveMessageId] = React.useState<string | null>(null)
  const { content: streamContent, status: streamStatus, error: streamError, tokenUsage } = useChatStream(activeMessageId)

  // Fetch initial messages (mocked for now)
  React.useEffect(() => {
    // In a real app, this would be a fetch to /api/conversations/[id]/messages
    // setMessages(fetchedMessages)
  }, [conversationId])

  // Update messages with streaming content
  React.useEffect(() => {
    if (activeMessageId && streamContent) {
      setMessages(prev => {
        const msgIndex = prev.findIndex(m => m.id === activeMessageId)
        if (msgIndex === -1) return prev
        const newMessages = [...prev]
        newMessages[msgIndex] = {
          ...newMessages[msgIndex],
          content: streamContent,
          status: streamStatus === 'idle' ? newMessages[msgIndex].status : streamStatus,
          tokenUsage: tokenUsage || undefined,
        }
        return newMessages
      })
    }
  }, [activeMessageId, streamContent, streamStatus, tokenUsage])

  const handleSend = async (content: string, model: string) => {
    // Optimistically add user message
    const userMsgId = uuidv4()
    const userMsg: Message = {
      id: userMsgId,
      role: "user",
      content,
      status: "complete",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const assistantMsgId = uuidv4()
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      status: "streaming",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setActiveMessageId(assistantMsgId)

    // Trigger API call here
    try {
      // await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ conversationId, content, model, messageId: assistantMsgId }) })
    } catch (e) {
      setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, status: "error" } : m))
    }
  }

  const handleStop = () => {
    if (activeMessageId) {
      // In a real app, call API to stop generation
      setMessages(prev => prev.map(m => m.id === activeMessageId ? { ...m, status: "stopped" } : m))
      setActiveMessageId(null)
    }
  }

  const handleRegenerate = (id: string) => {
    // Handle regeneration logic (creating branch)
    console.log("Regenerate", id)
  }

  const handleEdit = (id: string, newContent: string) => {
    // Handle edit logic (creating branch)
    console.log("Edit", id, newContent)
  }

  const handleBranchSwitch = (id: string, direction: "prev" | "next") => {
    // Handle branch navigation logic
    console.log("Switch branch", id, direction)
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-zinc-950">
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={messages} 
          isLoading={streamStatus === "streaming"}
          onRegenerate={handleRegenerate}
          onEdit={handleEdit}
          onBranchSwitch={handleBranchSwitch}
        />
      </div>
      <div className="mt-auto">
        <ChatInput 
          onSend={handleSend} 
          onStop={handleStop} 
          isStreaming={streamStatus === "streaming"}
          availableModels={MOCK_MODELS}
        />
      </div>
    </div>
  )
}
