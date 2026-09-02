"use client"

import * as React from "react"
import { Download, FileJson, FileText, FileCode, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface ExportMenuProps {
  conversationId: string
  type?: "conversation" | "research"
}

export function ExportMenu({ conversationId, type = "conversation" }: ExportMenuProps) {
  const [exporting, setExporting] = React.useState<string | null>(null)

  const handleExport = async (format: "markdown" | "json" | "html") => {
    try {
      setExporting(format)
      const endpoint = type === "conversation" 
        ? "/api/export/conversation" 
        : "/api/export/research"
        
      const payload = type === "conversation"
        ? { conversationId, format }
        : { sessionId: conversationId, format }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Export failed")

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const ext = format === 'markdown' ? 'md' : format
      a.download = `${type}-${conversationId}.${ext}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error(error)
      alert("Failed to export")
    } finally {
      setExporting(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
          <Download className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-100">
        <DropdownMenuItem 
          onClick={() => handleExport("markdown")}
          disabled={!!exporting}
          className="focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer"
        >
          {exporting === "markdown" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
          Export as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport("json")}
          disabled={!!exporting}
          className="focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer"
        >
          {exporting === "json" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileJson className="w-4 h-4 mr-2" />}
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport("html")}
          disabled={!!exporting}
          className="focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer"
        >
          {exporting === "html" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileCode className="w-4 h-4 mr-2" />}
          Export as HTML
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
