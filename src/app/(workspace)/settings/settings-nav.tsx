"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "General", href: "/settings/general" },
  { name: "Providers", href: "/settings/providers" },
  { name: "Budget", href: "/settings/budget" },
  { name: "Audit Log", href: "/settings/audit" },
]

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-6 overflow-x-auto">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors",
              isActive
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            )}
          >
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
