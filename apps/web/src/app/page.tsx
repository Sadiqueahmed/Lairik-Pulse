'use client';

import React, { useState, useEffect } from 'react';
import { VaultUploader } from '../components/vault/VaultUploader';
import { MeshStatus } from '../components/mesh/MeshStatus';
import { ZKPVerifier } from '../components/verify/ZKPVerifier';
import { ProfileCard } from '../components/profile/ProfileCard';
import { ProfileEditor } from '../components/profile/ProfileEditor';
import { useProfile } from '../hooks/useProfile';
import { useMeshService } from '../services/meshService';
import { useWebSocket } from '../hooks/useWebSocket';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'vault' | 'mesh' | 'verify' | 'profile'>('vault');
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  
  const { 
    profile, 
    isLoading, 
    isOnline, 
    createProfile, 
    updateProfile, 
    peers,
    discoverPeers 
  } = useProfile();
  
  const { 
    getOnlinePeers, 
    on, 
    discoverPeers: discoverMeshPeers 
  } = useMeshService();

  // WebSocket for real-time communication
  const { isConnected, isConnecting, sendMessage } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws',
    onConnect: () => {
      setRealtimeStatus('connected');
      console.log('🔗 Real-time connection established');
    },
    onDisconnect: () => {
      setRealtimeStatus('disconnected');
      console.log('🔌 Real-time connection lost');
    },
    onMessage: (message) => {
      console.log('📨 Real-time message received:', message);
      // Handle different message types
      switch (message.type) {
        case 'peer:joined':
        case 'peer:left':
        case 'document:shared':
        case 'document:verified':
          // These will be handled by mesh service listeners
          break;
      }
    },
  });

  // Subscribe to mesh events
  useEffect(() => {
    const unsubscribePeerJoined = on('peer:joined', (peer) => {
      console.log('👋 New peer joined:', peer.name);
    });
    
    const unsubscribeDocumentShared = on('document:shared', ({ document }) => {
      console.log('📄 Document shared:', document.name);
    });
    
    const unsubscribeDocumentVerified = on('document:verified', (document) => {
      console.log('✅ Document verified:', document.name);
    });

    return () => {
      unsubscribePeerJoined();
      unsubscribeDocumentShared();
      unsubscribeDocumentVerified();
    };
  }, [on]);

  // Auto-discover peers when online
  useEffect(() => {
    if (isOnline && isConnected) {
      discoverPeers();
      discoverMeshPeers();
    }
  }, [isOnline, isConnected, discoverPeers, discoverMeshPeers]);

  const handleCreateProfile = async (data: any) => {
    try {
      await createProfile(data);
      setShowProfileEditor(false);
    } catch (error) {
      console.error('Failed to create profile:', error);
    }
  };

  const handleUpdateProfile = async (data: any) => {
    try {
      await updateProfile(data);
      setShowProfileEditor(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const onlinePeers = getOnlinePeers();

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f8f9f5] via-[#f0f4f0] to-[#e8ede8]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0f4c3a] via-[#1a5f4a] to-[#0f4c3a] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#d4af37] rounded-full flex items-center justify-center">
                <span className="text-[#0f4c3a] font-bold text-lg">ꯂ</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">ꯂꯥꯏꯔꯤꯛ-ꯄꯨꯜꯁ</h1>
                <p className="text-xs text-[#d4af37]">Lairik Pulse</p>
              </div>
            </div>
            
            {/* Real-time Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  realtimeStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                  realtimeStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                  'bg-red-400'
                }`} />
                <span className="text-sm">
                  {realtimeStatus === 'connected' ? 'ꯌꯦꯡꯕ' : 
                   realtimeStatus === 'connecting' ? 'ꯁꯝꯕ...' : 
                   'ꯊꯥꯒꯠꯄ'}
                  <span className="text-xs text-[#d4af37] ml-1">
                    {realtimeStatus === 'connected' ? '(Connected)' : 
                     realtimeStatus === 'connecting' ? '(Connecting...)' : 
                     '(Disconnected)'}
                  </span>
                </span>
              </div>
              
              {profile && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[#d4af37] rounded-full flex items-center justify-center text-[#0f4c3a] font-bold text-sm">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm hidden sm:block">{profile.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-[#0f4c3a]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {[
              { id: 'vault', label: 'ꯚꯣꯜꯠ', sub: 'Vault', icon: '📁' },
              { id: 'mesh', label: 'ꯃꯦꯁ', sub: 'Mesh', icon: '🌐' },
              { id: 'verify', label: 'ꯌꯦꯡꯕ', sub: 'Verify', icon: '✓' },
              { id: 'profile', label: 'ꯄ꯭ꯔꯣꯐꯥꯏꯜ', sub: 'Profile', icon: '👤' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#0f4c3a] border-b-2 border-[#0f4c3a] bg-[#0f4c3a]/5'
                    : 'text-gray-600 hover:text-[#0f4c3a] hover:bg-[#0f4c3a]/5'
                }`}
              >
                <span className="text-lg mb-0.5">{tab.icon}</span>
                <span className="text-base font-bold">{tab.label}</span>
                <span className="text-xs text-gray-500">{tab.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!profile && !isLoading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center border-t-4 border-[#d4af37]">
            <div className="w-20 h-20 bg-[#0f4c3a]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">👤</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0f4c3a] mb-2">ꯅꯠꯅꯕ ꯄ꯭ꯔꯣꯐꯥꯏꯜ ꯁꯦꯝꯕ</h2>
            <p className="text-sm text-[#d4af37] mb-1">Create Profile</p>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              ꯂꯥꯏꯔꯤꯛ-ꯄꯨꯜꯁ ꯁꯤ ꯁꯔꯨꯛ ꯌꯥꯕ ꯅꯠꯅꯕ ꯄ꯭ꯔꯣꯐꯥꯏꯜ ꯑꯃ ꯁꯦꯝꯕ ꯇꯥꯔꯒꯤ
              <br />
              <span className="text-sm text-gray-500">Create a profile to start using Lairik Pulse</span>
            </p>
            <button
              onClick={() => setShowProfileEditor(true)}
              className="bg-gradient-to-r from-[#0f4c3a] to-[#1a5f4a] text-white px-8 py-3 rounded-md hover:from-[#0a3d2e] hover:to-[#0f4c3a] transition-all font-medium shadow-lg"
            >
              ꯁꯦꯝꯕ <span className="text-[#d4af37] ml-2">Create</span>
            </button>
          </div>
        )}

        {showProfileEditor && (
          <div className="mb-6">
            <ProfileEditor
              initialData={profile || undefined}
              onSave={profile ? handleUpdateProfile : handleCreateProfile}
              onCancel={() => setShowProfileEditor(false)}
            />
          </div>
        )}

        {profile && (
          <>
            {activeTab === 'vault' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-[#d4af37] pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#0f4c3a]">ꯗꯣꯀꯨꯃꯦꯟ ꯚꯣꯜꯠ</h2>
                    <p className="text-sm text-[#d4af37]">Document Vault</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#0f4c3a]">{profile.documents.length}</div>
                    <div className="text-xs text-gray-600">ꯄꯨꯜꯄ / Documents</div>
                  </div>
                </div>
                <VaultUploader />
              </div>
            )}

            {activeTab === 'mesh' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-[#d4af37] pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#0f4c3a]">ꯃꯦꯁ ꯁ꯭ꯇꯦꯇꯁ</h2>
                    <p className="text-sm text-[#d4af37]">Mesh Status</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#0f4c3a]">{onlinePeers.length}</div>
                      <div className="text-xs text-gray-600">ꯄꯤꯔ / Peers</div>
                    </div>
                    <button
                      onClick={() => {
                        discoverPeers();
                        discoverMeshPeers();
                      }}
                      className="bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-white px-4 py-2 rounded-md hover:from-[#b8941f] hover:to-[#9a7a1a] transition-all text-sm font-medium shadow-md"
                    >
                      ꯔꯤꯐ꯭ꯔꯦꯁ
                      <span className="block text-xs">Refresh</span>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ProfileCard 
                    profile={profile} 
                    isOwnProfile={true}
                    onEdit={() => setShowProfileEditor(true)}
                  />
                  
                  {onlinePeers.map((peer) => (
                    <ProfileCard
                      key={peer.did}
                      profile={peer}
                      onConnect={() => console.log('Connecting to', peer.did)}
                      onDisconnect={() => console.log('Disconnecting from', peer.did)}
                    />
                  ))}
                </div>
                
                <MeshStatus />
              </div>
            )}

            {activeTab === 'verify' && (
              <div className="space-y-6">
                <div className="border-b-2 border-[#d4af37] pb-4">
                  <h2 className="text-2xl font-bold text-[#0f4c3a]">ꯗꯣꯀꯨꯃꯦꯟ ꯌꯦꯡꯕ</h2>
                  <p className="text-sm text-[#d4af37]">Document Verification</p>
                </div>
                <ZKPVerifier />
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-[#d4af37] pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#0f4c3a]">ꯄ꯭ꯔꯣꯐꯥꯏꯜ ꯁꯦꯇꯤꯡꯒꯁ</h2>
                    <p className="text-sm text-[#d4af37]">Profile Settings</p>
                  </div>
                  <button
                    onClick={() => setShowProfileEditor(true)}
                    className="bg-gradient-to-r from-[#0f4c3a] to-[#1a5f4a] text-white px-4 py-2 rounded-md hover:from-[#0a3d2e] hover:to-[#0f4c3a] transition-all text-sm font-medium shadow-md"
                  >
                    ꯍꯛꯆꯥꯔꯣꯜ ꯁꯦꯝꯕ
                    <span className="block text-xs">Edit</span>
                  </button>
                </div>

                <div className="max-w-md">
                  <ProfileCard 
                    profile={profile} 
                    isOwnProfile={true}
                    onEdit={() => setShowProfileEditor(true)}
                  />
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#d4af37]">
                  <h3 className="text-lg font-bold text-[#0f4c3a] mb-4">ꯑꯦꯛꯇꯤꯚꯤꯇꯤ ꯂꯣꯒ</h3>
                  <p className="text-sm text-[#d4af37] mb-4">Activity Log</p>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">DID</span>
                      <span className="font-mono text-gray-900 text-xs">{profile.did}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">
                        ꯅꯠꯅꯕ ꯇꯥꯔꯤꯒ
                        <span className="block text-xs text-gray-400">Created</span>
                      </span>
                      <span className="text-gray-900">
                        {new Date(profile.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">
                        ꯍꯥꯟꯅ ꯍꯛꯆꯥꯔꯣꯜ ꯇꯥꯔꯤꯒ
                        <span className="block text-xs text-gray-400">Last Updated</span>
                      </span>
                      <span className="text-gray-900">
                        {new Date(profile.updatedAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">
                        ꯚꯦꯔꯤꯐꯥꯏꯗ
                        <span className="block text-xs text-gray-400">Verified</span>
                      </span>
                      <span className={profile.verified ? 'text-green-600 font-bold' : 'text-yellow-600'}>
                        {profile.verified ? '✓ ꯌꯦꯡꯕ (Verified)' : '⏳ ꯇꯥꯛꯂꯕ (Pending)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Real-time Activity Feed */}
      {profile && isConnected && (
        <div className="fixed bottom-4 right-4 w-72 bg-white rounded-lg shadow-lg border-l-4 border-[#d4af37] p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0f4c3a]">ꯂꯥꯏꯔꯤꯛ ꯑꯦꯛꯇꯤꯚꯤꯇꯤ</h3>
              <p className="text-xs text-[#d4af37]">Live Activity</p>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full" />
                <span className="text-gray-600">ꯄꯤꯔ ꯑꯣꯟꯂꯥꯏꯟ</span>
              </div>
              <span className="font-bold text-[#0f4c3a]">{onlinePeers.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-[#d4af37] rounded-full" />
                <span className="text-gray-600">ꯗꯣꯀꯨꯃꯦꯟ ꯂꯦꯤꯕ</span>
              </div>
              <span className="font-bold text-[#0f4c3a]">{profile.documents.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-gray-600">ꯃꯦꯁ ꯌꯦꯡꯕ (Mesh Active)</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
