import * as React from "react"
import { Search, Microscope, Workflow, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Turn {
  id: string
  role: "investigator" | "analyst" | "orchestrator"
  content: string
  tokens: number
  timestamp: string
}

interface TurnCardProps {
  turn: Turn
}

export function TurnCard({ turn }: TurnCardProps) {
  const [expanded, setExpanded] = React.useState(false)

  const isInvestigator = turn.role === "investigator"
  const isAnalyst = turn.role === "analyst"
  const isOrchestrator = turn.role === "orchestrator"

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-lg overflow-hidden group">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/60 border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          {isInvestigator && <Search className="h-4 w-4 text-blue-400" />}
          {isAnalyst && <Microscope className="h-4 w-4 text-emerald-400" />}
          {isOrchestrator && <Workflow className="h-4 w-4 text-purple-400" />}
          <span className={cn(
            "text-xs font-medium uppercase tracking-wider",
            isInvestigator && "text-blue-400",
            isAnalyst && "text-emerald-400",
            isOrchestrator && "text-purple-400",
          )}>
            {turn.role}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span>{turn.tokens} tokens</span>
          <span>{turn.timestamp}</span>
        </div>
      </div>
      
      <div className="p-4 text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
        {turn.content}
      </div>

      {/* Raw Data Toggle */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/30 transition-colors border-t border-zinc-800/50"
      >
        Raw JSON <ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="p-4 bg-zinc-950 border-t border-zinc-800/50 font-mono text-xs text-zinc-500 overflow-x-auto">
          {JSON.stringify({ ...turn, _debug: { model: "gpt-4o", latencyMs: 2450 } }, null, 2)}
        </div>
      )}
    </div>
  )
}
