import { UploadDialog } from "@/components/documents/upload-dialog";
import { DocumentCard } from "@/components/documents/document-card";
import { SearchPanel } from "@/components/documents/search-panel";

export default function DocumentsPage() {
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Documents</h1>
          <p className="text-zinc-400">Manage and upload documents for your RAG system.</p>
        </div>
        <UploadDialog />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-100">Recent Uploads</h2>
            {/* Filter would go here */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentCard 
              id="doc1"
              filename="q3-financial-report.pdf"
              type="application/pdf"
              size={2450000}
              pages={42}
              status="ready"
              uploadDate={new Date().toISOString()}
              chunks={342}
            />
            <DocumentCard 
              id="doc2"
              filename="employee-handbook.docx"
              type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              size={1200000}
              pages={15}
              status="processing"
              uploadDate={new Date().toISOString()}
            />
            <DocumentCard 
              id="doc3"
              filename="corrupted-file.pdf"
              type="application/pdf"
              size={500}
              pages={1}
              status="error"
              uploadDate={new Date().toISOString()}
            />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <SearchPanel />
        </div>
      </div>
    </div>
  );
}
