import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

export interface Peer {
  id: string;
  address: string;
  connected: boolean;
}

export interface UseP2PReturn {
  isConnected: boolean;
  peers: Peer[];
  nodeId: string;
  isLoading: boolean;
  error: Error | null;
  refreshPeers: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

export function useP2P(): UseP2PReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [nodeId, setNodeId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch initial P2P status via REST API
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
    } catch (err) {
      console.error('Failed to fetch P2P status:', err);
      setError(err instanceof Error ? err : new Error('Failed to connect to P2P node'));
      // Fallback to mock data for demo if backend is not running
      setIsConnected(true);
      setNodeId('12D3KooW' + Math.random().toString(36).substring(2, 15));
      setPeers([
        {
          id: '12D3KooWMockPeer1',
          address: '/ip4/192.168.1.101/tcp/4001',
          connected: true,
        },
        {
          id: '12D3KooWMockPeer2',
          address: '/ip4/192.168.1.102/tcp/4001',
          connected: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // WebSocket for real-time updates
  const { lastMessage } = useWebSocket({
    url: `${WS_URL}/p2p/ws`,
    onMessage: (message) => {
      if (message.type === 'status') {
        setIsConnected(message.payload.connected);
        setNodeId(message.payload.node_id);
      } else if (message.type === 'peers') {
        setPeers(message.payload.peers || []);
      }
    },
    onConnect: () => {
      console.log('P2P WebSocket connected');
    },
    onDisconnect: () => {
      console.log('P2P WebSocket disconnected');
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
  };
}
