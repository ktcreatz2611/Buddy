"use client";

import { useState } from "react";
import { FileText, Image as ImageIcon, Table2, Trash2, Eye, File, FileJson, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChunkViewer } from "./chunk-viewer";

interface DocumentCardProps {
  id: string;
  filename: string;
  type: string;
  size: number;
  pages?: number;
  status: 'processing' | 'ready' | 'error';
  uploadDate: string;
  chunks?: number;
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function DocumentCard({ id, filename, type, size, pages, status, uploadDate, chunks }: DocumentCardProps) {
  const [showChunks, setShowChunks] = useState(false);

  const getIcon = () => {
    if (type.includes('pdf') || type.includes('word') || type.includes('text')) return <FileText className="w-5 h-5 text-blue-400" />;
    if (type.includes('image')) return <ImageIcon className="w-5 h-5 text-purple-400" />;
    if (type.includes('excel') || type.includes('csv') || type.includes('spreadsheet')) return <Table2 className="w-5 h-5 text-green-400" />;
    if (type.includes('json')) return <FileJson className="w-5 h-5 text-yellow-400" />;
    return <File className="w-5 h-5 text-zinc-400" />;
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'processing':
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case 'ready':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Ready
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
    }
  };

  return (
    <>
      <Card className="bg-zinc-950/50 border-zinc-800 hover:border-zinc-700 transition-colors">
        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
          <div className="flex items-start space-x-3 overflow-hidden">
            <div className="mt-1 flex-shrink-0">{getIcon()}</div>
            <div className="overflow-hidden">
              <CardTitle className="text-sm font-medium text-zinc-200 truncate" title={filename}>
                {filename}
              </CardTitle>
              <div className="text-xs text-zinc-500 mt-1 flex items-center space-x-2">
                <span>{formatFileSize(size)}</span>
                {pages !== undefined && (
                  <>
                    <span>&bull;</span>
                    <span>{pages} pages</span>
                  </>
                )}
                {chunks !== undefined && (
                  <>
                    <span>&bull;</span>
                    <span>{chunks} chunks</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2 pb-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 mt-2">
            <span>{new Date(uploadDate).toLocaleDateString()}</span>
            {getStatusBadge()}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-2 flex justify-end space-x-2 border-t border-zinc-800/50 mt-2">
          {status === 'ready' && (
            <Button variant="ghost" size="sm" className="h-8 text-xs text-zinc-400 hover:text-zinc-100" onClick={() => setShowChunks(true)}>
              <Eye className="w-3 h-3 mr-1.5" />
              Chunks
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-8 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-400/10">
            <Trash2 className="w-3 h-3 mr-1.5" />
            Delete
          </Button>
        </CardFooter>
      </Card>
      
      <ChunkViewer 
        isOpen={showChunks} 
        onClose={() => setShowChunks(false)} 
        documentId={id} 
        filename={filename} 
      />
    </>
  );
}
