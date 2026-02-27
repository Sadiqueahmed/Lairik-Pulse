export interface UserProfile {
  id: string;
  did: string; // Decentralized Identifier
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  role: 'student' | 'verifier' | 'admin' | 'camp_coordinator';
  documents: string[]; // Document CIDs
  verified: boolean;
  createdAt: number;
  updatedAt: number;
  publicKey: string;
  metadata?: Record<string, any>;
}

export interface ProfileUpdate {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  role?: UserProfile['role'];
  metadata?: Record<string, any>;
}

export interface PeerProfile {
  did: string;
  name: string;
  avatar?: string;
  role: UserProfile['role'];
  status: 'online' | 'offline' | 'busy';
  lastSeen: number;
  publicKey: string;
  documents: string[];
}

export interface ProfileEvent {
  type: 'profile_created' | 'profile_updated' | 'profile_shared' | 'peer_discovered' | 'peer_offline';
  timestamp: number;
  data: UserProfile | PeerProfile | { did: string };
  signature?: string;
}
