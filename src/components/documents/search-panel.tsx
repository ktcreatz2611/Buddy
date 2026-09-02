"use client";

import { useState } from "react";
import { Search, Copy, Check } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [numResults, setNumResults] = useState(5);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mock results
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    // Simulate search
    setTimeout(() => {
      setResults([
        {
          id: 'res1',
          document: 'q3-financial-report.pdf',
          page: 12,
          section: 'Revenue Growth',
          content: 'The third quarter saw a remarkable increase in enterprise revenue, up 24% year-over-year. This was primarily driven by the adoption of our new AI-powered tools across our existing customer base, as well as significant wins in the financial sector.',
          score: 92
        },
        {
          id: 'res2',
          document: 'q3-financial-report.pdf',
          page: 14,
          section: 'Risk Factors',
          content: 'While revenue growth remains strong, increased infrastructure costs related to GPU provisioning for AI workloads may impact margins in the upcoming quarters if utilization rates are not optimized.',
          score: 78
        }
      ].slice(0, numResults));
      setIsSearching(false);
    }, 800);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card className="bg-zinc-950/50 border-zinc-800 h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-zinc-800/50">
        <CardTitle className="text-lg flex items-center text-zinc-100">
          <Search className="w-5 h-5 mr-2 text-indigo-400" />
          Test RAG Retrieval
        </CardTitle>
      </CardHeader>
      
      <div className="p-4 border-b border-zinc-800/50 bg-zinc-900/30">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search-query" className="text-zinc-300">Semantic Search Query</Label>
            <div className="flex space-x-2">
              <Input
                id="search-query"
                placeholder="e.g., What was the revenue growth in Q3?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-zinc-100"
              />
              <Button type="submit" disabled={isSearching || !query.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Search
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <Label className="text-zinc-400 font-normal">Results limit: {numResults}</Label>
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={numResults} 
              onChange={(e) => setNumResults(parseInt(e.target.value))}
              className="w-1/2 accent-indigo-500"
            />
          </div>
        </form>
      </div>

      <ScrollArea className="flex-1 p-4">
        {isSearching ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.id} className="bg-zinc-900 border border-zinc-800 rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-indigo-400 font-medium truncate pr-2" title={result.document}>
                    {result.document} (P. {result.page})
                  </div>
                  <div className="flex items-center text-xs text-zinc-400 min-w-fit">
                    <span className="mr-2">{result.score}% Match</span>
                  </div>
                </div>
                <Progress value={result.score} className="h-1 mb-2 bg-zinc-800" indicatorClassName="bg-indigo-500" />
                <p className="text-sm text-zinc-300 mb-3">{result.content}</p>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-800">
                  <span className="text-xs text-zinc-500">{result.section}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs text-zinc-400 hover:text-zinc-100"
                    onClick={() => copyToClipboard(result.id, result.content)}
                  >
                    {copiedId === result.id ? (
                      <><Check className="w-3 h-3 mr-1 text-green-500" /> Copied</>
                    ) : (
                      <><Copy className="w-3 h-3 mr-1" /> Use in Chat</>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : query && !isSearching ? (
          <div className="text-center py-10 text-zinc-500">
            No results found.
          </div>
        ) : (
          <div className="text-center py-10 text-zinc-600 text-sm">
            Enter a query to test semantic search against your uploaded documents.
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
