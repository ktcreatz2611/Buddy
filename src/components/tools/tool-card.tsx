"use client"

import * as React from "react"
import { Shield, Globe, Terminal, HardDrive, Play } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ToolTester } from "./tool-tester"

export type PermissionScope = "read_only" | "network" | "execute" | "filesystem";

interface ToolCardProps {
  tool: {
    id: string
    name: string
    description: string
    permissionScope: PermissionScope
    status: "active" | "error" | "inactive"
    schema: Record<string, string>
  }
}

export function ToolCard({ tool }: ToolCardProps) {
  const [testerOpen, setTesterOpen] = React.useState(false)

  const getScopeDetails = (scope: PermissionScope) => {
    switch (scope) {
      case "read_only": return { icon: Shield, color: "bg-green-500/10 text-green-500 border-green-500/20" }
      case "network": return { icon: Globe, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" }
      case "execute": return { icon: Terminal, color: "bg-red-500/10 text-red-500 border-red-500/20" }
      case "filesystem": return { icon: HardDrive, color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" }
    }
  }

  const scopeInfo = getScopeDetails(tool.permissionScope)
  const ScopeIcon = scopeInfo.icon

  return (
    <>
      <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-lg text-zinc-100">{tool.name}</CardTitle>
            <Badge variant="outline" className={scopeInfo.color}>
              <ScopeIcon className="w-3 h-3 mr-1" />
              {tool.permissionScope}
            </Badge>
          </div>
          <CardDescription className="text-zinc-400">
            {tool.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="text-xs font-mono bg-zinc-950 p-2 rounded border border-zinc-800 text-zinc-300">
            {JSON.stringify(tool.schema, null, 2)}
          </div>
        </CardContent>
        <CardFooter className="pt-3 border-t border-zinc-800">
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
            onClick={() => setTesterOpen(true)}
          >
            <Play className="w-4 h-4 mr-2" />
            Test Tool
          </Button>
        </CardFooter>
      </Card>
      
      <ToolTester 
        open={testerOpen} 
        onOpenChange={setTesterOpen} 
        tool={tool} 
      />
    </>
  )
}
