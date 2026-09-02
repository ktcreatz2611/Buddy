"use client"

import * as React from "react"
import Link from "next/link"
import { use } from "react"
import { ArrowLeft, FileText, FlaskConical, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { TurnCard } from "@/components/research/turn-card"
import { ClaimCard } from "@/components/research/claim-card"
import { QuestionList } from "@/components/research/question-list"
import { useResearchStream } from "@/hooks/use-research-stream"

interface PageProps {
  params: Promise<{ sessionId: string }>
}

export default function ResearchSessionPage({ params }: PageProps) {
  const { sessionId } = use(params)
  const { turns, claims, questions, status, isConnected } = useResearchStream(sessionId)
  const [activeTab, setActiveTab] = React.useState("transcript")
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of transcript
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [turns])

  const isComplete = status === "complete"
  const isRunning = status === "planning" || status === "investigating" || status === "analyzing" || status === "synthesizing"

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Top Bar */}
      <header className="flex items-center justify-between h-14 px-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-zinc-400 hover:text-zinc-100">
            <Link href="/research">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="h-4 w-[1px] bg-zinc-800 mx-1" />
          <h1 className="font-medium text-sm text-zinc-100 truncate max-w-[200px] md:max-w-md">
            Research Session
          </h1>
          <Badge variant="outline" className={
            status === "complete" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" :
            isRunning ? "border-blue-500/30 text-blue-400 bg-blue-500/10" :
            "border-zinc-700 text-zinc-400"
          }>
            {isRunning && <span className="mr-1.5 flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>}
            {status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <Button variant="outline" size="sm" className="h-8 border-red-900/50 text-red-400 hover:bg-red-950 hover:text-red-300">
              Cancel
            </Button>
          )}
          {isComplete && (
            <Button size="sm" asChild className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
              <Link href={`/research/${sessionId}/report`}>
                <FileText className="h-4 w-4" />
                View Report
              </Link>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Mobile Tabs */}
        <div className="md:hidden border-b border-zinc-800 shrink-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full h-12 bg-transparent rounded-none p-0 border-none justify-start">
              <TabsTrigger value="transcript" className="flex-1 rounded-none data-[state=active]:bg-zinc-900 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 h-full">
                Live Transcript
              </TabsTrigger>
              <TabsTrigger value="state" className="flex-1 rounded-none data-[state=active]:bg-zinc-900 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 h-full">
                Research State
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Left Column: Transcript */}
        <div className={`flex-1 flex-col overflow-hidden md:flex border-r border-zinc-800 ${activeTab === 'transcript' ? 'flex' : 'hidden md:flex'}`}>
          <div className="bg-zinc-900/30 border-b border-zinc-800 px-4 py-2 flex items-center justify-between text-xs text-zinc-500 shrink-0">
            <span className="font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <FlaskConical className="h-3 w-3" /> Live Transcript
            </span>
            <span>{turns.length} turns</span>
          </div>
          
          <ScrollArea ref={scrollRef} className="flex-1 bg-zinc-950/50 p-4">
            <div className="space-y-4 max-w-3xl mx-auto pb-8">
              {turns.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 flex flex-col items-center">
                  <AlertCircle className="h-8 w-8 mb-3 opacity-20" />
                  <p>Initializing research agents...</p>
                </div>
              ) : (
                turns.map((turn, i) => (
                  <TurnCard key={turn.id || i} turn={turn} />
                ))
              )}
              {isRunning && (
                <div className="flex items-center gap-3 text-zinc-500 text-sm py-4 animate-pulse">
                  <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  Agents are thinking...
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Column: State Panel */}
        <div className={`w-full md:w-[400px] lg:w-[480px] flex-col overflow-hidden bg-zinc-950 ${activeTab === 'state' ? 'flex' : 'hidden md:flex'}`}>
          <div className="bg-zinc-900/30 border-b border-zinc-800 px-4 py-2 shrink-0">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Research State</span>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-8 pb-8">
              {/* Questions Section */}
              <section>
                <h3 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                  <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs text-zinc-400">{questions.length}</span>
                  Questions
                </h3>
                <QuestionList questions={questions} />
              </section>

              {/* Claims Section */}
              <section>
                <h3 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                  <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs text-zinc-400">{claims.length}</span>
                  Key Claims
                </h3>
                {claims.length === 0 ? (
                  <p className="text-sm text-zinc-500 italic">No claims established yet.</p>
                ) : (
                  <div className="space-y-3">
                    {claims.map((claim, i) => (
                      <ClaimCard key={claim.id || i} claim={claim} />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="h-12 border-t border-zinc-800 bg-zinc-900/50 px-4 flex items-center justify-between shrink-0 text-xs">
        <div className="flex-1 max-w-xs flex items-center gap-3">
          <span className="text-zinc-500 whitespace-nowrap">Turns (12/20)</span>
          <Progress value={(12/20) * 100} className="h-1.5 bg-zinc-800" indicatorClassName="bg-indigo-500" />
        </div>
        <div className="flex-1 max-w-xs flex items-center gap-3 justify-end">
          <span className="text-zinc-500 whitespace-nowrap">Tokens (45k/100k)</span>
          <Progress value={(45000/100000) * 100} className="h-1.5 bg-zinc-800" indicatorClassName="bg-emerald-500" />
        </div>
      </div>
    </div>
  )
}
