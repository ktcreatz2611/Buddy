import * as React from "react"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full w-full flex-col bg-zinc-950 text-zinc-100 overflow-auto">
      <div className="flex-1">
        <div className="mx-auto max-w-4xl p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
