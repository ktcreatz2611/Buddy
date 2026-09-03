"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Plus, Settings, Sparkles, Database, GitCompareArrows, FileText, Brain, FlaskConical, Wrench, LayoutDashboard, ClipboardList, Trash2 } from "lucide-react"

interface Conversation {
  id: string
  title: string
  updatedAt: string
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [conversations, setConversations] = React.useState<Conversation[]>([])
  const [loading, setLoading] = React.useState(false)
  const [projectId, setProjectId] = React.useState<string | null>(null)

  // Fetch the user's default project and conversations
  React.useEffect(() => {
    async function load() {
      try {
        // Get user's workspace and project
        const wsRes = await fetch('/api/workspaces')
        if (!wsRes.ok) return
        const wsData = await wsRes.json()
        const workspace = wsData.data?.[0]
        if (!workspace) return

        const projRes = await fetch(`/api/projects?workspaceId=${workspace.id}`)
        if (!projRes.ok) return
        const projData = await projRes.json()
        const project = projData.data?.[0]
        if (!project) return
        setProjectId(project.id)

        const convRes = await fetch(`/api/conversations?projectId=${project.id}`)
        if (!convRes.ok) return
        const convData = await convRes.json()
        setConversations(convData.data || [])
      } catch (e) {
        // Silently fail — sidebar still works without conversations
      }
    }
    load()
  }, [pathname]) // Refresh when navigating

  const handleNewConversation = async () => {
    if (!projectId || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, title: 'New Conversation' }),
      })
      if (res.ok) {
        const data = await res.json()
        const newConv = data.data
        setConversations(prev => [newConv, ...prev])
        router.push(`/chat/${newConv.id}`)
      }
    } catch (e) {
      console.error('Failed to create conversation:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, convId: string) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const res = await fetch(`/api/conversations/${convId}`, { method: 'DELETE' })
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== convId))
        if (pathname === `/chat/${convId}`) {
          router.push('/dashboard')
        }
      }
    } catch (e) {
      console.error('Failed to delete conversation:', e)
    }
  }

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
        <Button
          onClick={handleNewConversation}
          disabled={loading || !projectId}
          className="w-full justify-start gap-2 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border border-zinc-800 shadow-sm disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {loading ? 'Creating...' : 'New Conversation'}
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-2">
          {conversations.length > 0 && (
            <p className="px-2 text-xs font-medium text-zinc-500 mb-2">Recent</p>
          )}
          {conversations.map((conv) => (
            <Link key={conv.id} href={`/chat/${conv.id}`}>
              <div className="group relative">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 h-10 px-2 font-normal truncate pr-8",
                    pathname === `/chat/${conv.id}` 
                      ? "bg-zinc-800 text-zinc-100" 
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">{conv.title}</span>
                </Button>
                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-900/50 text-zinc-500 hover:text-red-400 transition-all"
                  title="Delete conversation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </Link>
          ))}
          {conversations.length === 0 && projectId && (
            <p className="px-2 text-xs text-zinc-600 italic">No conversations yet</p>
          )}
        </div>
      </ScrollArea>

      {/* Footer Navigation */}
      <div className="p-4 border-t border-zinc-800 flex flex-col gap-1">
        <Link href="/dashboard">
          <Button variant="ghost" className={cn(
            "w-full justify-start gap-2 h-9 px-2",
            pathname?.startsWith('/dashboard')
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-100"
          )}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>
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
        <Link href="/research">
          <Button variant="ghost" className={cn(
            "w-full justify-start gap-2 h-9 px-2",
            pathname?.startsWith('/research')
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-100"
          )}>
            <FlaskConical className="h-4 w-4" />
            Research
          </Button>
        </Link>
        <Link href="/tools">
          <Button variant="ghost" className={cn(
            "w-full justify-start gap-2 h-9 px-2",
            pathname?.startsWith('/tools')
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-100"
          )}>
            <Wrench className="h-4 w-4" />
            Tools
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
        <Link href="/settings/audit">
          <Button variant="ghost" className={cn(
            "w-full justify-start gap-2 h-9 px-2",
            pathname?.startsWith('/settings/audit')
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-100"
          )}>
            <ClipboardList className="h-4 w-4" />
            Audit Log
          </Button>
        </Link>
        <Link href="/settings/providers">
          <Button variant="ghost" className={cn(
            "w-full justify-start gap-2 h-9 px-2",
            pathname === '/settings/providers' || pathname === '/settings'
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
