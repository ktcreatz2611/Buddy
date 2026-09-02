import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Clock, FileText, FlaskConical } from "lucide-react"
import { NewResearchDialog } from "@/components/research/new-research-dialog"

// Mock data
const mockSessions = [
  {
    id: "session-1",
    question: "What are the latest advancements in solid-state batteries?",
    status: "investigating",
    turns: 12,
    tokens: 45000,
    elapsed: "5m 20s",
    date: "Just now",
  },
  {
    id: "session-2",
    question: "Comparison of Next.js App Router vs Pages Router performance metrics",
    status: "complete",
    turns: 20,
    tokens: 89000,
    elapsed: "12m 45s",
    date: "2 hours ago",
  },
]

export default function ResearchPage() {
  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-100 p-6 md:p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Research</h1>
          <p className="text-zinc-400">Deep dive into complex topics with autonomous agents.</p>
        </div>
        <NewResearchDialog />
      </div>

      <div className="grid gap-4">
        {mockSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/50">
            <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <FlaskConical className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">Start your first research session</h3>
            <p className="text-zinc-500 mb-4 max-w-sm">
              Ask a complex question and let Buddy's agents search, analyze, and synthesize a comprehensive report.
            </p>
            <NewResearchDialog />
          </div>
        ) : (
          mockSessions.map((session) => (
            <Link key={session.id} href={`/research/${session.id}`}>
              <div className="flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors cursor-pointer group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={
                      session.status === "complete" ? "border-emerald-500/30 text-emerald-400" :
                      session.status === "investigating" ? "border-blue-500/30 text-blue-400" :
                      "border-zinc-700 text-zinc-400"
                    }>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </Badge>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {session.elapsed}
                    </span>
                    <span className="text-xs text-zinc-500 ml-2">{session.date}</span>
                  </div>
                  <h3 className="text-lg font-medium text-zinc-100 truncate group-hover:text-indigo-400 transition-colors">
                    {session.question}
                  </h3>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-zinc-400 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-zinc-300 font-medium">{session.turns} turns</span>
                    <span className="text-xs">{Math.round(session.tokens / 1000)}k tokens</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
