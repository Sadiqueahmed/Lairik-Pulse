/**
 * Shared TypeScript types for Lairik-Pulse
 * These types are shared between frontend and backend
 */

// Document types
export interface Document {
  id: string;
  name: string;
  type: 'degree' | 'identity' | 'certificate' | 'other';
  contentHash: string;
  encryptedData: string;
  ownerId: string;
  createdAt: number;
  metadata: DocumentMetadata;
  ipfsCid?: string;
}

export interface DocumentMetadata {
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  region?: string;
  documentType?: string;
  [key: string]: any;
}

// ZKP types
export interface ZKProof {
  proofType: 'degree_verification' | 'identity_proof';
  proofData: Uint8Array;
  publicInputs: string[];
  verified: boolean;
  timestamp: number;
}

export interface ProofRequest {
  documentId: string;
  proofType: 'degree_verification' | 'identity_proof';
  publicInputs: string[];
}

// P2P types
export interface PeerInfo {
  id: string;
  addresses: string[];
  protocols: string[];
  connected: boolean;
  lastSeen: number;
  region?: string;
}

export interface MeshMessage {
  id: string;
  from: string;
  to?: string;
  type: 'broadcast' | 'direct';
  content: string;
  timestamp: number;
  signature: string;
}

// API types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  p2pConnected: boolean;
  ipfsConnected: boolean;
  peersCount: number;
  timestamp: number;
}
