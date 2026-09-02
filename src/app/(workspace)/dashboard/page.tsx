import * as React from "react"
import { Activity, Coins, MessageSquare, Brain } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { UsageChart } from "@/components/dashboard/usage-chart"
import { ProviderBreakdown } from "@/components/dashboard/provider-breakdown"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock Data
const MOCK_CHART_DATA = Array.from({ length: 30 }).map((_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  value: Math.floor(Math.random() * 50000) + 10000
}))

const MOCK_PROVIDERS = [
  { id: "openai", name: "OpenAI", tokens: 845000, color: "#10a37f" },
  { id: "anthropic", name: "Anthropic", tokens: 420000, color: "#d97757" },
  { id: "google", name: "Google", tokens: 125000, color: "#4285f4" },
]

const MOCK_MODELS = [
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI", tokens: 620000, cost: 18.60, calls: 452 },
  { id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic", tokens: 310000, cost: 13.95, calls: 128 },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI", tokens: 225000, cost: 0.45, calls: 890 },
  { id: "gemini-pro", name: "Gemini Pro", provider: "Google", tokens: 125000, cost: 0.13, calls: 341 },
]

const MOCK_ACTIVITY: import("@/components/dashboard/recent-activity").Activity[] = [
  { id: "1", type: "chat", description: "Chat about React Performance", timestamp: "5 min ago", tokens: 4250 },
  { id: "2", type: "research", description: "Deep dive: Vector Databases", timestamp: "1 hour ago", tokens: 24500 },
  { id: "3", type: "memory", description: "Summarized project context", timestamp: "3 hours ago", tokens: 1200 },
  { id: "4", type: "export", description: "Exported chat to Markdown", timestamp: "Yesterday", tokens: 0 },
]

export default function DashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 p-6 text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-zinc-400">Overview of your usage and activity.</p>
          </div>
          <Tabs defaultValue="month" className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3 bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Tokens"
            value="1.39M"
            icon={<Activity />}
            trend={{ value: 12.5, label: "vs last month" }}
          />
          <StatsCard
            title="Estimated Cost"
            value="$33.13"
            icon={<Coins />}
            trend={{ value: -5.2, label: "vs last month" }}
          />
          <StatsCard
            title="Active Conversations"
            value="24"
            icon={<MessageSquare />}
          />
          <StatsCard
            title="Research Sessions"
            value="8"
            icon={<Brain />}
            trend={{ value: 100, label: "vs last month" }}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Main Chart */}
          <Card className="col-span-full lg:col-span-2 bg-zinc-950 border-zinc-800">
            <CardHeader>
              <CardTitle>Token Usage</CardTitle>
              <CardDescription>Daily token consumption over the selected period.</CardDescription>
            </CardHeader>
            <CardContent>
              <UsageChart data={MOCK_CHART_DATA} className="mt-4" />
            </CardContent>
          </Card>

          {/* Provider Breakdown */}
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader>
              <CardTitle>Provider Usage</CardTitle>
              <CardDescription>Token distribution by AI provider.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProviderBreakdown providers={MOCK_PROVIDERS} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Models Table */}
          <Card className="col-span-full lg:col-span-2 bg-zinc-950 border-zinc-800">
            <CardHeader>
              <CardTitle>Model Breakdown</CardTitle>
              <CardDescription>Detailed statistics per model.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-zinc-800">
                <Table>
                  <TableHeader className="bg-zinc-900/50">
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400">Model</TableHead>
                      <TableHead className="text-zinc-400">Provider</TableHead>
                      <TableHead className="text-right text-zinc-400">Tokens</TableHead>
                      <TableHead className="text-right text-zinc-400">Calls</TableHead>
                      <TableHead className="text-right text-zinc-400">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_MODELS.map((model) => (
                      <TableRow key={model.id} className="border-zinc-800 hover:bg-zinc-900/50">
                        <TableCell className="font-medium text-zinc-200">{model.name}</TableCell>
                        <TableCell className="text-zinc-400">{model.provider}</TableCell>
                        <TableCell className="text-right text-zinc-300">{model.tokens.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-zinc-300">{model.calls.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-zinc-300">${model.cost.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest operations and requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity activities={MOCK_ACTIVITY} />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
