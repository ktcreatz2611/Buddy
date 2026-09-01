"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { ProviderCard, ProviderData } from "@/components/settings/provider-card"
import { Button } from "@/components/ui/button"

// Dummy data for initial UI dev
const MOCK_PROVIDERS: ProviderData[] = [
  { id: "openai", name: "OpenAI", type: "openai", enabled: true, modelCount: 12, health: "healthy" },
  { id: "anthropic", name: "Anthropic", type: "anthropic", enabled: true, modelCount: 4, health: "healthy" },
  { id: "local-ollama", name: "Local Ollama", type: "custom", enabled: false, modelCount: 3, health: "unknown" },
]

export default function ProvidersPage() {
  const router = useRouter()

  const handleProviderClick = (id: string) => {
    router.push(`/settings/providers/${id}`)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Provider Management</h1>
          <p className="text-zinc-400 mt-1">Manage AI model providers, credentials, and models.</p>
        </div>
        <Button className="gap-2 bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
          <Plus className="h-4 w-4" />
          Add Provider
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_PROVIDERS.map((provider) => (
          <ProviderCard 
            key={provider.id} 
            provider={provider} 
            onClick={handleProviderClick} 
          />
        ))}
      </div>
    </div>
  )
}
