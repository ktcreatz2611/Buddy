"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { ProviderCard, ProviderData } from "@/components/settings/provider-card"
import { Button } from "@/components/ui/button"

// Clear mock data to avoid confusing the user
const MOCK_PROVIDERS: ProviderData[] = []

export default function ProvidersPage() {
  const router = useRouter()

  const handleProviderClick = (id: string) => {
    router.push(`/settings/providers/${id}`)
  }

  return (
    <div className="space-y-6">
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

      {MOCK_PROVIDERS.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg">
          <p className="text-zinc-400">No providers configured yet.</p>
          <Button variant="outline" className="mt-4 gap-2 border-zinc-800 text-zinc-300">
            <Plus className="h-4 w-4" />
            Add your first provider
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_PROVIDERS.map((provider) => (
            <ProviderCard 
              key={provider.id} 
              provider={provider} 
              onClick={handleProviderClick} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
