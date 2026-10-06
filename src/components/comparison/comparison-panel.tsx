"use client"

import { useState, useEffect, useCallback } from "react"
import { ResponseColumn } from "./response-column"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ComparisonResponse {
  id: string
  providerId: string
  modelKey: string
  modelName: string
  content: string
  status: string
}

interface ComparisonData {
  id: string
  prompt: string
  status: string
  responses: ComparisonResponse[]
}

interface ComparisonPanelProps {
  comparisonId: string
}

export function ComparisonPanel({ comparisonId }: ComparisonPanelProps) {
  const [comparison, setComparison] = useState<ComparisonData | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const fetchComparison = useCallback(async () => {
    const res = await fetch(`/api/comparisons/${comparisonId}`)
    if (res.ok) {
      const data = await res.json()
      setComparison(data.data || data)
    }
  }, [comparisonId])

  useEffect(() => {
    fetchComparison()
  }, [fetchComparison])

  const handleSynthesize = async () => {
    if (!comparison?.responses.length) return
    // Use the first completed response's model for synthesis
    const firstResponse = comparison.responses[0]
    await fetch(`/api/comparisons/${comparisonId}/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelId: firstResponse.modelKey,
        credentialId: '', // will be looked up server-side
      }),
    })
  }

  if (!comparison) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        Loading comparison...
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-3">
          <Link href="/compare">
            <Button variant="ghost" size="sm" className="h-8">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <Badge variant="outline" className="text-xs">
            {comparison.responses.length} models
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={handleSynthesize}
          >
            <Sparkles className="h-4 w-4 mr-1" /> Synthesize All
          </Button>
          <Link href="/compare">
            <Button variant="outline" size="sm" className="h-8">
              <Plus className="h-4 w-4 mr-1" /> New
            </Button>
          </Link>
        </div>
      </div>

      {/* Prompt */}
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/30">
        <p className="text-sm text-zinc-400 mb-1 font-medium">Prompt</p>
        <p className="text-zinc-100">{comparison.prompt}</p>
      </div>

      {/* Mobile tabs */}
      {isMobile && (
        <div className="flex border-b border-zinc-800 overflow-x-auto">
          {comparison.responses.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setActiveTab(i)}
              className={`flex-shrink-0 px-4 py-2 text-sm border-b-2 transition-colors ${
                i === activeTab
                  ? 'border-zinc-100 text-zinc-100'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {r.modelName}
            </button>
          ))}
        </div>
      )}

      {/* Response panels */}
      <div className="flex-1 overflow-hidden p-4">
        {isMobile ? (
          /* Mobile: single panel */
          comparison.responses[activeTab] && (
            <ResponseColumn
              comparisonId={comparisonId}
              responseId={comparison.responses[activeTab].id}
              providerId={comparison.responses[activeTab].providerId}
              modelName={comparison.responses[activeTab].modelName}
              modelKey={comparison.responses[activeTab].modelKey}
              onRetry={fetchComparison}
            />
          )
        ) : (
          /* Desktop: side-by-side columns */
          <div
            className="grid gap-4 h-full"
            style={{ gridTemplateColumns: `repeat(${Math.min(comparison.responses.length, 4)}, 1fr)` }}
          >
            {comparison.responses.map((r) => (
              <ResponseColumn
                key={r.id}
                comparisonId={comparisonId}
                responseId={r.id}
                providerId={r.providerId}
                modelName={r.modelName}
                modelKey={r.modelKey}
                onRetry={fetchComparison}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
