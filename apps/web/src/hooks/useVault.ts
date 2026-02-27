import { useState, useCallback } from 'react';

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  timestamp: number;
  verified: boolean;
  cid?: string;
}

export interface UseVaultReturn {
  documents: Document[];
  addDocument: (file: File) => void;
  removeDocument: (id: string) => void;
  isLoading: boolean;
}

export function useVault(): UseVaultReturn {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addDocument = useCallback((file: File) => {
    setIsLoading(true);
    
    // Simulate processing
    setTimeout(() => {
      const newDoc: Document = {
        id: Math.random().toString(36).substring(7),
        name: file.name,
        type: file.type,
        size: file.size,
        timestamp: Date.now(),
        verified: false,
      };
      
      setDocuments(prev => [...prev, newDoc]);
      setIsLoading(false);
    }, 500);
  }, []);

  const removeDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  }, []);

  return {
    documents,
    addDocument,
    removeDocument,
    isLoading,
  };
}
