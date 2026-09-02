import * as React from "react"
import { cn } from "@/lib/utils"

interface ProviderUsage {
  id: string
  name: string
  tokens: number
  color: string
}

interface ProviderBreakdownProps {
  providers: ProviderUsage[]
  className?: string
}

export function ProviderBreakdown({ providers, className }: ProviderBreakdownProps) {
  const totalTokens = providers.reduce((sum, p) => sum + p.tokens, 0) || 1
  const sorted = [...providers].sort((a, b) => b.tokens - a.tokens)

  return (
    <div className={cn("space-y-4", className)}>
      {sorted.map((provider) => {
        const percent = (provider.tokens / totalTokens) * 100
        return (
          <div key={provider.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: provider.color }} 
                />
                <span className="font-medium text-zinc-200">{provider.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">{provider.tokens.toLocaleString()} tokens</span>
                <span className="text-zinc-500 w-10 text-right">{percent.toFixed(1)}%</span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${percent}%`,
                  backgroundColor: provider.color
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
