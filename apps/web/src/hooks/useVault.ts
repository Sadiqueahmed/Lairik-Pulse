import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  timestamp: number;
  cid: string | null;
}

interface VaultState {
  documents: Document[];
  addDocument: (doc: Document) => void;
  removeDocument: (id: string) => void;
  updateDocumentCid: (id: string, cid: string) => void;
  getDocumentById: (id: string) => Document | undefined;
}

export const useVaultStore = create<VaultState>()(
  persist(
    (set, get) => ({
      documents: [],
      addDocument: (doc) =>
        set((state) => ({
          documents: [...state.documents, doc],
        })),
      removeDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),
      updateDocumentCid: (id, cid) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, cid } : d
          ),
        })),
      getDocumentById: (id) => get().documents.find((d) => d.id === id),
    }),
    {
      name: 'lairik-vault',
    }
  )
);
