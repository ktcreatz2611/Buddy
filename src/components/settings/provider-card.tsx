"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface ProviderData {
  id: string
  name: string
  type: string
  enabled: boolean
  configured: boolean
  modelCount: number
  health: "healthy" | "degraded" | "unhealthy" | "unknown"
}

interface ProviderCardProps {
  provider: ProviderData
  onClick?: (id: string) => void
}

export function ProviderCard({ provider, onClick }: ProviderCardProps) {
  const getHealthColor = (health: ProviderData["health"]) => {
    switch (health) {
      case "healthy": return "bg-green-500"
      case "degraded": return "bg-yellow-500"
      case "unhealthy": return "bg-red-500"
      default: return "bg-zinc-500"
    }
  }

  return (
    <Card 
      className="cursor-pointer bg-zinc-900 border-zinc-800 transition-colors hover:bg-zinc-800 hover:border-zinc-700"
      onClick={() => onClick?.(provider.id)}
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-lg font-bold text-white uppercase">
          {provider.name.charAt(0)}
        </div>
        <div className="flex-1 space-y-1">
          <CardTitle className="text-zinc-100">{provider.name}</CardTitle>
          <CardDescription className="text-zinc-400 capitalize">{provider.type}</CardDescription>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {!provider.configured ? (
            <Badge variant="outline" className="whitespace-nowrap border-yellow-500/50 text-yellow-400 bg-yellow-500/10">Setup Required</Badge>
          ) : provider.enabled ? (
            <Badge variant="outline" className="whitespace-nowrap border-green-500/50 text-green-400 bg-green-500/10">Enabled</Badge>
          ) : (
            <Badge variant="outline" className="whitespace-nowrap border-zinc-700 text-zinc-400">Disabled</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm mt-4">
          <div className="flex items-center text-zinc-300">
            <span className="font-medium mr-1">{provider.modelCount}</span> models
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <div className={cn("h-2 w-2 rounded-full", getHealthColor(provider.health))} />
            <span className="capitalize">{provider.health}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
