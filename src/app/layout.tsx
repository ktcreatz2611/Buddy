import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css" // Assuming standard Tailwind v4 globals

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Buddy - Multi-Provider AI Workspace",
  description: "An intelligent chat and research workspace with multi-provider support.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30`}>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}
