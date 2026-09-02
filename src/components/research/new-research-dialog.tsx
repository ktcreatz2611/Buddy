"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus, Settings2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function NewResearchDialog() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [advancedOpen, setAdvancedOpen] = React.useState(false)

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Mock API call
    setTimeout(() => {
      setLoading(false)
      setOpen(false)
      router.push(`/research/new-session-${Date.now()}`)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          New Research
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <form onSubmit={handleStart}>
          <DialogHeader>
            <DialogTitle>Start Research Session</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Provide a complex question or topic. Buddy will spawn specialized agents to investigate, analyze, and synthesize a report.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="question">Research Question / Topic</Label>
              <Textarea 
                id="question" 
                placeholder="e.g. What are the economic implications of transitioning to solid-state batteries in the EV market?" 
                className="min-h-[100px] bg-zinc-900 border-zinc-800 resize-none focus-visible:ring-indigo-500"
                required
              />
            </div>

            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen} className="border border-zinc-800 rounded-lg bg-zinc-900/50">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between h-10 px-4 text-sm font-medium hover:bg-zinc-900 hover:text-zinc-200">
                  <span className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4" /> Advanced Configuration
                  </span>
                  <span className="text-xs text-zinc-500">{advancedOpen ? 'Hide' : 'Show'}</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-turns" className="text-xs text-zinc-400">Max Turns</Label>
                    <Input id="max-turns" type="number" defaultValue={20} min={5} max={50} className="bg-zinc-950 border-zinc-800 h-8" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time-limit" className="text-xs text-zinc-400">Time Limit (mins)</Label>
                    <Input id="time-limit" type="number" defaultValue={10} min={1} max={60} className="bg-zinc-950 border-zinc-800 h-8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-tokens" className="text-xs text-zinc-400">Max Tokens (Budget)</Label>
                  <Input id="max-tokens" type="number" defaultValue={100000} className="bg-zinc-950 border-zinc-800 h-8" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="deep-search" className="text-sm font-normal text-zinc-300">Deep Search Mode</Label>
                  <Switch id="deep-search" defaultChecked />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start Research"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
