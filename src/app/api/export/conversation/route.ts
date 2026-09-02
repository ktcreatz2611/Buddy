import { NextRequest, NextResponse } from "next/server"
import { exportToMarkdown } from "@/lib/exports/markdown-exporter"
import { exportToJSON } from "@/lib/exports/json-exporter"
import { exportToHTML } from "@/lib/exports/html-exporter"

export async function POST(req: NextRequest) {
  try {
    const { conversationId, format } = await req.json()

    if (!conversationId || !format) {
      return NextResponse.json({ error: "Missing conversationId or format" }, { status: 400 })
    }

    const mockMessages = [
      { role: "user", content: "Hello", createdAt: new Date().toISOString() },
      { role: "assistant", content: "Hi there! How can I help?", createdAt: new Date().toISOString() }
    ]

    let content = ""
    let contentType = ""
    let extension = ""

    switch (format) {
      case 'markdown':
        content = exportToMarkdown(mockMessages)
        contentType = 'text/markdown'
        extension = 'md'
        break
      case 'json':
        content = exportToJSON(mockMessages)
        contentType = 'application/json'
        extension = 'json'
        break
      case 'html':
        content = exportToHTML(mockMessages)
        contentType = 'text/html'
        extension = 'html'
        break
      default:
        return NextResponse.json({ error: "Invalid format" }, { status: 400 })
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="conversation-${conversationId}.${extension}"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
