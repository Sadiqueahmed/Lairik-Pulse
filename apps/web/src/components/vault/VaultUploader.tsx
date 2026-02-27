'use client';

import { useState, useCallback } from 'react';
import { useVault } from '@/hooks/useVault';

export function VaultUploader() {
  const { documents, addDocument, removeDocument, viewDocument, downloadDocument, isLoading } = useVault();
  const [isDragging, setIsDragging] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<{ id: string; name: string; content: string; type: string } | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        await addDocument(file);
      }
    }
  }, [addDocument]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        await addDocument(file);
      }
    }
  }, [addDocument]);

  const handleView = async (doc: { id: string; name: string; type: string }) => {
    const content = await viewDocument(doc.id);
    if (content) {
      setViewingDoc({ ...doc, content });
    }
  };

  const handleDownload = async (doc: { id: string; name: string }) => {
    await downloadDocument(doc.id, doc.name);
  };

  const closeViewer = () => {
    setViewingDoc(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          manipur-card p-8 text-center transition-all duration-300
          ${isDragging ? 'border-[#d4af37] bg-[#d4af37]/5 scale-[1.02]' : ''}
        `}
      >
        <div className="manipur-icon-circle mx-auto mb-4 animate-pulse-gold">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-[#0f4c3a] mb-2">
          Upload Documents
        </h3>
        <p className="text-[#0f4c3a]/60 text-sm mb-4">
          Drag and drop PDFs or images, or click to browse
        </p>
        
        <label className="manipur-button-primary inline-block cursor-pointer">
          <input
            type="file"
            multiple
            accept=".pdf,image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Select Files
          </span>
        </label>
        
        <div className="mt-4 flex justify-center gap-4 text-xs text-[#0f4c3a]/50">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            PDF
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            Images
          </span>
        </div>
      </div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="manipur-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#0f4c3a] flex items-center gap-2">
              <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Your Documents
              <span className="manipur-badge">{documents.length}</span>
            </h3>
            <span className="text-xs text-[#0f4c3a]/50">Encrypted & Stored Locally</span>
          </div>

          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#0f4c3a]/10 hover:border-[#d4af37]/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0f4c3a]/5 flex items-center justify-center text-[#0f4c3a]">
                    {doc.type === 'application/pdf' ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[#0f4c3a] text-sm truncate max-w-[200px]">
                      {doc.name}
                    </p>
                    <p className="text-xs text-[#0f4c3a]/50">
                      {(doc.size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="manipur-badge text-[10px]">
                    {doc.verified ? '✓ Verified' : 'Pending'}
                  </span>
                  
                  {/* View Button */}
                  <button
                    onClick={() => handleView(doc)}
                    className="p-2 text-[#0f4c3a]/40 hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-all"
                    title="View document"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-2 text-[#0f4c3a]/40 hover:text-[#0f4c3a] hover:bg-[#0f4c3a]/10 rounded-lg transition-all"
                    title="Download document"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="p-2 text-[#0f4c3a]/40 hover:text-[#c41e3a] hover:bg-[#c41e3a]/10 rounded-lg transition-all"
                    title="Delete document"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {documents.length === 0 && !isLoading && (
        <div className="text-center py-12 text-[#0f4c3a]/40">
          <div className="manipur-divider mb-6" />
          <p className="text-sm">No documents yet. Upload your first document above.</p>
          <p className="text-xs mt-2">Documents are encrypted and stored locally on your device.</p>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="manipur-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#0f4c3a]/10">
              <h3 className="font-semibold text-[#0f4c3a] truncate">{viewingDoc.name}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(viewingDoc)}
                  className="manipur-button-primary text-sm py-2 px-4"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button
                  onClick={closeViewer}
                  className="p-2 text-[#0f4c3a]/60 hover:text-[#c41e3a] hover:bg-[#c41e3a]/10 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-[#0f4c3a]/5">
              {viewingDoc.type.startsWith('image/') ? (
                <img 
                  src={viewingDoc.content} 
                  alt={viewingDoc.name}
                  className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                />
              ) : (
                <iframe
                  src={viewingDoc.content}
                  className="w-full h-[70vh] rounded-lg"
                  title={viewingDoc.name}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
