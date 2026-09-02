import { NextRequest, NextResponse } from "next/server"
import { exportResearchToMarkdown } from "@/lib/exports/markdown-exporter"
import { exportResearchToJSON } from "@/lib/exports/json-exporter"
import { exportResearchToHTML } from "@/lib/exports/html-exporter"

export async function POST(req: NextRequest) {
  try {
    const { sessionId, format } = await req.json()

    if (!sessionId || !format) {
      return NextResponse.json({ error: "Missing sessionId or format" }, { status: 400 })
    }

    const mockReport = {
      title: "Sample Report",
      summary: "This is a mock research report.",
      findings: ["Finding 1", "Finding 2"],
      sources: [{ title: "Source 1", url: "https://example.com" }]
    }

    let content = ""
    let contentType = ""
    let extension = ""

    switch (format) {
      case 'markdown':
        content = exportResearchToMarkdown(mockReport)
        contentType = 'text/markdown'
        extension = 'md'
        break
      case 'json':
        content = exportResearchToJSON(mockReport)
        contentType = 'application/json'
        extension = 'json'
        break
      case 'html':
        content = exportResearchToHTML(mockReport)
        contentType = 'text/html'
        extension = 'html'
        break
      default:
        return NextResponse.json({ error: "Invalid format" }, { status: 400 })
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="research-${sessionId}.${extension}"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
