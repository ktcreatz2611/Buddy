import { ExportOptions } from './markdown-exporter';
import { exportToMarkdown, exportResearchToMarkdown } from './markdown-exporter';

function wrapInHtml(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #e4e4e7;
      background-color: #09090b;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    pre, code {
      background-color: #18181b;
      border: 1px solid #27272a;
      border-radius: 4px;
    }
    pre { padding: 1rem; overflow-x: auto; }
    a { color: #818cf8; text-decoration: none; }
    a:hover { text-decoration: underline; }
    h1, h2, h3 { color: #f4f4f5; }
    @media print {
      body {
        color: #000;
        background-color: #fff;
      }
      pre, code {
        background-color: #f4f4f5;
        border-color: #e4e4e7;
      }
      a { color: #000; }
    }
  </style>
</head>
<body>
  \${bodyContent}
</body>
</html>`;
}

function simpleMdToHtml(md: string): string {
  let html = md.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>");
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');
  html = html.replace(/\n$/gim, '<br />');
  
  const paragraphs = html.split('\n\n');
  return paragraphs.map(p => {
    if (p.startsWith('<h') || p.startsWith('<blockquote') || p.startsWith('<ul>') || !p.trim()) {
      return p;
    }
    return `<p>${p}</p>`;
  }).join('\n');
}

export function exportToHTML(messages: any[], options?: ExportOptions): string {
  const md = exportToMarkdown(messages, options);
  const body = simpleMdToHtml(md);
  return wrapInHtml("Conversation Export", body);
}

export function exportResearchToHTML(report: any): string {
  const md = exportResearchToMarkdown(report);
  const body = simpleMdToHtml(md);
  return wrapInHtml(report.title || "Research Report", body);
}
