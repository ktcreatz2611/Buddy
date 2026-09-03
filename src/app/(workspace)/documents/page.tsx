import { UploadDialog } from "@/components/documents/upload-dialog";
import { DocumentCard } from "@/components/documents/document-card";
import { SearchPanel } from "@/components/documents/search-panel";

export default function DocumentsPage() {
  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-100 p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
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
            <div className="col-span-full py-12 text-center border border-dashed border-zinc-800 rounded-lg">
              <p className="text-zinc-500">No documents uploaded yet.</p>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <SearchPanel />
        </div>
      </div>
    </div>
  );
}
