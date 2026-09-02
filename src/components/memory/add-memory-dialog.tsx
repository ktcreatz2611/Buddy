"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Loader2 } from "lucide-react"
import { MemoryScope } from "./memory-card"

interface AddMemoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: { key: string; value: string; scope: MemoryScope; scope_id: string | null }) => Promise<void>
  defaultScope?: MemoryScope
}

export function AddMemoryDialog({ open, onOpenChange, onAdd, defaultScope = "global" }: AddMemoryDialogProps) {
  const [key, setKey] = React.useState("")
  const [value, setValue] = React.useState("")
  const [scope, setScope] = React.useState<MemoryScope>(defaultScope)
  const [scopeId, setScopeId] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Reset form when opened
  React.useEffect(() => {
    if (open) {
      setKey("")
      setValue("")
      setScope(defaultScope)
      setScopeId("")
    }
  }, [open, defaultScope])

  const looksLikeSecret = /key|secret|token|password|auth|credential/i.test(key) || /ey[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/.test(value)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!key.trim() || !value.trim()) return

    try {
      setIsSubmitting(true)
      await onAdd({
        key: key.trim(),
        value: value.trim(),
        scope,
        scope_id: scope === "global" ? null : scopeId.trim() || null
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to add memory", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Add New Memory</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Store key-value information that the AI can recall across conversations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scope">Scope</Label>
              <Select value={scope} onValueChange={(v) => setScope(v as MemoryScope)}>
                <SelectTrigger id="scope" className="bg-zinc-900 border-zinc-800">
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="workspace">Workspace</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="conversation">Conversation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {scope !== "global" && (
              <div className="space-y-2">
                <Label htmlFor="scopeId">Scope ID</Label>
                <Input 
                  id="scopeId" 
                  placeholder={`e.g. ${scope}-123`}
                  value={scopeId}
                  onChange={(e) => setScopeId(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="key">Key</Label>
            <Input 
              id="key" 
              placeholder="e.g. user_preferences.theme"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 font-mono text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <Textarea 
              id="value" 
              placeholder="Content to remember... (Supports JSON)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="min-h-[150px] bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 font-mono text-sm resize-y"
              required
            />
          </div>

          {looksLikeSecret && (
            <div className="flex items-start gap-3 p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Potential Secret Detected</p>
                <p className="text-amber-400/80 mt-1">
                  Memories are stored in plain text and accessible to the AI. Do not store sensitive credentials, API keys, or passwords here. Use the secrets manager instead.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-zinc-100">
              Cancel
            </Button>
            <Button type="submit" disabled={!key.trim() || !value.trim() || isSubmitting} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Memory
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
