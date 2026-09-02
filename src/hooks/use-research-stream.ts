import { useState, useEffect } from "react"
import type { Question } from "@/components/research/question-list"

interface Turn {
  id: string
  role: "investigator" | "analyst" | "orchestrator"
  content: string
  tokens: number
  timestamp: string
}

interface Evidence {
  text: string
  source: string
  url: string
  type: "supporting" | "refuting"
}

interface Claim {
  id: string
  text: string
  status: "verified" | "probable" | "uncertain" | "conflicting"
  confidence: number
  evidence: Evidence[]
}

type ResearchStatus = "planning" | "investigating" | "analyzing" | "synthesizing" | "complete" | "error" | "cancelled"

export function useResearchStream(sessionId: string | null) {
  const [turns, setTurns] = useState<Turn[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [status, setStatus] = useState<ResearchStatus>("planning")
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!sessionId) return

    // MOCK IMPLEMENTATION for UI development
    setIsConnected(true)
    
    // Simulate initial load
    setTimeout(() => {
      setQuestions([
        { id: "q1", text: "What is the primary bottleneck for commercialization?", status: "open", priority: "high" },
        { id: "q2", text: "Who are the leading manufacturers?", status: "answered", priority: "medium" }
      ])
      
      setTurns([
        {
          id: "t1",
          role: "orchestrator",
          content: "Initiating research session on Solid-State Batteries. Delegating initial landscape search to Investigator.",
          tokens: 45,
          timestamp: new Date().toLocaleTimeString()
        }
      ])
      
      setStatus("investigating")
    }, 1000)

    setTimeout(() => {
      setTurns(prev => [...prev, {
        id: "t2",
        role: "investigator",
        content: `> SEARCH: "Solid state battery commercialization bottlenecks 2024"\n\nFound 5 key articles. Primary issues appear to be:\n1. Manufacturing scalability (specifically applying solid electrolyte thinly)\n2. Interfacial resistance\n3. High material costs (lithium sulfide)`,
        tokens: 342,
        timestamp: new Date().toLocaleTimeString()
      }])
    }, 3000)

    setTimeout(() => {
      setStatus("analyzing")
      setClaims([
        {
          id: "c1",
          text: "Manufacturing scalability is the primary bottleneck, not fundamental chemistry.",
          status: "probable",
          confidence: 85,
          evidence: [
            { text: "Yield rates on pilot lines remain below 50%", source: "Nature Energy", url: "#", type: "supporting" }
          ]
        }
      ])
    }, 5000)

    return () => {
      setIsConnected(false)
    }
  }, [sessionId])

  return { turns, claims, questions, status, isConnected }
}
