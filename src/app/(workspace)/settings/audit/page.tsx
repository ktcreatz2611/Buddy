"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Search, Filter, ChevronDown, ChevronRight, Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuditEvent {
  id: string
  timestamp: string
  action: string
  category: "security" | "data" | "config"
  user: string
  resource: string
  metadata: Record<string, any>
}

const MOCK_EVENTS: AuditEvent[] = []

const categoryColors = {
  security: "text-red-400 bg-red-400/10 border-red-400/20",
  data: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  config: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
}

export default function AuditLogPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("All Actions")
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  // Filter events (mock implementation)
  const filteredEvents = MOCK_EVENTS.filter(event => {
    const matchesSearch = event.resource.toLowerCase().includes(search.toLowerCase()) || 
                          event.action.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "All Actions" || event.action.startsWith(filter.toLowerCase())
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6 text-zinc-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-sm text-zinc-400 mt-1">Track security events, configuration changes, and data access.</p>
        </div>
        <Button variant="outline" className="bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader className="border-b border-zinc-800 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                placeholder="Search by resource or action..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-900 border-zinc-800 pl-9 focus-visible:ring-indigo-500 text-sm"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  {filter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                <DropdownMenuItem onClick={() => setFilter("All Actions")} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">All Actions</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("credential")} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">Credentials (credential.*)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("memory")} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">Memory (memory.*)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("export")} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">Exports (export.*)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("budget")} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">Budget (budget.*)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-900/50">
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="w-8"></TableHead>
                <TableHead className="text-zinc-400">Timestamp</TableHead>
                <TableHead className="text-zinc-400">Action</TableHead>
                <TableHead className="text-zinc-400">User</TableHead>
                <TableHead className="text-zinc-400">Resource</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow className="border-zinc-800">
                  <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                    No audit events found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <React.Fragment key={event.id}>
                    <TableRow 
                      className="border-zinc-800 hover:bg-zinc-900/50 cursor-pointer"
                      onClick={() => toggleRow(event.id)}
                    >
                      <TableCell className="p-2 pl-4">
                        {expandedRows.has(event.id) ? (
                          <ChevronDown className="h-4 w-4 text-zinc-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-zinc-500" />
                        )}
                      </TableCell>
                      <TableCell className="text-zinc-400 text-sm whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors",
                          categoryColors[event.category]
                        )}>
                          {event.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-zinc-300 text-sm">{event.user}</TableCell>
                      <TableCell className="text-zinc-300 text-sm font-medium">{event.resource}</TableCell>
                    </TableRow>
                    {expandedRows.has(event.id) && (
                      <TableRow className="border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/20">
                        <TableCell colSpan={5} className="p-0">
                          <div className="p-4 pl-12 border-l-2 border-indigo-500 ml-2">
                            <pre className="text-xs text-zinc-300 bg-zinc-950 p-4 rounded-md border border-zinc-800 overflow-x-auto font-mono">
                              {JSON.stringify(event.metadata, null, 2)}
                            </pre>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
          
          {filteredEvents.length > 0 && (
            <div className="p-4 border-t border-zinc-800 flex justify-center">
              <Button variant="ghost" className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900">
                Load More Events
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
