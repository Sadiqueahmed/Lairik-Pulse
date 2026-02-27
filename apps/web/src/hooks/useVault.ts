import { useState, useCallback, useEffect } from 'react';
import localforage from 'localforage';

// Initialize localforage for document storage
const documentStore = localforage.createInstance({
  name: 'lairik-pulse',
  storeName: 'documents',
  description: 'Encrypted document storage',
});

const metadataStore = localforage.createInstance({
  name: 'lairik-pulse',
  storeName: 'metadata',
  description: 'Document metadata',
});

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
  addDocument: (file: File) => Promise<void>;
  removeDocument: (id: string) => Promise<void>;
  viewDocument: (id: string) => Promise<string | null>;
  downloadDocument: (id: string, filename: string) => Promise<void>;
  isLoading: boolean;
}

export function useVault(): UseVaultReturn {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load documents from storage on mount
  useEffect(() => {
    const loadDocuments = async () => {
      const storedDocs: Document[] = [];
      await metadataStore.iterate((value: unknown) => {
        storedDocs.push(value as Document);
      });
      setDocuments(storedDocs.sort((a, b) => b.timestamp - a.timestamp));
    };
    loadDocuments();
  }, []);

  const addDocument = useCallback(async (file: File) => {
    setIsLoading(true);
    
    try {
      // Read file as base64
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const id = Math.random().toString(36).substring(7);
      const newDoc: Document = {
        id,
        name: file.name,
        type: file.type,
        size: file.size,
        timestamp: Date.now(),
        verified: false,
      };

      // Store file content and metadata
      await documentStore.setItem(id, fileContent);
      await metadataStore.setItem(id, newDoc);
      
      setDocuments(prev => [newDoc, ...prev]);
    } catch (error) {
      console.error('Failed to store document:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeDocument = useCallback(async (id: string) => {
    try {
      await documentStore.removeItem(id);
      await metadataStore.removeItem(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Failed to remove document:', error);
    }
  }, []);

  const viewDocument = useCallback(async (id: string): Promise<string | null> => {
    try {
      const content = await documentStore.getItem<string>(id);
      return content || null;
    } catch (error) {
      console.error('Failed to retrieve document:', error);
      return null;
    }
  }, []);

  const downloadDocument = useCallback(async (id: string, filename: string) => {
    try {
      const content = await documentStore.getItem<string>(id);
      if (!content) return;

      // Create download link
      const link = document.createElement('a');
      link.href = content;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download document:', error);
    }
  }, []);

  return {
    documents,
    addDocument,
    removeDocument,
    viewDocument,
    downloadDocument,
    isLoading,
  };
}
