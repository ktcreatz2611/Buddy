import * as React from "react"
import { cn } from "@/lib/utils"

interface UsageChartProps {
  data: { date: string; value: number }[]
  className?: string
}

export function UsageChart({ data, className }: UsageChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  return (
    <div className={cn("flex h-64 items-end gap-1 sm:gap-2", className)}>
      <div className="flex h-full flex-col justify-between py-2 pr-4 text-xs text-zinc-500">
        <span>{maxValue}</span>
        <span>{Math.round(maxValue / 2)}</span>
        <span>0</span>
      </div>
      <div className="flex h-full flex-1 items-end gap-1 sm:gap-2 border-l border-b border-zinc-800 pb-0 pl-0 relative group">
        {data.map((item, i) => {
          const heightPercent = (item.value / maxValue) * 100
          
          return (
            <div
              key={i}
              className="group relative flex flex-1 flex-col justify-end"
              style={{ height: "100%" }}
            >
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 hidden w-max rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-200 opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
                {item.date}: {item.value.toLocaleString()}
              </div>
              
              {/* Bar */}
              <div
                className="w-full rounded-t-sm bg-indigo-500 transition-all hover:bg-indigo-400"
                style={{ height: `${heightPercent}%`, minHeight: heightPercent > 0 ? '4px' : '0' }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
