"use client"

import { MessageContent } from "@/components/chat/message-content"
import { MetricsBar } from "./metrics-bar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useComparisonStream } from "@/hooks/use-comparison-stream"
import { Square, RotateCcw, Copy, MessageSquare, Check, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const PROVIDER_COLORS: Record<string, string> = {
  openai: 'border-t-blue-500',
  anthropic: 'border-t-orange-500',
  google: 'border-t-green-500',
  groq: 'border-t-purple-500',
  deepseek: 'border-t-cyan-500',
  openrouter: 'border-t-pink-500',
}

interface ResponseColumnProps {
  comparisonId: string
  responseId: string
  providerId: string
  modelName: string
  modelKey: string
  onStop?: () => void
  onRetry?: () => void
  onCritique?: () => void
}

export function ResponseColumn({
  comparisonId,
  responseId,
  providerId,
  modelName,
  modelKey,
  onStop,
  onRetry,
  onCritique,
}: ResponseColumnProps) {
  const { content, status, error, metrics } = useComparisonStream(comparisonId, responseId)
  const [copied, setCopied] = useState(false)

  const borderColor = PROVIDER_COLORS[providerId] || 'border-t-zinc-500'
  const isStreaming = status === 'streaming'
  const isComplete = status === 'complete'
  const isError = status === 'error'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStop = async () => {
    await fetch(`/api/comparisons/${comparisonId}/responses/${responseId}/stop`, { method: 'POST' })
    onStop?.()
  }

  const handleRetry = async () => {
    await fetch(`/api/comparisons/${comparisonId}/responses/${responseId}/retry`, { method: 'POST' })
    onRetry?.()
  }

  return (
    <div className={cn(
      "flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden border-t-2 min-h-[300px]",
      borderColor,
      isStreaming && "ring-1 ring-zinc-700/50 animate-pulse-border"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-zinc-100">{modelName}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{providerId}</Badge>
        </div>
        <div className="flex items-center gap-1">
          {isStreaming && (
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Streaming</span>
            </div>
          )}
          {isComplete && (
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <Check className="h-3 w-3" />
              <span>Done</span>
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span>Error</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
        {isError && error ? (
          <div className="rounded-lg bg-red-950/30 border border-red-900/50 p-3 text-sm text-red-300">
            <p className="font-medium mb-1">Generation failed</p>
            <p className="text-red-400">{error}</p>
          </div>
        ) : content ? (
          <MessageContent content={content} />
        ) : (
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Waiting for response...</span>
          </div>
        )}
      </div>

      {/* Metrics */}
      <MetricsBar
        latencyMs={metrics.latencyMs}
        inputTokens={metrics.inputTokens}
        outputTokens={metrics.outputTokens}
        totalTokens={metrics.totalTokens}
        estimatedCost={metrics.estimatedCost}
        tokensPerSec={metrics.tokensPerSec}
        status={status}
      />

      {/* Actions */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-t border-zinc-800">
        {isStreaming && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleStop}>
            <Square className="h-3 w-3 mr-1" /> Stop
          </Button>
        )}
        {(isError || isComplete) && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleRetry}>
            <RotateCcw className="h-3 w-3 mr-1" /> Retry
          </Button>
        )}
        {content && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleCopy}>
            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        )}
        {isComplete && onCritique && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onCritique}>
            <MessageSquare className="h-3 w-3 mr-1" /> Critique
          </Button>
        )}
      </div>
    </div>
  )
}
