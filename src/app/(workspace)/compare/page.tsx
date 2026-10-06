"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ModelSelector } from "@/components/comparison/model-selector"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { GitCompareArrows, Send } from "lucide-react"

interface SelectedModel {
  providerId: string
  providerType: string
  modelId: string
  modelKey: string
  modelName: string
  credentialId: string
}

export default function ComparePage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [selectedModels, setSelectedModels] = useState<SelectedModel[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = prompt.trim().length > 0 && selectedModels.length >= 2

  const handleCompare = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          models: selectedModels.map(m => ({
            providerId: m.providerId,
            modelId: m.modelId,
            modelKey: m.modelKey,
          })),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const comparisonId = data.data?.id || data.id
        router.push(`/compare/${comparisonId}`)
      }
    } catch (err) {
      console.error('Failed to create comparison:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <GitCompareArrows className="h-8 w-8 text-zinc-400" />
          <div>
            <h1 className="text-2xl font-bold">Compare Models</h1>
            <p className="text-zinc-400 text-sm">Send one prompt to multiple models and compare their responses side-by-side</p>
          </div>
        </div>

        {/* Prompt input */}
        <div className="mb-8 relative">
          <label className="block text-sm font-medium text-zinc-300 mb-2">Your prompt</label>
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  handleCompare()
                }
              }}
              placeholder="Enter your prompt here... (Ctrl+Enter to compare)"
              className="min-h-[160px] bg-zinc-900 border-zinc-700 text-zinc-100 resize-none focus:border-zinc-500 pb-16"
            />
            <div className="absolute bottom-3 right-3">
              <Button
                onClick={handleCompare}
                disabled={!canSubmit || isSubmitting}
                className="px-6 shadow-sm"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Comparing...' : `Compare ${selectedModels.length} Models`}
              </Button>
            </div>
          </div>
        </div>

        {/* Model selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-zinc-300 mb-3">Select models</label>
          <ModelSelector
            selectedModels={selectedModels}
            onSelectionChange={setSelectedModels}
            maxSelections={4}
          />
        </div>
      </div>
    </div>
  )
}
