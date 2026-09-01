import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Copy, RefreshCw, Edit2, ChevronLeft, ChevronRight, User, Bot } from "lucide-react"
import { MessageContent } from "./message-content"

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  status?: "streaming" | "complete" | "error" | "stopped"
  tokenUsage?: {
    prompt: number
    completion: number
    cost?: number
  }
  timestamp?: string
  siblings?: string[] // IDs of sibling messages (branches)
  siblingIndex?: number
}

interface MessageBubbleProps {
  message: Message
  onRegenerate?: (id: string) => void
  onEdit?: (id: string, newContent: string) => void
  onBranchSwitch?: (id: string, direction: "prev" | "next") => void
}

export function MessageBubble({
  message,
  onRegenerate,
  onEdit,
  onBranchSwitch,
}: MessageBubbleProps) {
  const isUser = message.role === "user"

  const hasBranches = message.siblings && message.siblings.length > 1
  const branchText = hasBranches
    ? `${(message.siblingIndex ?? 0) + 1}/${message.siblings!.length}`
    : null

  return (
    <div
      className={cn(
        "group flex w-full gap-4 py-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <Avatar className={cn("h-8 w-8", isUser ? "bg-indigo-600" : "bg-zinc-800")}>
        <AvatarFallback className="bg-transparent text-white">
          {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Body */}
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2 rounded-2xl px-5 py-4",
          isUser
            ? "bg-indigo-600 text-white rounded-tr-sm"
            : "bg-zinc-900/50 border border-zinc-800 text-zinc-100 rounded-tl-sm"
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-semibold opacity-70">
            {isUser ? "You" : "Assistant"}
          </span>
          {message.timestamp && (
            <span className="text-xs opacity-50">{message.timestamp}</span>
          )}
        </div>

        <MessageContent content={message.content} />

        {/* Status Indicators */}
        {message.status === "streaming" && (
          <div className="flex items-center gap-1 mt-2 opacity-70">
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
        {message.status === "error" && (
          <div className="text-xs text-red-400 mt-2">Error generating response.</div>
        )}
        {message.status === "stopped" && (
          <div className="text-xs text-zinc-500 mt-2 italic">Generation stopped.</div>
        )}

        {/* Action Buttons & Branch Navigator */}
        <div className="mt-2 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex items-center gap-1">
            {hasBranches && (
              <div className="flex items-center gap-1 mr-2 text-xs">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-70 hover:opacity-100"
                  onClick={() => onBranchSwitch?.(message.id, "prev")}
                  disabled={message.siblingIndex === 0}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="opacity-70">{branchText}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-70 hover:opacity-100"
                  onClick={() => onBranchSwitch?.(message.id, "next")}
                  disabled={message.siblingIndex === (message.siblings?.length ?? 1) - 1}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => navigator.clipboard.writeText(message.content)}
              title="Copy message"
            >
              <Copy className="h-3 w-3" />
            </Button>
            
            {isUser && onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onEdit(message.id, message.content)}
                title="Edit message"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
            
            {!isUser && onRegenerate && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onRegenerate(message.id)}
                title="Regenerate response"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Token Usage */}
          {message.tokenUsage && (
            <div className="text-[10px] text-zinc-500 text-right">
              {message.tokenUsage.prompt + message.tokenUsage.completion} tokens
              {message.tokenUsage.cost && ` · $${message.tokenUsage.cost.toFixed(4)}`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
