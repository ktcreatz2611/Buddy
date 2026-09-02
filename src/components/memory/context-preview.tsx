"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronUp, Cpu, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TokenSection {
  name: string
  tokens: number
  content: string
  color: string
}

export function ContextPreview() {
  const [conversationId, setConversationId] = React.useState("")
  const [testMessage, setTestMessage] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [results, setResults] = React.useState<{
    sections: TokenSection[]
    totalTokens: number
    maxTokens: number
  } | null>(null)
  
  const [expandedSection, setExpandedSection] = React.useState<string | null>(null)

  const handlePreview = async () => {
    setIsLoading(true)
    
    // Mock simulation of generating context
    setTimeout(() => {
      const mockSections: TokenSection[] = [
        { name: "System Prompt", tokens: 850, content: "You are Buddy, a helpful AI assistant...", color: "bg-blue-500" },
        { name: "Memories", tokens: 320, content: "User prefers TypeScript.\nProject uses Next.js 15...", color: "bg-purple-500" },
        { name: "Conversation Summary", tokens: 0, content: "", color: "bg-yellow-500" },
        { name: "RAG Results", tokens: 1240, content: "File: src/components/ui/button.tsx\n...", color: "bg-green-500" },
        { name: "Recent Messages", tokens: 480, content: "User: How do I build a context preview?\n...", color: "bg-orange-500" },
        { name: "New Message", tokens: testMessage ? testMessage.length / 4 : 0, content: testMessage, color: "bg-zinc-300" },
      ].filter(s => s.tokens > 0)

      const total = mockSections.reduce((sum, s) => sum + s.tokens, 0)
      
      setResults({
        sections: mockSections,
        totalTokens: total,
        maxTokens: 8192 // Example max tokens
      })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Card className="bg-zinc-950 border-zinc-800 text-zinc-100 flex flex-col h-full">
      <CardHeader className="p-4 border-b border-zinc-800">
        <CardTitle className="text-lg flex items-center gap-2">
          <Cpu className="h-5 w-5 text-indigo-400" />
          Context Assembly Preview
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Simulate how context is built for the LLM.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4 overflow-auto">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="conv-id">Target Conversation (Optional)</Label>
            <Input 
              id="conv-id" 
              placeholder="Conversation ID"
              value={conversationId}
              onChange={(e) => setConversationId(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-zinc-100"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="test-msg">Test Message</Label>
            <Textarea 
              id="test-msg" 
              placeholder="Type a message to see how it affects context..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-zinc-100 min-h-[100px] resize-y"
            />
          </div>
          
          <Button 
            onClick={handlePreview} 
            disabled={isLoading} 
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Preview Context Build
          </Button>
        </div>

        {results && (
          <div className="mt-8 space-y-6 pt-6 border-t border-zinc-800">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Token Usage</span>
                <span>{Math.round(results.totalTokens).toLocaleString()} / {results.maxTokens.toLocaleString()}</span>
              </div>
              
              {/* Stacked Bar Chart */}
              <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden flex">
                {results.sections.map((section, idx) => {
                  const width = `${Math.max((section.tokens / results.maxTokens) * 100, 0.5)}%`
                  return (
                    <div 
                      key={idx}
                      className={cn("h-full", section.color)}
                      style={{ width }}
                      title={`${section.name}: ${Math.round(section.tokens)} tokens`}
                    />
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                {results.sections.map((section, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <div className={cn("w-2 h-2 rounded-full", section.color)} />
                    {section.name} ({Math.round(section.tokens)})
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-zinc-300">Context Sections</h4>
              <div className="space-y-2">
                {results.sections.map((section, idx) => (
                  <div key={idx} className="border border-zinc-800 rounded-md overflow-hidden bg-zinc-900/50">
                    <button
                      onClick={() => setExpandedSection(expandedSection === section.name ? null : section.name)}
                      className="w-full flex items-center justify-between p-3 text-sm hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", section.color)} />
                        <span className="font-medium">{section.name}</span>
                        <span className="text-zinc-500 text-xs">{Math.round(section.tokens)} tokens</span>
                      </div>
                      {expandedSection === section.name ? (
                        <ChevronUp className="h-4 w-4 text-zinc-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-zinc-500" />
                      )}
                    </button>
                    
                    {expandedSection === section.name && (
                      <div className="p-3 border-t border-zinc-800 bg-zinc-950">
                        <ScrollArea className="h-[200px] w-full">
                          <pre className="text-xs font-mono text-zinc-400 whitespace-pre-wrap">
                            {section.content}
                          </pre>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
