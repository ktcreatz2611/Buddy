"use client"

import { Clock, Hash, DollarSign, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricsBarProps {
  latencyMs: number | null
  inputTokens: number | null
  outputTokens: number | null
  totalTokens: number | null
  estimatedCost: number | null
  tokensPerSec: number | null
  status: string
}

export function MetricsBar({
  latencyMs,
  inputTokens,
  outputTokens,
  totalTokens,
  estimatedCost,
  tokensPerSec,
  status,
}: MetricsBarProps) {
  const isStreaming = status === 'streaming'

  const formatLatency = (ms: number | null) => {
    if (ms === null) return '—'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatTokens = (n: number | null) => {
    if (n === null) return '—'
    return n.toLocaleString()
  }

  const formatCost = (c: number | null) => {
    if (c === null) return '—'
    if (c < 0.01) return `$${c.toFixed(4)}`
    return `$${c.toFixed(2)}`
  }

  return (
    <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono px-3 py-2 border-t border-zinc-800">
      <div className="flex items-center gap-1" title="Latency">
        <Clock className="h-3 w-3" />
        <span className={cn(isStreaming && "animate-pulse")}>{formatLatency(latencyMs)}</span>
      </div>
      <div className="flex items-center gap-1" title={`Input: ${formatTokens(inputTokens)} / Output: ${formatTokens(outputTokens)}`}>
        <Hash className="h-3 w-3" />
        <span className={cn(isStreaming && "animate-pulse")}>{formatTokens(totalTokens)} tok</span>
      </div>
      <div className="flex items-center gap-1" title="Estimated cost">
        <DollarSign className="h-3 w-3" />
        <span>{formatCost(estimatedCost)}</span>
      </div>
      {tokensPerSec !== null && tokensPerSec > 0 && (
        <div className="flex items-center gap-1" title="Speed">
          <Zap className="h-3 w-3" />
          <span className={cn(isStreaming && "animate-pulse")}>{tokensPerSec} tok/s</span>
        </div>
      )}
    </div>
  )
}
