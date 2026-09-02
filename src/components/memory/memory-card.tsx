"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Edit2, Trash2, Check, X, ChevronDown, ChevronUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export type MemoryScope = "global" | "workspace" | "project" | "conversation"
export type MemorySource = "user" | "agent_extracted"

export interface Memory {
  id: string
  key: string
  value: string
  scope: MemoryScope
  scope_id: string | null
  source: MemorySource
  created_at: string
  updated_at: string
}

interface MemoryCardProps {
  memory: Memory
  onUpdate: (id: string, value: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const scopeColors: Record<MemoryScope, string> = {
  global: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  workspace: "bg-green-500/10 text-green-500 border-green-500/20",
  project: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  conversation: "bg-orange-500/10 text-orange-500 border-orange-500/20",
}

export function MemoryCard({ memory, onUpdate, onDelete }: MemoryCardProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(memory.value)
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isUpdating, setIsUpdating] = React.useState(false)

  const handleSave = async () => {
    try {
      setIsUpdating(true)
      await onUpdate(memory.id, editValue)
      setIsEditing(false)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete memory "${memory.key}"?`)) {
      try {
        setIsDeleting(true)
        await onDelete(memory.id)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const isLongValue = memory.value.length > 150 || memory.value.split('\n').length > 3

  return (
    <Card className="bg-zinc-950 border-zinc-800 text-zinc-100 flex flex-col">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0 gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <CardTitle className="text-sm font-medium truncate" title={memory.key}>
            {memory.key}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={cn("text-xs font-normal", scopeColors[memory.scope])}>
              {memory.scope}
            </Badge>
            <Badge variant="outline" className={cn(
              "text-xs font-normal border-zinc-800",
              memory.source === "agent_extracted" ? "italic text-zinc-500" : "text-zinc-400"
            )}>
              {memory.source === "agent_extracted" ? "Agent" : "User"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!isEditing && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-400/10" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 flex-1 flex flex-col">
        {isEditing ? (
          <div className="space-y-2 flex-1 flex flex-col">
            <Textarea 
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 min-h-[100px] bg-zinc-900 border-zinc-700 text-zinc-100 resize-none font-mono text-xs"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="h-8 text-zinc-400">
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isUpdating || editValue === memory.value} className="h-8 bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                <Check className="h-4 w-4 mr-1" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div 
              className={cn(
                "text-sm text-zinc-300 font-mono whitespace-pre-wrap break-words rounded-md bg-zinc-900/50 p-3",
                !isExpanded && isLongValue && "line-clamp-3"
              )}
            >
              {memory.value}
            </div>
            {isLongValue && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-1 h-6 self-start text-xs text-zinc-500 hover:text-zinc-300 px-0" 
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <><ChevronUp className="h-3 w-3 mr-1" /> Show less</>
                ) : (
                  <><ChevronDown className="h-3 w-3 mr-1" /> Show more</>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 text-[10px] text-zinc-500 flex justify-between mt-auto">
        <span>Updated {formatDistanceToNow(new Date(memory.updated_at), { addSuffix: true })}</span>
      </CardFooter>
    </Card>
  )
}
