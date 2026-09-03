"use client"

import * as React from "react"
import { Sidebar } from "./sidebar"
import { Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Mobile Header */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 md:hidden">
        <div className="flex items-center gap-2 font-semibold">
          Buddy
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-zinc-400"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden md:block w-[260px] shrink-0">
        <Sidebar />
      </div>

      {/* Sidebar - Mobile (Overlay) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/80" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-[260px] bg-zinc-950 shadow-xl">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-h-0 relative">
        <header className="absolute top-0 right-0 z-10 hidden md:flex h-14 items-center justify-end px-4 w-full bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800">
              <User className="h-4 w-4 text-zinc-400" />
            </Button>
          </div>
        </header>
        <main className="flex-1 min-h-0 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
