"use client"

import * as React from "react"
import { Activity, Coins, MessageSquare, Brain, Sparkles } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [stats, setStats] = React.useState<{
    totalTokens: number
    totalCost: number
    tokensByProvider: Record<string, number>
    tokensByModel: Record<string, number>
  } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    // Try to fetch real usage data — but gracefully show empty state if no workspace yet
    setLoading(false)
  }, [])

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 p-6 text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-400">Welcome to Buddy — your AI workspace.</p>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Tokens"
            value="0"
            icon={<Activity />}
          />
          <StatsCard
            title="Estimated Cost"
            value="$0.00"
            icon={<Coins />}
          />
          <StatsCard
            title="Active Conversations"
            value="0"
            icon={<MessageSquare />}
          />
          <StatsCard
            title="Research Sessions"
            value="0"
            icon={<Brain />}
          />
        </div>

        {/* Getting Started */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30">
                <Sparkles className="h-8 w-8 text-indigo-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-zinc-100">Get Started with Buddy</h2>
                <p className="text-sm text-zinc-400 max-w-md">
                  Set up your AI providers, start a conversation, and explore multi-model comparison, research, and more.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/settings/providers">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    1. Add API Keys
                  </Button>
                </Link>
                <Link href="/chat/new">
                  <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    2. Start a Chat
                  </Button>
                </Link>
                <Link href="/compare">
                  <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    3. Compare Models
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/documents">
            <Card className="bg-zinc-950 border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Documents</CardTitle>
                <CardDescription>Upload files for RAG-powered context in your chats.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/research">
            <Card className="bg-zinc-950 border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Research</CardTitle>
                <CardDescription>Run multi-agent research sessions on any topic.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/memories">
            <Card className="bg-zinc-950 border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Memory</CardTitle>
                <CardDescription>View and manage what Buddy remembers about you.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/tools">
            <Card className="bg-zinc-950 border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tools</CardTitle>
                <CardDescription>Web search, URL reader, calculator, and more.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/settings/providers">
            <Card className="bg-zinc-950 border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Providers</CardTitle>
                <CardDescription>Configure OpenAI, Gemini, Groq, DeepSeek, and more.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/settings/budget">
            <Card className="bg-zinc-950 border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Budget</CardTitle>
                <CardDescription>Set token and cost limits to control spending.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

      </div>
    </div>
  )
}
