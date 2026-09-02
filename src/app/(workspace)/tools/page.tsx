import { ToolCard } from "@/components/tools/tool-card"

export default function ToolsPage() {
  const tools: Array<{ id: string; name: string; description: string; permissionScope: 'read_only' | 'network' | 'execute' | 'filesystem'; status: 'active' | 'inactive' | 'error'; schema: Record<string, string> }> = [
    {
      id: "web-search",
      name: "Web Search",
      description: "Search the internet for information.",
      permissionScope: "network" as const,
      status: "active" as const,
      schema: { query: "string" }
    },
    {
      id: "read-file",
      name: "Read File",
      description: "Read contents of a local file.",
      permissionScope: "read_only" as const,
      status: "active" as const,
      schema: { path: "string" }
    },
    {
      id: "run-python",
      name: "Execute Python",
      description: "Run python scripts.",
      permissionScope: "execute" as const,
      status: "active" as const,
      schema: { code: "string" }
    },
    {
      id: "write-file",
      name: "Write File",
      description: "Write content to a file.",
      permissionScope: "filesystem" as const,
      status: "active" as const,
      schema: { path: "string", content: "string" }
    }
  ];

  return (
    <div className="flex-1 overflow-auto bg-zinc-950 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Tools</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage and test AI tools available in this workspace.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </div>
  )
}
