"use client"

import * as React from "react"
import { Play, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface ToolTesterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tool: {
    id: string
    name: string
    description: string
    schema: Record<string, string>
  }
}

export function ToolTester({ open, onOpenChange, tool }: ToolTesterProps) {
  const [input, setInput] = React.useState(JSON.stringify({ ...tool.schema }, null, 2))
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<{success: boolean, data: any, time: number} | null>(null)

  const handleExecute = async () => {
    try {
      setLoading(true)
      const startTime = Date.now()
      await new Promise(r => setTimeout(r, 1000))
      const time = Date.now() - startTime
      
      const parsed = JSON.parse(input)
      setResult({
        success: true,
        data: { message: "Executed successfully", received: parsed },
        time
      })
    } catch (err: any) {
      setResult({
        success: false,
        data: err.message || "Execution failed",
        time: 0
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Test: {tool.name}</DialogTitle>
          <DialogDescription className="text-zinc-400">
            {tool.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Input JSON</Label>
            <Textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="font-mono text-sm h-32 bg-zinc-900 border-zinc-700 focus-visible:ring-zinc-600"
              placeholder="{}"
            />
          </div>

          <Button 
            onClick={handleExecute} 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {loading ? "Executing..." : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Execute Tool
              </>
            )}
          </Button>

          {result && (
            <div className={cn(
              "p-4 rounded-md border",
              result.success ? "bg-green-950/20 border-green-900/50" : "bg-red-950/20 border-red-900/50"
            )}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={cn(
                    "text-sm font-medium",
                    result.success ? "text-green-500" : "text-red-500"
                  )}>
                    {result.success ? "Success" : "Error"}
                  </span>
                </div>
                {result.time > 0 && (
                  <div className="flex items-center text-xs text-zinc-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {result.time}ms
                  </div>
                )}
              </div>
              <ScrollArea className="h-32">
                <pre className="text-xs font-mono text-zinc-300">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
