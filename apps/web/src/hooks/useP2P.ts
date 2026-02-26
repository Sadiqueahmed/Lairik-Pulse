import { create } from 'zustand';

interface Peer {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  lastSeen: number;
}

interface P2PState {
  isConnected: boolean;
  nodeId: string | null;
  peers: Peer[];
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  addPeer: (peer: Peer) => void;
  removePeer: (id: string) => void;
  updatePeerStatus: (id: string, status: Peer['status']) => void;
}

export const useP2PStore = create<P2PState>((set) => ({
  isConnected: false,
  nodeId: null,
  peers: [],

  connect: async () => {
    // Simulate connection to local Go node
    set({ isConnected: true, nodeId: `node-${crypto.randomUUID().slice(0, 8)}` });
    
    // In real implementation, this would:
    // 1. Connect to local Go node via WebSocket/gRPC
    // 2. Initialize libp2p node
    // 3. Start mDNS/DHT discovery
  },

  disconnect: async () => {
    set({ isConnected: false, nodeId: null, peers: [] });
  },

  addPeer: (peer) =>
    set((state) => ({
      peers: [...state.peers.filter((p) => p.id !== peer.id), peer],
    })),

  removePeer: (id) =>
    set((state) => ({
      peers: state.peers.filter((p) => p.id !== id),
    })),

  updatePeerStatus: (id, status) =>
    set((state) => ({
      peers: state.peers.map((p) =>
        p.id === id ? { ...p, status, lastSeen: Date.now() } : p
      ),
    })),
}));
