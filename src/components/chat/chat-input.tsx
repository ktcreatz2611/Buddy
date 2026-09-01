"use client"

import * as React from "react"
import { Send, Square, ChevronUp } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu"

interface ChatInputProps {
  onSend: (content: string, model: string) => void
  onStop: () => void
  isStreaming: boolean
  availableModels: { id: string; name: string }[]
  className?: string
}

export function ChatInput({
  onSend,
  onStop,
  isStreaming,
  availableModels,
  className,
}: ChatInputProps) {
  const [content, setContent] = React.useState("")
  const [selectedModel, setSelectedModel] = React.useState(availableModels[0]?.id || "gpt-4")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 144)}px` // max 6 rows ~144px
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (content.trim() && !isStreaming) {
        onSend(content.trim(), selectedModel)
        setContent("")
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto"
        }
      }
    }
  }

  const selectedModelName = availableModels.find(m => m.id === selectedModel)?.name || "Select Model"

  return (
    <div className={cn("relative mx-auto w-full max-w-3xl p-4", className)}>
      <div className="relative flex flex-col w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 shadow-sm focus-within:ring-1 focus-within:ring-zinc-700">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Message Buddy..."
          className="min-h-[24px] max-h-[144px] w-full resize-none border-0 bg-transparent p-0 py-1 shadow-none focus-visible:ring-0 sm:text-sm"
          rows={1}
        />
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs font-medium text-zinc-400 hover:text-zinc-100">
                {selectedModelName}
                <ChevronUp className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-zinc-950 border-zinc-800">
              {availableModels.map((model) => (
                <DropdownMenuItem 
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className="text-sm cursor-pointer"
                >
                  {model.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 hidden sm:inline-block">
              {content.length > 0 && `${content.length} chars`}
            </span>
            {isStreaming ? (
              <Button 
                onClick={onStop}
                size="icon" 
                variant="destructive"
                className="h-8 w-8 rounded-full shadow-none"
              >
                <Square className="h-4 w-4 fill-current" />
                <span className="sr-only">Stop generating</span>
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  if (content.trim()) {
                    onSend(content.trim(), selectedModel)
                    setContent("")
                    if (textareaRef.current) textareaRef.current.style.height = "auto"
                  }
                }}
                disabled={!content.trim()}
                size="icon" 
                className="h-8 w-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-none transition-colors disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="text-center mt-2">
        <p className="text-[10px] text-zinc-500">Buddy can make mistakes. Verify important information.</p>
      </div>
    </div>
  )
}
