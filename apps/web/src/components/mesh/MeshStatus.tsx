'use client';

import { useP2P } from '@/hooks/useP2P';

export function MeshStatus() {
  const { isConnected, peers, nodeId, isLoading, error, refreshPeers } = useP2P();

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <div className="manipur-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`manipur-icon-circle ${isConnected ? 'animate-pulse-gold' : ''}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#0f4c3a]">Mesh Network</h3>
              <p className="text-sm text-[#0f4c3a]/60">P2P Discovery Status</p>
            </div>
          </div>
          
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : isLoading
              ? 'bg-amber-100 text-amber-700 border border-amber-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {isLoading ? '⟳ Connecting...' : isConnected ? '● Connected' : '○ Disconnected'}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#0f4c3a]/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[#0f4c3a]">{peers.length}</div>
            <div className="text-xs text-[#0f4c3a]/60">Active Peers</div>
          </div>
          <div className="bg-[#0f4c3a]/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[#d4af37]">mDNS</div>
            <div className="text-xs text-[#0f4c3a]/60">Discovery</div>
          </div>
          <div className="bg-[#0f4c3a]/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[#4682b4]">Offline</div>
            <div className="text-xs text-[#0f4c3a]/60">Mode</div>
          </div>
        </div>

        {/* Node Info */}
        <div className="bg-gradient-to-r from-[#0f4c3a]/5 to-transparent rounded-lg p-4 border border-[#d4af37]/20">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className="text-sm font-medium text-[#0f4c3a]">Your Node ID</span>
          </div>
          <code className="text-xs text-[#0f4c3a]/70 bg-white/50 px-2 py-1 rounded block break-all">
            {nodeId || 'Connecting...'}
          </code>
        </div>

        {/* Refresh Button */}
        <button
          onClick={refreshPeers}
          disabled={isLoading}
          className="mt-4 w-full py-2 px-4 bg-[#0f4c3a]/10 hover:bg-[#0f4c3a]/20 text-[#0f4c3a] rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isLoading ? 'Refreshing...' : 'Refresh Peers'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error.message}
            </p>
            <p className="text-xs text-red-500 mt-1">
              Using demo mode - Go backend not running
            </p>
          </div>
        )}
      </div>

      {/* Peers List */}
      {peers.length > 0 && (
        <div className="manipur-card p-6">
          <h3 className="text-lg font-semibold text-[#0f4c3a] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Connected Peers
            <span className="manipur-badge">{peers.length}</span>
          </h3>

          <div className="space-y-2">
            {peers.map((peer) => (
              <div
                key={peer.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#0f4c3a]/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37]/30 to-[#d4af37]/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-[#0f4c3a]">
                      {peer.id.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0f4c3a]">
                      {peer.id.slice(0, 12)}...
                    </p>
                    <p className="text-xs text-[#0f4c3a]/50">
                      {peer.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {peers.length === 0 && !isLoading && (
        <div className="manipur-card p-8 text-center">
          <div className="manipur-icon-circle mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-[#0f4c3a] mb-2">No Peers Connected</h4>
          <p className="text-sm text-[#0f4c3a]/60 max-w-md mx-auto">
            Your device will automatically discover other Lairik-Pulse nodes on the local network using mDNS. 
            Make sure other devices are on the same Wi-Fi network.
          </p>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-gradient-to-r from-[#0f4c3a]/10 to-[#d4af37]/10 rounded-lg p-4 border border-[#d4af37]/20">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-[#d4af37] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-medium text-[#0f4c3a] mb-1">How Mesh Networking Works</h4>
            <p className="text-sm text-[#0f4c3a]/70">
              Devices communicate directly without internet. Perfect for disaster recovery areas 
              where connectivity is limited. Your documents sync securely across the mesh.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
