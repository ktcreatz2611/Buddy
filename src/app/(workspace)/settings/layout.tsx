import * as React from "react"
import { SettingsNav } from "./settings-nav"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full w-full flex-col bg-zinc-950 text-zinc-100 overflow-auto">
      <div className="border-b border-zinc-800 bg-zinc-950/50">
        <div className="mx-auto max-w-4xl px-6 pt-8 pb-0">
          <h1 className="text-2xl font-bold tracking-tight mb-6">Settings</h1>
          <SettingsNav />
        </div>
      </div>
      <div className="flex-1">
        <div className="mx-auto max-w-4xl p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
