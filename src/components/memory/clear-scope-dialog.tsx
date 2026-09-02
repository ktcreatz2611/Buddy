"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Loader2 } from "lucide-react"
import { MemoryScope } from "./memory-card"

interface ClearScopeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scope: MemoryScope
  count: number
  onConfirm: () => Promise<void>
}

export function ClearScopeDialog({ open, onOpenChange, scope, count, onConfirm }: ClearScopeDialogProps) {
  const [confirmText, setConfirmText] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setConfirmText("")
    }
  }, [open])

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (confirmText !== "DELETE") return

    try {
      setIsSubmitting(true)
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isConfirmed = confirmText === "DELETE"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-red-900/50 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-red-500 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Clear Memory Scope
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            This action cannot be undone. This will permanently delete memories.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="text-sm text-red-200">
              You are about to delete <strong>{count}</strong> memories from the <strong>{scope}</strong> scope.
            </p>
          </div>

          <form onSubmit={handleConfirm} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirm">
                Please type <strong>DELETE</strong> to confirm.
              </Label>
              <Input
                id="confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-100"
                autoComplete="off"
              />
            </div>
            
            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onOpenChange(false)} 
                className="text-zinc-400 hover:text-zinc-100"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!isConfirmed || isSubmitting} 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Memories
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
