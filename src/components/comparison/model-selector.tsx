"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Model {
  id: string
  modelId: string
  name: string
  maxContextTokens: number | null
  maxOutputTokens: number | null
  inputPricePerMToken: string | null
  outputPricePerMToken: string | null
  providerId: string
}

interface Provider {
  id: string
  name: string
  type: string
  models: Model[]
  hasCredentials: boolean
}

interface ModelSelectorProps {
  selectedModels: Array<{ providerId: string; providerType: string; modelId: string; modelKey: string; modelName: string; credentialId: string }>
  onSelectionChange: (models: ModelSelectorProps['selectedModels']) => void
  maxSelections?: number
}

export function ModelSelector({ selectedModels, onSelectionChange, maxSelections = 4 }: ModelSelectorProps) {
  const [providers, setProviders] = useState<Provider[]>([])

  useEffect(() => {
    async function fetchProviders() {
      const res = await fetch('/api/providers')
      if (res.ok) {
        const data = await res.json()
        setProviders(data.data || data || [])
      }
    }
    fetchProviders()
  }, [])

  const isSelected = (providerId: string, modelId: string) =>
    selectedModels.some(m => m.providerId === providerId && m.modelId === modelId)

  const toggleModel = (provider: Provider, model: Model) => {
    if (!provider.hasCredentials) return

    const existing = selectedModels.find(
      m => m.providerId === provider.id && m.modelId === model.id
    )

    if (existing) {
      onSelectionChange(selectedModels.filter(m => m !== existing))
    } else if (selectedModels.length < maxSelections) {
      onSelectionChange([
        ...selectedModels,
        {
          providerId: provider.id,
          providerType: provider.type,
          modelId: model.id,
          modelKey: model.modelId,
          modelName: model.name,
          credentialId: '', // resolved server-side
        },
      ])
    }
  }

  const formatPrice = (price: string | null) => {
    if (!price) return '—'
    const n = parseFloat(price)
    if (n < 1) return `$${n.toFixed(3)}/MTok`
    return `$${n.toFixed(2)}/MTok`
  }

  const formatContext = (tokens: number | null) => {
    if (!tokens) return '—'
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(0)}M`
    return `${(tokens / 1000).toFixed(0)}K`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          Select {2}–{maxSelections} models to compare
        </p>
        <Badge variant="outline">
          {selectedModels.length}/{maxSelections} selected
        </Badge>
      </div>

      {providers.map(provider => (
        <div key={provider.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-zinc-300">{provider.name}</h3>
            {!provider.hasCredentials && (
              <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-600">
                No API key
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {(provider.models || []).map(model => {
              const selected = isSelected(provider.id, model.id)
              const disabled = !provider.hasCredentials || (!selected && selectedModels.length >= maxSelections)

              return (
                <Card
                  key={model.id}
                  className={cn(
                    "p-3 cursor-pointer transition-all border",
                    selected
                      ? "border-zinc-400 bg-zinc-800/80 ring-1 ring-zinc-600"
                      : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700",
                    disabled && !selected && "opacity-40 cursor-not-allowed"
                  )}
                  onClick={() => !disabled && toggleModel(provider, model)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{model.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{model.modelId}</p>
                    </div>
                    {selected && (
                      <div className="h-5 w-5 rounded-full bg-zinc-100 flex items-center justify-center">
                        <Check className="h-3 w-3 text-zinc-900" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-500">
                    <span>{formatContext(model.maxContextTokens)} ctx</span>
                    <span>In: {formatPrice(model.inputPricePerMToken)}</span>
                    <span>Out: {formatPrice(model.outputPricePerMToken)}</span>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
