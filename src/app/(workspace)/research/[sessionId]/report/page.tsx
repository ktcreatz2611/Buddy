"use client"

import * as React from "react"
import Link from "next/link"
import { use } from "react"
import { ArrowLeft, Download, Copy, ExternalLink, CheckCircle2, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageProps {
  params: Promise<{ sessionId: string }>
}

export default function ResearchReportPage({ params }: PageProps) {
  const { sessionId } = use(params)

  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-y-auto text-zinc-200">
      <div className="max-w-4xl w-full mx-auto p-4 md:p-8 lg:py-12 space-y-8">
        {/* Top actions */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" asChild className="text-zinc-400 hover:text-zinc-100 gap-2">
            <Link href={`/research/${sessionId}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to Session
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-zinc-800 hover:bg-zinc-800">
              <Copy className="h-4 w-4" /> Copy Markdown
            </Button>
            <Button variant="outline" size="sm" className="gap-2 border-zinc-800 hover:bg-zinc-800">
              <Download className="h-4 w-4" /> Export PDF
            </Button>
          </div>
        </div>

        {/* Document Body */}
        <article className="prose prose-invert prose-zinc max-w-none prose-headings:font-semibold prose-a:text-indigo-400">
          <h1 className="text-3xl md:text-4xl tracking-tight mb-4">
            Solid-State Batteries: Current State of the Art & Commercial Viability
          </h1>
          
          <div className="flex gap-4 text-sm text-zinc-500 mb-8 border-b border-zinc-800 pb-8">
            <span>Generated: Sept 2, 2026</span>
            <span>•</span>
            <span>24 Turns</span>
            <span>•</span>
            <span>89,204 Tokens</span>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl my-8">
            <h2 className="text-xl font-semibold mt-0 mb-3 text-zinc-100">Executive Summary</h2>
            <p className="mb-0 text-zinc-300">
              Solid-state batteries (SSBs) promise significant improvements over traditional lithium-ion technology, primarily in energy density (up to 2-3x) and safety (reduced fire risk). While major automotive players like Toyota and QuantumScape have demonstrated functional prototypes, mass commercialization remains bottlenecked by manufacturing scalability, high costs, and low-temperature performance issues. Broad market adoption in EVs is likely pushed to the late 2020s or early 2030s.
            </p>
          </div>

          <h2>Key Findings</h2>
          
          <div className="grid gap-4 my-6 not-prose">
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex gap-4 items-start">
              <div className="text-emerald-500 shrink-0 mt-1">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-zinc-100 mb-1">Energy Density Improvements are Realized in Labs</h4>
                <p className="text-sm text-zinc-400">Prototype cells routinely achieve &gt;400 Wh/kg, significantly outperforming current top-tier Li-ion cells (~250-300 Wh/kg).</p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex gap-4 items-start">
              <div className="text-amber-500 shrink-0 mt-1">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-zinc-100 mb-1">Manufacturing Parity is Decades Away</h4>
                <p className="text-sm text-zinc-400">Yield rates for sulfide-based solid electrolytes remain below 50% in pilot lines, driving up costs to an estimated $400/kWh compared to current $120/kWh for liquid Li-ion.</p>
              </div>
            </div>
          </div>

          <h2>Methodology</h2>
          <p>
            This research was conducted autonomously using a multi-agent orchestrated approach:
          </p>
          <ul>
            <li><strong>Investigator Agent:</strong> Conducted 14 web searches and ingested 8 scientific papers via arXiv and semantic scholar.</li>
            <li><strong>Analyst Agent:</strong> Synthesized findings, verified claims across multiple sources, and identified conflicting timelines between PR announcements and technical whitepapers.</li>
          </ul>

          <h2>Conflicting Evidence</h2>
          <div className="my-6 not-prose overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-zinc-900 border-y border-zinc-800 text-zinc-400">
                <tr>
                  <th className="py-3 px-4 font-medium">Claim</th>
                  <th className="py-3 px-4 font-medium">Supporting</th>
                  <th className="py-3 px-4 font-medium">Refuting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr>
                  <td className="py-3 px-4 font-medium text-zinc-200">Toyota will release SSB cars by 2027</td>
                  <td className="py-3 px-4 text-emerald-400/90 bg-emerald-500/5">Official Toyota Press Releases (2023, 2024)</td>
                  <td className="py-3 px-4 text-red-400/90 bg-red-500/5">Supply chain analysts note lack of tooling orders; suggest 2030+ is more realistic.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Conclusion</h2>
          <p>
            The transition to solid-state batteries will likely be gradual rather than disruptive. Initial applications will be confined to premium/niche vehicles and consumer electronics where cost constraints are looser, while traditional Li-ion technology will dominate mass-market EVs for the foreseeable future.
          </p>

          <hr className="border-zinc-800 my-8" />
          
          <h2 className="text-lg">Sources</h2>
          <ol className="text-sm space-y-2 text-zinc-400">
            <li>
              Nature Energy (2024). <em>Scalability of solid electrolytes</em>. 
              <a href="#" className="ml-2 inline-flex items-center text-indigo-400 hover:underline">Link <ExternalLink className="h-3 w-3 ml-1" /></a>
            </li>
            <li>
              BloombergNEF (2023). <em>Battery Price Survey</em>.
              <a href="#" className="ml-2 inline-flex items-center text-indigo-400 hover:underline">Link <ExternalLink className="h-3 w-3 ml-1" /></a>
            </li>
          </ol>
        </article>
      </div>
    </div>
  )
}
