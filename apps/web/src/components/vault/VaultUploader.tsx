'use client';

import { useState, useCallback } from 'react';
import { useVaultStore } from '@/hooks/useVault';

export function VaultUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const { documents, addDocument, removeDocument } = useVaultStore();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          addDocument({
            id: crypto.randomUUID(),
            name: file.name,
            type: file.type,
            size: file.size,
            content: event.target?.result as string,
            timestamp: Date.now(),
            cid: null,
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }, [addDocument]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        addDocument({
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          content: event.target?.result as string,
          timestamp: Date.now(),
          cid: null,
        });
      };
      reader.readAsDataURL(file);
    });
  }, [addDocument]);

  return (
    <div className="space-y-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging
            ? 'border-lairik-accent bg-lairik-accent/10'
            : 'border-slate-600 hover:border-slate-500'
        }`}
      >
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-lg font-medium text-slate-300 mb-2">
          Drop your documents here
        </p>
        <p className="text-sm text-slate-400 mb-4">
          PDFs and images supported. Files are encrypted locally.
        </p>
        <label className="inline-flex items-center px-4 py-2 bg-lairik-primary hover:bg-lairik-secondary rounded-lg cursor-pointer transition-colors">
          <span>Select Files</span>
          <input
            type="file"
            className="hidden"
            accept=".pdf,image/*"
            multiple
            onChange={handleFileInput}
          />
        </label>
      </div>

      {documents.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Stored Documents</h3>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between bg-slate-700 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-lairik-primary/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-lairik-accent"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-slate-400">
                      {(doc.size / 1024).toFixed(1)} KB •{' '}
                      {new Date(doc.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.cid ? (
                    <span className="text-xs bg-lairik-success/20 text-lairik-success px-2 py-1 rounded">
                      IPFS: {doc.cid.slice(0, 8)}...
                    </span>
                  ) : (
                    <span className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded">
                      Local Only
                    </span>
                  )}
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
