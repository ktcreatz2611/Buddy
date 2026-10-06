"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"

export interface ModelData {
  id: string
  modelId: string
  name: string
  contextWindow: number
  maxOutput: number
  inputPrice: number
  outputPrice: number
  enabled: boolean
}

interface ModelTableProps {
  models: ModelData[]
  onToggle?: (id: string, enabled: boolean) => void
}

export function ModelTable({ models, onToggle }: ModelTableProps) {
  // Sort by name
  const sortedModels = [...models].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="rounded-md border border-zinc-800">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-900/50">
            <TableHead>Name</TableHead>
            <TableHead>Model ID</TableHead>
            <TableHead className="text-right">Context</TableHead>
            <TableHead className="text-right">Max Output</TableHead>
            <TableHead className="text-right">Input ($/1M)</TableHead>
            <TableHead className="text-right">Output ($/1M)</TableHead>
            <TableHead className="text-center">Enabled</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedModels.map((model) => (
            <TableRow key={model.id}>
              <TableCell className="font-medium text-zinc-100">{model.name}</TableCell>
              <TableCell className="text-zinc-400 font-mono text-xs">{model.modelId}</TableCell>
              <TableCell className="text-right text-zinc-300">{model.contextWindow.toLocaleString()}</TableCell>
              <TableCell className="text-right text-zinc-300">{model.maxOutput.toLocaleString()}</TableCell>
              <TableCell className="text-right text-zinc-300">{model.inputPrice.toFixed(2)}</TableCell>
              <TableCell className="text-right text-zinc-300">{model.outputPrice.toFixed(2)}</TableCell>
              <TableCell className="text-center">
                <Switch 
                  checked={model.enabled} 
                  onCheckedChange={(checked) => onToggle?.(model.id, checked)}
                />
              </TableCell>
            </TableRow>
          ))}
          {sortedModels.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-zinc-500">
                No models found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
