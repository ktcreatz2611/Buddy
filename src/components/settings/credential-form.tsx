"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CredentialForm({ onSave }: { onSave?: (label: string, key: string) => void }) {
  const [label, setLabel] = React.useState("")
  const [key, setKey] = React.useState("")
  const [showKey, setShowKey] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSave = () => {
    if (!key.trim()) {
      setError("API Key is required")
      return
    }
    setError("")
    onSave?.(label, key)
    setLabel("")
    setKey("")
  }

  return (
    <div className="space-y-4 rounded-md border border-zinc-800 p-4 bg-zinc-900/50">
      <div className="space-y-2">
        <Label htmlFor="cred-label">Label (Optional)</Label>
        <Input 
          id="cred-label" 
          value={label} 
          onChange={(e) => setLabel(e.target.value)} 
          placeholder="e.g. Production Key"
          className="bg-zinc-950 border-zinc-800"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cred-key">API Key</Label>
        <div className="relative">
          <Input 
            id="cred-key" 
            type={showKey ? "text" : "password"} 
            value={key} 
            onChange={(e) => setKey(e.target.value)} 
            placeholder="sk-..."
            className="bg-zinc-950 border-zinc-800 pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
      <Button onClick={handleSave} className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
        Save Credential
      </Button>
    </div>
  )
}
