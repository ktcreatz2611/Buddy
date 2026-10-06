"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CredentialForm } from "@/components/settings/credential-form"
import { ModelTable, ModelData } from "@/components/settings/model-table"
import { ProviderData } from "@/components/settings/provider-card"


export default function ProviderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const providerId = params.id as string

  const [provider, setProvider] = React.useState<ProviderData | null>(null)
  const [models, setModels] = React.useState<ModelData[]>([])
  const [workspaceId, setWorkspaceId] = React.useState<string | null>(null)
  const [hasCredential, setHasCredential] = React.useState<boolean>(false)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        // Fetch workspace first
        const wsRes = await fetch('/api/workspaces')
        if (wsRes.ok) {
          const wsData = await wsRes.json()
          const wsId = wsData.data?.[0]?.id || wsData[0]?.id
          if (wsId) {
            setWorkspaceId(wsId)
          }
        }

        // Fetch provider and models
        const provRes = await fetch(`/api/providers/${providerId}`)
        if (provRes.ok) {
          const data = await provRes.json()
          setProvider({
            id: data.id,
            name: data.name,
            type: data.type,
            enabled: data.isEnabled ?? true,
            configured: false, // We'll update this next
            modelCount: data.models?.length ?? 0,
            health: "unknown" as const
          })
          
          if (data.models) {
            setModels(data.models.map((m: Record<string, unknown>) => ({
              id: String(m.id),
              modelId: String(m.modelId || m.id),
              name: String(m.name),
              contextWindow: Number(m.maxContextTokens || 0),
              maxOutput: Number(m.maxOutputTokens || 0),
              inputPrice: Number(m.inputPricePerMToken || 0),
              outputPrice: Number(m.outputPricePerMToken || 0),
              enabled: Boolean(m.isEnabled)
            })))
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [providerId])

  // Check credentials if we have a workspace
  React.useEffect(() => {
    if (!workspaceId) return
    async function checkCreds() {
      try {
        const credRes = await fetch(`/api/providers/${providerId}/credentials?workspaceId=${workspaceId}`)
        if (credRes.ok) {
          const data = await credRes.json()
          setHasCredential(Array.isArray(data) && data.length > 0)
        }
      } catch (err) {
        console.error(err)
      }
    }
    checkCreds()
  }, [providerId, workspaceId])

  const handleSaveCredential = async (label: string, key: string) => {
    if (!workspaceId) return
    
    try {
      const res = await fetch(`/api/providers/${providerId}/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          apiKey: key,
          label
        })
      })
      
      if (res.ok) {
        setHasCredential(true)
      } else {
        const data = await res.json()
        alert(data.error || "Failed to save API key")
      }
    } catch (err) {
      console.error(err)
      alert("Failed to save API key")
    }
  }

  const handleToggleModel = async (id: string, enabled: boolean) => {
    // Optimistically update
    setModels(models.map(m => m.id === id ? { ...m, enabled } : m))
    
    // In a real app we'd POST to an endpoint to update the model status
    // fetch(`/api/providers/${providerId}/models/${id}`, { method: 'PATCH', body: JSON.stringify({ isEnabled: enabled }) })
  }

  if (isLoading) {
    return <div className="text-zinc-400 p-8">Loading provider details...</div>
  }

  if (!provider) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" className="gap-2 -ml-4 text-zinc-400 hover:text-zinc-100" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back to Providers
        </Button>
        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg text-zinc-400">
          Provider not found.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">{provider.name}</h1>
          <p className="text-zinc-400 capitalize">{provider.type} Provider</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium text-zinc-100">API Credentials</h2>
        
        {hasCredential ? (
          <div className="flex gap-3 rounded-lg border p-4 bg-green-500/10 text-green-400 border-green-500/50">
            <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h5 className="font-medium leading-none tracking-tight">Configured</h5>
              <div className="text-sm opacity-90">
                API keys are configured for this provider. You can securely add additional keys below if needed.
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 rounded-lg border p-4 bg-yellow-500/10 text-yellow-400 border-yellow-500/50">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h5 className="font-medium leading-none tracking-tight">Setup Required</h5>
              <div className="text-sm opacity-90">
                You need to add an API key before you can use models from this provider.
              </div>
            </div>
          </div>
        )}

        <CredentialForm onSave={handleSaveCredential} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-zinc-100">Available Models</h2>
            <p className="text-sm text-zinc-400 mt-1">Enable or disable specific models for this provider.</p>
          </div>
        </div>
        
        <ModelTable models={models} onToggle={handleToggleModel} />
      </div>
    </div>
  )
}
