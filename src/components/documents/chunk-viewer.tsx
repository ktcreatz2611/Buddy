"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChunkViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  filename: string;
}

// Mock chunks data
const mockChunks = Array.from({ length: 15 }).map((_, i) => ({
  id: `chunk-${i}`,
  index: i + 1,
  page: Math.floor(i / 3) + 1,
  section: `Section ${Math.floor(i / 5) + 1}`,
  tokens: Math.floor(Math.random() * 300) + 100,
  content: "This is a simulated chunk of text extracted from the document. It contains relevant information that can be used by the RAG system to answer user queries. The content has been processed, cleaned, and embedded for vector search capabilities. Additional text follows to demonstrate truncation and expansion of the content area within the chunk viewer interface. ".repeat(3)
}));

export function ChunkViewer({ isOpen, onClose, documentId, filename }: ChunkViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedChunk, setExpandedChunk] = useState<string | null>(null);

  const filteredChunks = mockChunks.filter(c => 
    c.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col bg-zinc-950 border-zinc-800 text-zinc-100 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-zinc-800">
          <DialogTitle className="flex items-center justify-between pr-4">
            <span className="truncate pr-4">Chunks: {filename}</span>
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
              {mockChunks.length} Total
            </Badge>
          </DialogTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              placeholder="Search in chunks..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-200"
            />
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 pt-2">
          <div className="space-y-4">
            {filteredChunks.map(chunk => (
              <div key={chunk.id} className="bg-zinc-900/50 border border-zinc-800 rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-xs text-zinc-400">
                    <span className="font-medium text-zinc-300">Chunk {chunk.index}</span>
                    <span>&bull;</span>
                    <span>Page {chunk.page}</span>
                    <span>&bull;</span>
                    <span>{chunk.section}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] h-5 border-zinc-700 text-zinc-400">
                    {chunk.tokens} tokens
                  </Badge>
                </div>
                <div className="relative">
                  <p className={`text-sm text-zinc-300 font-serif leading-relaxed ${expandedChunk !== chunk.id ? 'line-clamp-3' : ''}`}>
                    {chunk.content}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 mt-1 text-xs text-indigo-400 hover:text-indigo-300 p-0 hover:bg-transparent"
                    onClick={() => setExpandedChunk(expandedChunk === chunk.id ? null : chunk.id)}
                  >
                    {expandedChunk === chunk.id ? (
                      <><ChevronUp className="w-3 h-3 mr-1" /> Show Less</>
                    ) : (
                      <><ChevronDown className="w-3 h-3 mr-1" /> Show More</>
                    )}
                  </Button>
                </div>
              </div>
            ))}
            {filteredChunks.length === 0 && (
              <div className="text-center py-10 text-zinc-500">
                No chunks match your search.
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
