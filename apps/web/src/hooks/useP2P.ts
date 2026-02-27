import { useState, useEffect } from 'react';

export interface Peer {
  id: string;
  address: string;
  connected: boolean;
}

export interface UseP2PReturn {
  isConnected: boolean;
  peers: Peer[];
  nodeId: string;
}

export function useP2P(): UseP2PReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [nodeId, setNodeId] = useState('');

  useEffect(() => {
    // Simulate P2P connection
    setTimeout(() => {
      setIsConnected(true);
      setNodeId('12D3KooW' + Math.random().toString(36).substring(2, 15));
      
      // Add mock peers
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
    }, 2000);
  }, []);

  return {
    isConnected,
    peers,
    nodeId,
  };
}
