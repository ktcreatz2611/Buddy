import { ToolCard } from "@/components/tools/tool-card"

export default function ToolsPage() {
  const tools: Array<{ id: string; name: string; description: string; permissionScope: 'read_only' | 'network' | 'execute' | 'filesystem'; status: 'active' | 'inactive' | 'error'; schema: Record<string, string> }> = [];

  return (
    <div className="flex-1 overflow-auto bg-zinc-950 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Tools</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage and test AI tools available in this workspace.</p>
        </div>
        
        {tools.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/50">
            <h3 className="text-lg font-medium text-zinc-200 mb-1">No tools configured</h3>
            <p className="text-zinc-500 mb-4 max-w-sm">
              You haven't added any custom tools or integrations to your workspace yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
