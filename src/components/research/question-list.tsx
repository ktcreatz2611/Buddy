import * as React from "react"
import { Circle, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export type QuestionStatus = "open" | "answered" | "deferred"
export type QuestionPriority = "high" | "medium" | "low"

export interface Question {
  id: string
  text: string
  status: QuestionStatus
  priority: QuestionPriority
  parentId?: string
}

interface QuestionListProps {
  questions: Question[]
}

export function QuestionList({ questions }: QuestionListProps) {
  // Group by status
  const openQs = questions.filter(q => q.status === "open")
  const answeredQs = questions.filter(q => q.status === "answered")
  const deferredQs = questions.filter(q => q.status === "deferred")

  const renderGroup = (title: string, qs: Question[]) => {
    if (qs.length === 0) return null

    return (
      <div className="mb-4 last:mb-0">
        <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 flex items-center justify-between">
          {title}
          <span>{qs.length}</span>
        </h4>
        <div className="space-y-1.5">
          {qs.map(q => (
            <div key={q.id} className="flex items-start gap-2 p-2 rounded-md bg-zinc-900 border border-zinc-800/50">
              <div className="mt-0.5 shrink-0">
                {q.status === "open" && <div className="h-4 w-4 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                </div>}
                {q.status === "answered" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                {q.status === "deferred" && <Clock className="h-4 w-4 text-zinc-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm leading-snug",
                  q.status === "answered" ? "text-zinc-400 line-through decoration-zinc-600" : "text-zinc-200"
                )}>
                  {q.text}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "text-[10px] uppercase font-semibold px-1 rounded-sm",
                    q.priority === "high" ? "bg-red-500/10 text-red-400" :
                    q.priority === "medium" ? "bg-amber-500/10 text-amber-400" :
                    "bg-zinc-800 text-zinc-400"
                  )}>
                    {q.priority}
                  </span>
                  {q.parentId && (
                    <span className="text-[10px] text-zinc-500 flex items-center">
                      ↳ Sub-question
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {renderGroup("Open", openQs)}
      {renderGroup("Answered", answeredQs)}
      {renderGroup("Deferred", deferredQs)}
      
      {questions.length === 0 && (
        <p className="text-sm text-zinc-500 italic">No specific questions tracked yet.</p>
      )}
    </div>
  )
}
