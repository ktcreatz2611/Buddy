export interface ExportOptions {
  includeMetadata?: boolean;
  includeTimestamps?: boolean;
  includeModelInfo?: boolean;
}

export function exportToMarkdown(messages: any[], options?: ExportOptions): string {
  let md = "# Conversation Export\n\n";
  for (const msg of messages) {
    if (options?.includeTimestamps && msg.createdAt) {
      md += `*${new Date(msg.createdAt).toLocaleString()}*\n`;
    }
    md += `**${msg.role}**:\n${msg.content}\n\n`;
    if (options?.includeModelInfo && msg.modelInfo) {
      md += `> Model: ${msg.modelInfo}\n\n`;
    }
  }
  return md;
}

export function exportResearchToMarkdown(report: any): string {
  let md = `# Research Report: ${report.title || 'Untitled'}\n\n`;
  if (report.summary) {
    md += `## Summary\n${report.summary}\n\n`;
  }
  if (report.findings && report.findings.length > 0) {
    md += `## Findings\n`;
    for (const finding of report.findings) {
      md += `- ${finding}\n`;
    }
    md += `\n`;
  }
  if (report.sources && report.sources.length > 0) {
    md += `## Sources\n`;
    for (const source of report.sources) {
      md += `- [${source.title || source.url}](${source.url})\n`;
    }
  }
  return md;
}
