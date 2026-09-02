import { Buffer } from 'buffer';
import { fileTypeFromBuffer } from 'file-type';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import * as xlsx from 'xlsx';

export interface ParsedDocument {
  content: string;
  title?: string;
  pageCount?: number;
  metadata: Record<string, unknown>;
  pages?: Array<{ pageNumber: number; content: string; sectionPath?: string }>;
}

/**
 * Parses a document buffer into text and metadata.
 */
export async function parseDocument(buffer: Buffer, mimeType: string, filename: string): Promise<ParsedDocument> {
  const typeInfo = await fileTypeFromBuffer(buffer);
  
  if (buffer.length > 50 * 1024 * 1024) {
    throw new Error('File exceeds 50MB size limit');
  }

  // A simple check for compression ratio could be done if it's a zip file or similar.
  // We'll skip complex zip-bomb checking for raw files unless they are actually extracted.
  
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (mimeType === 'application/pdf' || typeInfo?.ext === 'pdf' || ext === 'pdf') {
    const pdf = new PDFParse({ data: new Uint8Array(buffer) });
    const textResult = await pdf.getText();
    return {
      content: textResult.text ?? '',
      title: filename,
      pageCount: textResult.pages?.length,
      metadata: {},
    };
  }

  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === 'docx') {
    const result = await mammoth.extractRawText({ buffer });
    return {
      content: result.value,
      metadata: { messages: result.messages },
    };
  }

  if (ext === 'xlsx' || ext === 'xls' || ext === 'csv' || mimeType.includes('spreadsheet')) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    let content = '';
    const metadata: Record<string, unknown> = { sheets: workbook.SheetNames };
    
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const csv = xlsx.utils.sheet_to_csv(sheet);
      content += `\n--- Sheet: ${sheetName} ---\n${csv}`;
    }
    
    return {
      content,
      metadata,
    };
  }

  if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
    // OCR stub
    return {
      content: '[Image content - OCR not yet implemented]',
      metadata: { originalFilename: filename, type: typeInfo?.mime || mimeType },
    };
  }

  // Fallback to plain text
  try {
    const text = buffer.toString('utf-8');
    return {
      content: text,
      metadata: {},
    };
  } catch (err) {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}
