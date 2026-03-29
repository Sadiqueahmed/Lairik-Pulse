import { create } from 'zustand';
import { Document } from '../hooks/useVault'; // types only

export interface Verification {
  proof_hash: string;
  document_id: string;
  type: string;
  timestamp: number;
}

export interface Peer {
  id: string;
  connected: boolean;
  address?: string;
}

interface PulseState {
  // P2P State
  peers: Peer[];
  setPeers: (peers: Peer[]) => void;
  verifications: Verification[];
  addVerification: (v: Verification) => void;
  
  // Vault State
  documents: Document[];
  setDocuments: (docs: Document[] | ((prev: Document[]) => Document[])) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  syncPending: number;
  setSyncPending: (v: number | ((prev: number) => number)) => void;

  // Connectivity
  backendOnline: boolean;
  setBackendOnline: (v: boolean) => void;
}

export const usePulseStore = create<PulseState>((set) => ({
  peers: [],
  setPeers: (peers) => set({ peers }),
  verifications: [],
  addVerification: (v) => set((state) => {
    // avoid duplicates
    if (state.verifications.some(existing => existing.proof_hash === v.proof_hash)) return state;
    return { verifications: [v, ...state.verifications].slice(0, 50) }; // keeping last 50
  }),
  
  documents: [],
  setDocuments: (docs) => set((state) => ({
    documents: typeof docs === 'function' ? docs(state.documents) : docs
  })),
  isLoading: false,
  setIsLoading: (v) => set({ isLoading: v }),
  syncPending: 0,
  setSyncPending: (v) => set((state) => ({
    syncPending: typeof v === 'function' ? v(state.syncPending) : v
  })),

  // Backend connectivity — false until proven online
  backendOnline: false,
  setBackendOnline: (v) => set({ backendOnline: v }),
}));
