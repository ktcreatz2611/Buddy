"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AddProviderDialog({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState("openai")
  const [name, setName] = useState("OpenAI")
  const [baseUrl, setBaseUrl] = useState("")
  const [error, setError] = useState("")

  const handleTypeChange = (value: string) => {
    setType(value)
    if (value === "openai") setName("OpenAI")
    else if (value === "anthropic") setName("Anthropic")
    else if (value === "google") setName("Google")
    else if (value === "groq") setName("Groq")
    else if (value === "deepseek") setName("DeepSeek")
    else if (value === "openrouter") setName("OpenRouter")
    else if (value === "cerebras") setName("Cerebras")
    else setName("")
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type,
          name,
          baseUrl: baseUrl.trim() || undefined
        })
      })

      if (!res.ok) {
        throw new Error("Failed to add provider")
      }

      const data = await res.json()
      setOpen(false)
      router.push(`/settings/providers/${data.id}`)
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add AI Provider</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Select a provider type and configure the base settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Provider Type</Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800">
                <SelectValue placeholder="Select provider type" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="groq">Groq</SelectItem>
                <SelectItem value="deepseek">DeepSeek</SelectItem>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
                <SelectItem value="cerebras">Cerebras</SelectItem>
                <SelectItem value="custom">Custom (OpenAI-Compatible)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-900 border-zinc-800"
              placeholder="e.g. My Provider"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL (Optional)</Label>
            <Input
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="bg-zinc-900 border-zinc-800"
              placeholder="https://api.custom.com/v1"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-800 text-zinc-300">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {loading ? "Saving..." : "Add Provider"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
