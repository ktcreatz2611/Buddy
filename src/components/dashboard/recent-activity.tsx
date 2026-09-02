import * as React from "react"
import { cn } from "@/lib/utils"
import { MessageSquare, FlaskConical, Download, Brain, LucideIcon } from "lucide-react"

export type ActivityType = "chat" | "research" | "export" | "memory"

export interface Activity {
  id: string
  type: ActivityType
  description: string
  timestamp: string
  tokens?: number
}

interface RecentActivityProps {
  activities: Activity[]
  className?: string
}

const icons: Record<ActivityType, LucideIcon> = {
  chat: MessageSquare,
  research: FlaskConical,
  export: Download,
  memory: Brain
}

export function RecentActivity({ activities, className }: RecentActivityProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {activities.map((activity) => {
        const Icon = icons[activity.type]
        
        return (
          <div key={activity.id} className="flex items-start gap-4 rounded-lg border border-zinc-800/50 bg-zinc-900/20 p-3 transition-colors hover:bg-zinc-900/50">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-zinc-800 text-zinc-400">
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-zinc-200">{activity.description}</p>
                <span className="text-xs text-zinc-500 whitespace-nowrap ml-2">{activity.timestamp}</span>
              </div>
              {activity.tokens && (
                <p className="text-xs text-zinc-500">
                  {activity.tokens.toLocaleString()} tokens
                </p>
              )}
            </div>
          </div>
        )
      })}
      {activities.length > 0 && (
        <button className="w-full text-center text-sm text-indigo-400 hover:text-indigo-300 py-2">
          View all activity
        </button>
      )}
    </div>
  )
}
