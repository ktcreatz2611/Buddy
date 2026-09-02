"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UploadCloud, File, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function UploadDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    setUploading(true);
    setProgress(10);
    // Simulate upload
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setIsOpen(false);
          setFiles([]);
          setProgress(0);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UploadCloud className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Upload files to process for retrieval-augmented generation.
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            "mt-4 p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors text-center cursor-pointer",
            isDragging 
              ? "border-indigo-500 bg-indigo-500/10" 
              : "border-zinc-700 hover:border-zinc-500 bg-zinc-900/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept=".pdf,.docx,.xlsx,.csv,.txt,.md,.json,.png,.jpg,.jpeg"
            onChange={handleFileSelect}
          />
          <UploadCloud className="w-10 h-10 text-zinc-400 mb-4" />
          <p className="text-sm font-medium text-zinc-200">
            Drag and drop your files here, or click to browse
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            Supports PDF, DOCX, XLSX, CSV, TXT, MD, JSON, PNG, JPG up to 50MB
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2 max-h-[150px] overflow-y-auto">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800">
                <div className="flex items-center space-x-2 overflow-hidden">
                  <File className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <span className="text-sm truncate max-w-[300px]">{file.name}</span>
                </div>
                {!uploading && (
                  <Button variant="ghost" size="icon" onClick={() => removeFile(i)} className="h-6 w-6 rounded-full hover:bg-zinc-800">
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {uploading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={files.length === 0 || uploading}>
            {uploading ? "Uploading..." : "Upload Files"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
