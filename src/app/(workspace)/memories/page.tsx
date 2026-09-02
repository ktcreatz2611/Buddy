"use client"

import * as React from "react"
import { MemoryCard, Memory, MemoryScope } from "@/components/memory/memory-card"
import { AddMemoryDialog } from "@/components/memory/add-memory-dialog"
import { ContextPreview } from "@/components/memory/context-preview"
import { ClearScopeDialog } from "@/components/memory/clear-scope-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Trash2, BrainCircuit } from "lucide-react"

// Mock memory data for UI implementation
const MOCK_MEMORIES: Memory[] = [
  {
    id: "1",
    key: "user.preferences.theme",
    value: "User prefers dark mode and zinc colors.",
    scope: "global",
    scope_id: null,
    source: "agent_extracted",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "2",
    key: "workspace.stack",
    value: "Next.js App Router, Tailwind CSS v4, shadcn/ui.",
    scope: "workspace",
    scope_id: "wk_123",
    source: "user",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "3",
    key: "project.guidelines",
    value: "Always write functional components with hooks. Use React.FC only when necessary. Ensure accessibility.",
    scope: "project",
    scope_id: "prj_456",
    source: "agent_extracted",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

type TabId = "all" | MemoryScope

export default function MemoriesPage() {
  const [memories, setMemories] = React.useState<Memory[]>(MOCK_MEMORIES)
  const [activeTab, setActiveTab] = React.useState<TabId>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isClearOpen, setIsClearOpen] = React.useState(false)
  const [scopeToClear, setScopeToClear] = React.useState<MemoryScope>("global")

  const filteredMemories = React.useMemo(() => {
    return memories.filter(m => {
      const matchesScope = activeTab === "all" || m.scope === activeTab
      const matchesSearch = m.key.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            m.value.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesScope && matchesSearch
    })
  }, [memories, activeTab, searchQuery])

  const handleUpdate = async (id: string, value: string) => {
    // In a real app, this would be a PATCH to /api/memories/:id
    setMemories(prev => prev.map(m => m.id === id ? { ...m, value, updated_at: new Date().toISOString() } : m))
  }

  const handleDelete = async (id: string) => {
    // In a real app, this would be a DELETE to /api/memories/:id
    setMemories(prev => prev.filter(m => m.id !== id))
  }

  const handleAdd = async (data: { key: string; value: string; scope: MemoryScope; scope_id: string | null }) => {
    // In a real app, this would be a POST to /api/memories
    const newMemory: Memory = {
      id: Math.random().toString(),
      ...data,
      source: "user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setMemories(prev => [newMemory, ...prev])
  }

  const handleClearScope = async () => {
    // In a real app, POST /api/memories/clear with X-Confirm-Clear header
    setMemories(prev => prev.filter(m => m.scope !== scopeToClear))
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "all", label: "All" },
    { id: "global", label: "Global" },
    { id: "workspace", label: "Workspace" },
    { id: "project", label: "Project" },
    { id: "conversation", label: "Conversation" }
  ]

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-100 p-6 gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <BrainCircuit className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Memory</h1>
            <p className="text-sm text-zinc-400">Manage what Buddy remembers across contexts.</p>
          </div>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
          <Plus className="h-4 w-4 mr-2" /> Add Memory
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex space-x-1 p-1 bg-zinc-900 rounded-lg overflow-x-auto w-full sm:w-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                    activeTab === tab.id 
                      ? "bg-zinc-800 text-zinc-100 shadow-sm" 
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Search memories..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700 h-9"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-4">
            {filteredMemories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMemories.map(memory => (
                  <MemoryCard 
                    key={memory.id} 
                    memory={memory} 
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-800 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                  <BrainCircuit className="h-6 w-6 text-zinc-500" />
                </div>
                <h3 className="text-lg font-medium">No memories found</h3>
                <p className="text-sm text-zinc-400 max-w-sm mt-1">
                  {searchQuery 
                    ? `No results for "${searchQuery}" in ${activeTab} scope.` 
                    : `No ${activeTab === 'all' ? '' : activeTab} memories saved yet.`}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsAddOpen(true)} variant="outline" className="mt-4 border-zinc-800 text-zinc-300">
                    Add your first memory
                  </Button>
                )}
              </div>
            )}
            
            {activeTab !== "all" && filteredMemories.length > 0 && (
              <div className="pt-4 border-t border-zinc-800/50 flex justify-end">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setScopeToClear(activeTab)
                    setIsClearOpen(true)
                  }}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Clear {activeTab} Scope
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 h-full pb-4 hidden lg:block">
          <ContextPreview />
        </div>
      </div>

      <AddMemoryDialog 
        open={isAddOpen} 
        onOpenChange={setIsAddOpen}
        onAdd={handleAdd}
        defaultScope={activeTab !== "all" ? activeTab : "global"}
      />
      
      <ClearScopeDialog
        open={isClearOpen}
        onOpenChange={setIsClearOpen}
        scope={scopeToClear}
        count={memories.filter(m => m.scope === scopeToClear).length}
        onConfirm={handleClearScope}
      />
    </div>
  )
}
