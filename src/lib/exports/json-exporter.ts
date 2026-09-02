import { ExportOptions } from './markdown-exporter';

export function exportToJSON(messages: any[], options?: ExportOptions): string {
  const exportData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      ...options,
    },
    messages,
  };
  return JSON.stringify(exportData, null, 2);
}

export function exportResearchToJSON(report: any): string {
  const exportData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      type: 'research_report'
    },
    report,
  };
  return JSON.stringify(exportData, null, 2);
}
