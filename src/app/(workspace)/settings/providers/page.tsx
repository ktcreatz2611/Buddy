"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { ProviderCard, ProviderData } from "@/components/settings/provider-card"
import { Button } from "@/components/ui/button"
import { AddProviderDialog } from "@/components/settings/add-provider-dialog"

// Fetch real data in this component later, but for now we'll maintain state
export default function ProvidersPage() {
  const router = useRouter()
  // Eventually fetch providers from the API
  const [providers, setProviders] = React.useState<ProviderData[]>([])
  
  React.useEffect(() => {
    fetch("/api/providers")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            type: p.type,
            enabled: p.isEnabled ?? true,
            configured: p.configured ?? false,
            modelCount: p.modelsCount ?? 0,
            health: "unknown" as const
          }))
          setProviders(mapped)
        }
      })
      .catch(console.error)
  }, [])

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
        <AddProviderDialog>
          <Button className="gap-2 bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
            <Plus className="h-4 w-4" />
            Add Provider
          </Button>
        </AddProviderDialog>
      </div>

      {providers.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg">
          <p className="text-zinc-400">No providers configured yet.</p>
          <AddProviderDialog>
            <Button variant="outline" className="mt-4 gap-2 border-zinc-800 text-zinc-300">
              <Plus className="h-4 w-4" />
              Add your first provider
            </Button>
          </AddProviderDialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider) => (
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
