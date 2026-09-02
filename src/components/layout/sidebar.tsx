"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Plus, Settings, Sparkles, Database, GitCompareArrows, FileText, Brain } from "lucide-react"

interface SidebarProps {
  className?: string
}

const MOCK_CONVERSATIONS = [
  { id: "1", title: "React Performance Tuning", date: "Today" },
  { id: "2", title: "API Design for Next.js", date: "Yesterday" },
  { id: "3", title: "GraphQL vs REST", date: "Last Week" },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("flex h-full flex-col bg-zinc-950 border-r border-zinc-800 text-zinc-300", className)}>
      {/* Header */}
      <div className="flex h-14 items-center px-4 border-b border-zinc-800 gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="font-semibold text-zinc-100 tracking-tight">Buddy</span>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button className="w-full justify-start gap-2 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border border-zinc-800 shadow-sm">
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-2">
          <p className="px-2 text-xs font-medium text-zinc-500 mb-2">Recent</p>
          {MOCK_CONVERSATIONS.map((conv) => (
            <Link key={conv.id} href={`/chat/${conv.id}`}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 h-10 px-2 font-normal truncate",
                  pathname === `/chat/${conv.id}` 
                    ? "bg-zinc-800 text-zinc-100" 
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                )}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate">{conv.title}</span>
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>

      {/* Footer Navigation */}
      <div className="p-4 border-t border-zinc-800 flex flex-col gap-1">
        <Link href="/compare">
          <Button variant="ghost" className={cn(
            "w-full justify-start gap-2 h-9 px-2",
            pathname?.startsWith('/compare')
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-100"
          )}>
            <GitCompareArrows className="h-4 w-4" />
            Compare
          </Button>
        </Link>
        <Link href="/documents">
          <Button variant="ghost" className={cn(
            "w-full justify-start gap-2 h-9 px-2",
            pathname?.startsWith('/documents')
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-100"
          )}>
            <FileText className="h-4 w-4" />
            Documents
          </Button>
        </Link>
        <Link href="/memories">
          <Button variant="ghost" className={cn(
            "w-full justify-start gap-2 h-9 px-2",
            pathname?.startsWith('/memories')
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-100"
          )}>
            <Brain className="h-4 w-4" />
            Memory
          </Button>
        </Link>
        <Link href="/settings/providers">
          <Button variant="ghost" className={cn(
            "w-full justify-start gap-2 h-9 px-2",
            pathname?.startsWith('/settings')
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-100"
          )}>
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>
    </div>
  )
}
