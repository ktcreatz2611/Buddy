"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface ComparisonMetrics {
  latencyMs: number | null
  inputTokens: number | null
  outputTokens: number | null
  totalTokens: number | null
  estimatedCost: number | null
  tokensPerSec: number | null
}

interface ComparisonStreamState {
  content: string
  status: 'idle' | 'streaming' | 'complete' | 'error' | 'stopped'
  error: string | null
  metrics: ComparisonMetrics
}

export function useComparisonStream(comparisonId: string | null, responseId: string | null) {
  const [state, setState] = useState<ComparisonStreamState>({
    content: '',
    status: 'idle',
    error: null,
    metrics: {
      latencyMs: null,
      inputTokens: null,
      outputTokens: null,
      totalTokens: null,
      estimatedCost: null,
      tokensPerSec: null,
    },
  })

  const startTimeRef = useRef<number | null>(null)
  const tokenCountRef = useRef(0)

  useEffect(() => {
    if (!comparisonId || !responseId) {
      setState(prev => ({ ...prev, status: 'idle', content: '', error: null }))
      return
    }

    setState(prev => ({ ...prev, status: 'streaming', content: '', error: null }))
    startTimeRef.current = Date.now()
    tokenCountRef.current = 0

    let isMounted = true
    const eventSource = new EventSource(
      `/api/comparisons/${comparisonId}/responses/${responseId}/stream`
    )

    eventSource.onmessage = (event) => {
      if (!isMounted) return
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'replay' || data.type === 'delta') {
          tokenCountRef.current += (data.text?.length ?? 0) / 4 // rough estimate
          const elapsed = (Date.now() - (startTimeRef.current ?? Date.now())) / 1000
          const tokensPerSec = elapsed > 0 ? tokenCountRef.current / elapsed : 0

          setState(prev => ({
            ...prev,
            content: data.type === 'replay' ? data.text : prev.content + data.text,
            status: 'streaming',
            metrics: {
              ...prev.metrics,
              latencyMs: Date.now() - (startTimeRef.current ?? Date.now()),
              tokensPerSec: Math.round(tokensPerSec),
            },
          }))
        } else if (data.type === 'complete') {
          setState(prev => ({
            ...prev,
            status: 'complete',
            metrics: {
              latencyMs: data.latencyMs ?? prev.metrics.latencyMs,
              inputTokens: data.inputTokens ?? prev.metrics.inputTokens,
              outputTokens: data.outputTokens ?? prev.metrics.outputTokens,
              totalTokens: data.totalTokens ?? prev.metrics.totalTokens,
              estimatedCost: data.estimatedCost ? parseFloat(data.estimatedCost) : prev.metrics.estimatedCost,
              tokensPerSec: prev.metrics.tokensPerSec,
            },
          }))
          eventSource.close()
        } else if (data.type === 'error') {
          setState(prev => ({
            ...prev,
            status: 'error',
            error: data.message || 'Stream error',
          }))
          eventSource.close()
        }
      } catch {
        // ignore parse errors
      }
    }

    eventSource.onerror = () => {
      if (isMounted) {
        setState(prev => {
          if (prev.status === 'complete') return prev
          return { ...prev, status: 'error', error: 'Connection lost' }
        })
      }
      eventSource.close()
    }

    return () => {
      isMounted = false
      eventSource.close()
    }
  }, [comparisonId, responseId])

  return state
}
