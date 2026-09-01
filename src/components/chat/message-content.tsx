import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeHighlight from "rehype-highlight"
import rehypeKatex from "rehype-katex"
import "highlight.js/styles/github-dark.css" // or any other dark theme you prefer

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface MessageContentProps {
  content: string
  className?: string
}

export function MessageContent({ content, className }: MessageContentProps) {
  return (
    <div className={cn("prose prose-invert max-w-none break-words", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
        components={{
          code(props) {
            const { children, className, node, ...rest } = props
            const match = /language-(\w+)/.exec(className || "")
            const isInline = !match && !className?.includes("language-")
            
            if (isInline) {
              return (
                <code className="rounded bg-zinc-800/50 px-1 py-0.5" {...rest}>
                  {children}
                </code>
              )
            }

            return <CodeBlock language={match?.[1]} value={String(children).replace(/\n$/, "")} {...rest} />
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function CodeBlock({ language, value, ...props }: any) {
  const [isCopied, setIsCopied] = React.useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="relative my-4 rounded-md border border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between px-4 py-2 text-xs text-zinc-400 border-b border-zinc-800">
        <span>{language || "text"}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={copyToClipboard}
        >
          {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <div className="overflow-x-auto p-4">
        <code className={cn("text-sm", language ? `language-${language}` : "")} {...props}>
          {value}
        </code>
      </div>
    </div>
  )
}
