import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

import { Peer, Verification, usePulseStore } from '../store/pulseStore';

export interface UseP2PReturn {
  isConnected: boolean;
  peers: Peer[];
  nodeId: string;
  isLoading: boolean;
  error: Error | null;
  refreshPeers: () => void;
  verifications: Verification[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

export function useP2P(): UseP2PReturn {
  const { peers, setPeers, verifications, addVerification, setBackendOnline } = usePulseStore();
  
  const [isConnected, setIsConnected] = useState(false);
  const [nodeId, setNodeId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch initial P2P status via REST API — NO MOCK FALLBACK
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/p2p/status`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      setIsConnected(data.connected);
      setNodeId(data.node_id);
      if (data.peers) {
        setPeers(data.peers);
      }
      setError(null);
      setBackendOnline(true);
    } catch (err) {
      console.error('Failed to fetch P2P status:', err);
      setError(err instanceof Error ? err : new Error('Failed to connect to P2P node'));
      // NO mock data injection — show the real disconnected state
      setIsConnected(false);
      setNodeId('');
      setPeers([]);
      setBackendOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, [setPeers, setBackendOnline]);

  // WebSocket for real-time updates
  const { lastMessage } = useWebSocket({
    url: `${WS_URL}/p2p/ws`,
    onMessage: (message) => {
      if (message.type === 'status') {
        setIsConnected(message.payload.connected);
        setNodeId(message.payload.node_id);
        setBackendOnline(true);
      } else if (message.type === 'peers') {
        setPeers(message.payload.peers || []);
      } else if (message.type === 'verification_received') {
        try {
          const parsed = JSON.parse(message.payload);
          addVerification({
              ...parsed,
              timestamp: message.timestamp ? message.timestamp * 1000 : Date.now()
          });
        } catch (e) {
          console.error("Failed to parse verification message:", e);
        }
      } else if (message.type === 'peer_joined') {
          console.log(`New P2P peer joined: ${message.payload.peer_id}`);
      } else if (message.type === 'document_uploaded') {
          console.log(`Mesh broadcast: Document finalized ${message.payload.document_id}`);
      }
    },
    onConnect: () => {
      console.log('P2P WebSocket connected');
      setBackendOnline(true);
    },
    onDisconnect: (wasClean, attempts) => {
      console.log(`P2P WebSocket disconnected (clean: ${wasClean}, attempts: ${attempts})`);
      // Only show 'Backend Not Running' to users after 3 consecutive ping/heartbeat failures
      if (attempts >= 3 || wasClean) {
        setBackendOnline(false);
      }
    },
  });

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Refresh peers function
  const refreshPeers = useCallback(async () => {
    setIsLoading(true);
    await fetchStatus();
  }, [fetchStatus]);

  return {
    isConnected,
    peers,
    nodeId,
    isLoading,
    error,
    refreshPeers,
    verifications,
  };
}
