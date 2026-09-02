import * as React from "react"
import { CheckCircle2, ThumbsUp, HelpCircle, AlertTriangle, ExternalLink, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type ClaimStatus = "verified" | "probable" | "uncertain" | "conflicting"

interface Evidence {
  text: string
  source: string
  url: string
  type: "supporting" | "refuting"
}

interface Claim {
  id: string
  text: string
  status: ClaimStatus
  confidence: number
  evidence: Evidence[]
}

interface ClaimCardProps {
  claim: Claim
}

export function ClaimCard({ claim }: ClaimCardProps) {
  const [expanded, setExpanded] = React.useState(false)

  const getStatusIcon = (status: ClaimStatus) => {
    switch (status) {
      case "verified": return <CheckCircle2 className="h-4 w-4" />
      case "probable": return <ThumbsUp className="h-4 w-4" />
      case "uncertain": return <HelpCircle className="h-4 w-4" />
      case "conflicting": return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: ClaimStatus) => {
    switch (status) {
      case "verified": return "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
      case "probable": return "text-blue-400 border-blue-500/20 bg-blue-500/10"
      case "uncertain": return "text-amber-400 border-amber-500/20 bg-amber-500/10"
      case "conflicting": return "text-red-400 border-red-500/20 bg-red-500/10"
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div 
        className="p-3 flex items-start gap-3 cursor-pointer hover:bg-zinc-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={cn("mt-0.5 p-1 rounded-md shrink-0 border", getStatusColor(claim.status))}>
          {getStatusIcon(claim.status)}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-200 font-medium leading-tight mb-2">
            {claim.text}
          </p>
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden max-w-[100px]">
              <div 
                className={cn("h-full rounded-full", getStatusColor(claim.status).split(' ')[0].replace('text', 'bg'))} 
                style={{ width: `${claim.confidence}%` }}
              />
            </div>
            <span className="text-xs text-zinc-500">{claim.confidence}%</span>
            <span className="text-xs text-zinc-500 ml-auto flex items-center gap-1">
              {claim.evidence.length} sources <ChevronRight className={cn("h-3 w-3 transition-transform", expanded && "rotate-90")} />
            </span>
          </div>
        </div>
      </div>

      {expanded && claim.evidence.length > 0 && (
        <div className="p-3 pt-0 border-t border-zinc-800/50 bg-zinc-900/50 space-y-2 mt-2">
          {claim.evidence.map((ev, i) => (
            <div key={i} className={cn(
              "text-xs p-2 rounded border-l-2",
              ev.type === "supporting" ? "border-l-emerald-500 bg-emerald-500/5" : "border-l-red-500 bg-red-500/5"
            )}>
              <p className="text-zinc-300 mb-1 italic">"{ev.text}"</p>
              <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1 w-fit">
                {ev.source} <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
