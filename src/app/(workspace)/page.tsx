import { Button } from "@/components/ui/button"
import { MessageSquare, Plus, Zap } from "lucide-react"
import Link from "next/link"

export default function WorkspacePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 bg-zinc-950">
      <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-500">
            <Zap className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-100">Welcome to Buddy</h1>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">
            Your intelligent AI assistant with multi-provider support. Choose a model and start a conversation.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Button size="lg" className="h-12 px-8 bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
            <Plus className="mr-2 h-5 w-5" />
            New Conversation
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-12 text-left">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-zinc-400" />
              Recent Chats
            </h3>
            <p className="mt-2 text-sm text-zinc-500">
              Jump back into your recent conversations with various models.
            </p>
            <div className="mt-4 space-y-2">
              <Link href="/chat/1" className="block text-sm text-indigo-400 hover:text-indigo-300">
                React Performance Tuning →
              </Link>
              <Link href="/chat/2" className="block text-sm text-indigo-400 hover:text-indigo-300">
                API Design for Next.js →
              </Link>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
              <Zap className="h-4 w-4 text-zinc-400" />
              Quick Stats
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-semibold text-zinc-100">12</p>
                <p className="text-xs text-zinc-500 mt-1">Conversations</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-zinc-100">342</p>
                <p className="text-xs text-zinc-500 mt-1">Messages</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
