import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Minus } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  icon: React.ReactNode
  trend?: {
    value: number
    label: string
  }
  className?: string
}

export function StatsCard({ title, value, icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("bg-zinc-950 border-zinc-800 transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:border-zinc-700", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-400">{title}</p>
          <div className="h-4 w-4 text-zinc-400">
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <h2 className="text-3xl font-bold text-zinc-100">{value}</h2>
        </div>
        {trend && (
          <div className="mt-2 flex items-center text-xs">
            {trend.value > 0 ? (
              <ChevronUp className="mr-1 h-4 w-4 text-green-400" />
            ) : trend.value < 0 ? (
              <ChevronDown className="mr-1 h-4 w-4 text-red-400" />
            ) : (
              <Minus className="mr-1 h-4 w-4 text-zinc-400" />
            )}
            <span
              className={cn(
                "font-medium",
                trend.value > 0
                  ? "text-green-400"
                  : trend.value < 0
                  ? "text-red-400"
                  : "text-zinc-400"
              )}
            >
              {Math.abs(trend.value)}%
            </span>
            <span className="ml-1 text-zinc-500">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
