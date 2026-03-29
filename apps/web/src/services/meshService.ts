import { useProfile } from '../hooks/useProfile';

interface MeshPeer {
  id: string;
  did: string;
  name: string;
  avatar?: string;
  role: 'student' | 'verifier' | 'admin' | 'camp_coordinator';
  status: 'online' | 'offline' | 'busy';
  lastSeen: number;
  publicKey: string;
  documents: string[];
}

interface MeshDocument {
  cid: string;
  name: string;
  owner: string;
  timestamp: number;
  verified: boolean;
  shared: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class MeshService {
  private static instance: MeshService;
  private peers: Map<string, MeshPeer> = new Map();
  private documents: Map<string, MeshDocument> = new Map();
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();

  private constructor() {}

  static getInstance(): MeshService {
    if (!MeshService.instance) {
      MeshService.instance = new MeshService();
    }
    return MeshService.instance;
  }

  // Event handling
  on(event: string, callback: (data: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.eventListeners.get(event)?.delete(callback);
    };
  }

  private emit(event: string, data: any) {
    this.eventListeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (err) {
        console.error(`Error in event listener for ${event}:`, err);
      }
    });
  }

  // Peer management
  addPeer(peer: MeshPeer) {
    this.peers.set(peer.id, peer);
    this.emit('peer:joined', peer);
    this.emit('peers:updated', Array.from(this.peers.values()));
  }

  removePeer(peerId: string) {
    const peer = this.peers.get(peerId);
    if (peer) {
      this.peers.delete(peerId);
      this.emit('peer:left', peer);
      this.emit('peers:updated', Array.from(this.peers.values()));
    }
  }

  updatePeerStatus(peerId: string, status: MeshPeer['status']) {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.status = status;
      peer.lastSeen = Date.now();
      this.emit('peer:updated', peer);
      this.emit('peers:updated', Array.from(this.peers.values()));
    }
  }

  getPeers(): MeshPeer[] {
    return Array.from(this.peers.values());
  }

  getOnlinePeers(): MeshPeer[] {
    return Array.from(this.peers.values()).filter(p => p.status === 'online');
  }

  // Document management
  addDocument(doc: MeshDocument) {
    this.documents.set(doc.cid, doc);
    this.emit('document:added', doc);
    this.emit('documents:updated', Array.from(this.documents.values()));
  }

  shareDocument(cid: string, targetPeerId?: string) {
    const doc = this.documents.get(cid);
    if (doc) {
      doc.shared = true;
      doc.timestamp = Date.now();
      this.emit('document:shared', { document: doc, targetPeer: targetPeerId });
    }
  }

  verifyDocument(cid: string) {
    const doc = this.documents.get(cid);
    if (doc) {
      doc.verified = true;
      this.emit('document:verified', doc);
      this.emit('documents:updated', Array.from(this.documents.values()));
    }
  }

  getDocuments(): MeshDocument[] {
    return Array.from(this.documents.values());
  }

  getSharedDocuments(): MeshDocument[] {
    return Array.from(this.documents.values()).filter(d => d.shared);
  }

  // Real-time messaging
  sendMessage(peerId: string, message: any) {
    this.emit('message:sent', { peerId, message, timestamp: Date.now() });
    console.log(`Sending message to ${peerId}:`, message);
  }

  broadcastMessage(message: any) {
    this.emit('message:broadcast', { message, timestamp: Date.now() });
    console.log('Broadcasting message:', message);
  }

  // Discovery — fetches real peers from the Go backend API
  async discoverPeers(): Promise<MeshPeer[]> {
    try {
      const response = await fetch(`${API_URL}/p2p/peers`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const peers: MeshPeer[] = (data.peers || []).map((p: any) => ({
        id: p.id,
        did: `did:lairik:${p.id.slice(0, 16)}`,
        name: `Node ${p.id.slice(0, 8)}`,
        role: 'student' as const,
        status: p.connected ? 'online' as const : 'offline' as const,
        lastSeen: Date.now(),
        publicKey: '',
        documents: [],
      }));

      peers.forEach(peer => this.addPeer(peer));
      return peers;
    } catch (err) {
      console.warn('Peer discovery from backend failed:', err);
      // Return whatever we have cached locally — no fake data
      return Array.from(this.peers.values());
    }
  }

  // Sync with remote peer via backend
  async syncWithPeer(peerId: string): Promise<boolean> {
    const peer = this.peers.get(peerId);
    if (!peer || peer.status !== 'online') {
      return false;
    }

    this.emit('sync:started', { peerId, timestamp: Date.now() });

    try {
      // In current architecture, sync happens through GossipSub on the Go side
      // The frontend just needs to trigger a refresh
      const response = await fetch(`${API_URL}/p2p/peers`);
      if (response.ok) {
        this.emit('sync:completed', { peerId, timestamp: Date.now() });
        return true;
      }
    } catch (err) {
      console.error('Sync failed:', err);
    }

    this.emit('sync:completed', { peerId, timestamp: Date.now() });
    return false;
  }

  // Cleanup
  disconnect() {
    this.peers.clear();
    this.documents.clear();
    this.eventListeners.clear();
    this.emit('mesh:disconnected', { timestamp: Date.now() });
  }
}

// React hook for using mesh service
export function useMeshService() {
  const meshService = MeshService.getInstance();
  const { profile, peers: profilePeers } = useProfile();

  return {
    // Peer methods
    getPeers: () => meshService.getPeers(),
    getOnlinePeers: () => meshService.getOnlinePeers(),
    discoverPeers: () => meshService.discoverPeers(),
    syncWithPeer: (peerId: string) => meshService.syncWithPeer(peerId),
    
    // Document methods
    getDocuments: () => meshService.getDocuments(),
    getSharedDocuments: () => meshService.getSharedDocuments(),
    shareDocument: (cid: string, targetPeerId?: string) => 
      meshService.shareDocument(cid, targetPeerId),
    verifyDocument: (cid: string) => meshService.verifyDocument(cid),
    
    // Messaging
    sendMessage: (peerId: string, message: any) => 
      meshService.sendMessage(peerId, message),
    broadcastMessage: (message: any) => meshService.broadcastMessage(message),
    
    // Event subscription
    on: (event: string, callback: (data: any) => void) => 
      meshService.on(event, callback),
    
    // Cleanup
    disconnect: () => meshService.disconnect(),
    
    // Current user
    currentUser: profile,
    meshPeers: profilePeers,
  };
}

export { MeshService };
