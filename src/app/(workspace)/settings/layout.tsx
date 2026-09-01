import * as React from "react"
import Link from "next/link"
import { Settings, User, Database } from "lucide-react"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full w-full bg-zinc-950 text-zinc-100">
      {/* Settings Sidebar */}
      <div className="w-64 border-r border-zinc-800 bg-zinc-950/50 p-4">
        <h2 className="mb-4 text-lg font-semibold px-2">Settings</h2>
        <nav className="space-y-1">
          <Link
            href="/settings/providers"
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-zinc-50"
          >
            <Database className="h-4 w-4" />
            Provider Management
          </Link>
          <Link
            href="/settings/general"
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50"
          >
            <Settings className="h-4 w-4" />
            General Settings
          </Link>
          <Link
            href="/settings/profile"
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
