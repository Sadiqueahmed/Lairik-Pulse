'use client';

import { useP2PStore } from '@/hooks/useP2P';

export function MeshStatus() {
  const { isConnected, peers, nodeId, connect, disconnect } = useP2PStore();

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Mesh Network Status</h3>
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-lairik-success animate-pulse' : 'bg-lairik-error'
              }`}
            />
            <span className="text-sm text-slate-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Node ID</p>
            <p className="font-mono text-sm truncate">
              {nodeId || 'Not initialized'}
            </p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Connected Peers</p>
            <p className="text-2xl font-bold text-lairik-accent">
              {peers.length}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {!isConnected ? (
            <button
              onClick={connect}
              className="flex-1 bg-lairik-success hover:bg-lairik-success/80 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Join Mesh Network
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="flex-1 bg-lairik-error hover:bg-lairik-error/80 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Leave Network
            </button>
          )}
        </div>
      </div>

      {peers.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Connected Peers</h3>
          <div className="space-y-2">
            {peers.map((peer) => (
              <div
                key={peer.id}
                className="flex items-center justify-between bg-slate-700 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-lairik-primary/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-lairik-accent"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{peer.name}</p>
                    <p className="text-xs text-slate-400 font-mono">
                      {peer.id.slice(0, 16)}...
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    peer.status === 'active'
                      ? 'bg-lairik-success/20 text-lairik-success'
                      : 'bg-slate-600 text-slate-400'
                  }`}
                >
                  {peer.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h4 className="font-medium mb-2 text-lairik-accent">How Mesh Works</h4>
        <p className="text-sm text-slate-400 leading-relaxed">
          Lairik-Pulse creates a peer-to-peer mesh network using libp2p. When you join,
          your device becomes a node that can discover and communicate with nearby devices
          even without internet. Documents can be shared directly between peers or
          propagated through the mesh using GossipSub protocol.
        </p>
      </div>
    </div>
  );
}
