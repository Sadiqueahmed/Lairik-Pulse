'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { VaultUploader } from '../../components/vault/VaultUploader';
import { MeshStatus } from '../../components/mesh/MeshStatus';
import { ZKPVerifier } from '../../components/verify/ZKPVerifier';
import { ProfileCard } from '../../components/profile/ProfileCard';
import { ProfileEditor } from '../../components/profile/ProfileEditor';
import { useProfile } from '../../hooks/useProfile';
import { useMeshService } from '../../services/meshService';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Logo } from '../../components/ui/Logo';

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
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

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  // WebSocket for real-time communication
  const { isConnected, isConnecting } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws',
    onConnect: () => {
      setRealtimeStatus('connected');
    },
    onDisconnect: () => {
      setRealtimeStatus('disconnected');
    },
    onMessage: (message) => {
      console.log('📨 Real-time message:', message);
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

    return () => {
      unsubscribePeerJoined();
      unsubscribeDocumentShared();
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
      await createProfile({
        ...data,
        name: user?.fullName || data.name,
        email: user?.primaryEmailAddress?.emailAddress || data.email,
      });
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

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const onlinePeers = getOnlinePeers();

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9f5] via-[#f0f4f0] to-[#e8ede8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0f4c3a] border-t-[#d4af37] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#0f4c3a] font-medium">ꯂꯣꯒ ꯏꯟ ꯇꯥꯒꯠꯄ...</p>
          <p className="text-sm text-gray-500">Signing in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9f5] via-[#f0f4f0] to-[#e8ede8]">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0f4c3a] rounded-full blur-[150px] opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#d4af37] rounded-full blur-[120px] opacity-10"></div>
      </div>

      {/* Header */}
      <header className="relative bg-gradient-to-r from-[#0f4c3a] via-[#1a5f4a] to-[#0f4c3a] text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="cursor-pointer" onClick={() => router.push('/')}>
              <Logo size="lg" />
            </div>
            
            {/* Right Side */}
            <div className="flex items-center space-x-6">
              {/* Real-time Status */}
              <div className="hidden md:flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/20">
                <div className={`w-3 h-3 rounded-full ${
                  realtimeStatus === 'connected' ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' :
                  realtimeStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                  'bg-red-400'
                }`} />
                <div className="text-sm">
                  <span className="font-semibold">
                    {realtimeStatus === 'connected' ? 'ꯌꯦꯡꯕ' : 
                     realtimeStatus === 'connecting' ? 'ꯁꯝꯕ...' : 
                     'ꯊꯥꯒꯠꯄ'}
                  </span>
                  <span className="text-[#d4af37] text-xs ml-2 font-medium">
                    {realtimeStatus === 'connected' ? '(Connected)' : 
                     realtimeStatus === 'connecting' ? '(Connecting...)' : 
                     '(Disconnected)'}
                  </span>
                </div>
              </div>
              
              {/* User Avatar */}
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full pl-2 pr-4 py-2 border border-white/20">
                {user.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt={user.fullName || 'User'} 
                    className="w-10 h-10 rounded-full border-2 border-[#d4af37] shadow-md"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-full flex items-center justify-center text-[#0f4c3a] font-bold shadow-md">
                    {(user.fullName || user.firstName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold">{user.fullName || user.firstName}</p>
                  <p className="text-xs text-[#d4af37]">{user.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex flex-col items-center"
              >
                <span>ꯂꯣꯒ ꯑꯨꯠ</span>
                <span className="text-xs text-red-200">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="relative bg-white/80 backdrop-blur-md shadow-lg border-b border-[#0f4c3a]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 overflow-x-auto">
            {[
              { id: 'vault', label: 'ꯚꯣꯜꯠ', sub: 'Vault', icon: '📁', color: 'from-[#0f4c3a] to-[#1a5f4a]', border: 'border-[#0f4c3a]' },
              { id: 'mesh', label: 'ꯃꯦꯁ', sub: 'Mesh', icon: '🌐', color: 'from-[#d4af37] to-[#b8941f]', border: 'border-[#d4af37]' },
              { id: 'verify', label: 'ꯌꯦꯡꯕ', sub: 'Verify', icon: '✓', color: 'from-[#c41e3a] to-[#a01830]', border: 'border-[#c41e3a]' },
              { id: 'profile', label: 'ꯄ꯭ꯔꯣꯐꯥꯏꯜ', sub: 'Profile', icon: '👤', color: 'from-[#0f4c3a] to-[#d4af37]', border: 'border-[#0f4c3a]' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group flex flex-col items-center px-8 py-5 text-sm font-semibold transition-all duration-500 min-w-[120px] ${
                  activeTab === tab.id
                    ? `text-[#0f4c3a] border-b-4 ${tab.border} bg-gradient-to-b from-transparent to-[#0f4c3a]/5`
                    : 'text-gray-500 hover:text-[#0f4c3a] hover:bg-[#0f4c3a]/5'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 transition-all duration-500 ${
                  activeTab === tab.id 
                    ? `bg-gradient-to-br ${tab.color} text-white shadow-xl scale-110 ring-4 ring-[#d4af37]/20` 
                    : 'bg-gray-100 group-hover:bg-gradient-to-br group-hover:' + tab.color + ' group-hover:text-white group-hover:shadow-lg'
                }`}>
                  <span className="text-xl">{tab.icon}</span>
                </div>
                <span className="text-xl font-bold">{tab.label}</span>
                <span className="text-xs text-gray-400 group-hover:text-[#d4af37] font-medium uppercase tracking-wider mt-1">{tab.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!profile && !isLoading && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-16 text-center border border-[#d4af37]/30 max-w-3xl mx-auto">
            <div className="w-32 h-32 bg-gradient-to-br from-[#0f4c3a] via-[#1a5f4a] to-[#d4af37] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl ring-8 ring-[#d4af37]/20 animate-pulse">
              <span className="text-7xl">👤</span>
            </div>
            <h2 className="text-4xl font-black text-[#0f4c3a] mb-3">ꯅꯠꯅꯕ ꯄ꯭ꯔꯣꯐꯥꯏꯜ ꯁꯦꯝꯕ</h2>
            <p className="text-[#d4af37] font-semibold mb-6 uppercase tracking-widest text-lg">Create Your Profile</p>
            <p className="text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed text-lg">
              ꯂꯥꯏꯔꯤꯛ-ꯄꯨꯜꯁ ꯁꯤ ꯁꯔꯨꯛ ꯌꯥꯕ ꯅꯠꯅꯕ ꯄ꯭ꯔꯣꯐꯥꯏꯜ ꯑꯃ ꯁꯦꯝꯕ ꯇꯥꯔꯒꯤ
            </p>
            <p className="text-gray-500 mb-10 max-w-md mx-auto">
              Create a profile to start using Lairik Pulse for secure document verification and recovery
            </p>
            <button
              onClick={() => setShowProfileEditor(true)}
              className="group relative bg-gradient-to-r from-[#0f4c3a] to-[#1a5f4a] text-white px-14 py-6 rounded-2xl hover:from-[#0a3d2e] hover:to-[#0f4c3a] transition-all duration-500 font-bold text-xl shadow-2xl hover:shadow-[#0f4c3a]/30 hover:-translate-y-2 overflow-hidden ring-4 ring-[#d4af37]/20"
            >
              <span className="relative z-10 text-3xl mr-3">ꯁꯦꯝꯕ</span>
              <span className="relative z-10 text-[#d4af37]">Create Profile →</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
          </div>
        )}

        {showProfileEditor && (
          <div className="mb-8 max-w-2xl mx-auto">
            <ProfileEditor
              initialData={profile ? {
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                bio: profile.bio,
                location: profile.location,
                role: profile.role,
              } : {
                name: user.fullName || '',
                email: user.primaryEmailAddress?.emailAddress || '',
              }}
              onSave={profile ? handleUpdateProfile : handleCreateProfile}
              onCancel={() => setShowProfileEditor(false)}
            />
          </div>
        )}

        {profile && (
          <div className="space-y-10">
            {activeTab === 'vault' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-[#0f4c3a]/10">
                  <div>
                    <h2 className="text-4xl font-black text-[#0f4c3a] mb-2">ꯗꯣꯀꯨꯃꯦꯟ ꯚꯣꯜꯠ</h2>
                    <p className="text-[#d4af37] font-semibold uppercase tracking-widest text-lg">Document Vault</p>
                  </div>
                  <div className="text-right bg-gradient-to-br from-[#0f4c3a] to-[#1a5f4a] text-white rounded-2xl p-6 shadow-2xl ring-4 ring-[#d4af37]/20">
                    <div className="text-5xl font-black">{profile.documents.length}</div>
                    <div className="text-sm text-[#d4af37] font-medium uppercase tracking-wider mt-1">ꯄꯨꯜꯄ / Documents</div>
                  </div>
                </div>
                <VaultUploader />
              </div>
            )}

            {activeTab === 'mesh' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-[#d4af37]/20">
                  <div>
                    <h2 className="text-4xl font-black text-[#0f4c3a] mb-2">ꯃꯦꯁ ꯁ꯭ꯇꯦꯇꯁ</h2>
                    <p className="text-[#d4af37] font-semibold uppercase tracking-widest text-lg">Mesh Network Status</p>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right bg-gradient-to-br from-[#d4af37] to-[#b8941f] text-white rounded-2xl p-6 shadow-2xl ring-4 ring-white/50">
                      <div className="text-5xl font-black">{onlinePeers.length}</div>
                      <div className="text-sm font-medium uppercase tracking-wider mt-1">ꯄꯤꯔ / Peers</div>
                    </div>
                    <button
                      onClick={() => {
                        discoverPeers();
                        discoverMeshPeers();
                      }}
                      className="group bg-gradient-to-r from-[#0f4c3a] to-[#1a5f4a] text-white px-8 py-6 rounded-2xl hover:from-[#0a3d2e] hover:to-[#0f4c3a] transition-all duration-500 font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 ring-4 ring-[#d4af37]/20"
                    >
                      <span className="text-2xl block mb-1">ꯔꯤꯐ꯭ꯔꯦꯁ</span>
                      <span className="text-xs text-[#d4af37] uppercase tracking-wider">Refresh</span>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <div className="space-y-8">
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-[#c41e3a]/10">
                  <h2 className="text-4xl font-black text-[#0f4c3a] mb-2">ꯗꯣꯀꯨꯃꯦꯟ ꯌꯦꯡꯕ</h2>
                  <p className="text-[#d4af37] font-semibold uppercase tracking-widest text-lg">Document Verification</p>
                </div>
                <ZKPVerifier />
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-[#0f4c3a]/10">
                  <div>
                    <h2 className="text-4xl font-black text-[#0f4c3a] mb-2">ꯄ꯭ꯔꯣꯐꯥꯏꯜ ꯁꯦꯇꯤꯡꯒꯁ</h2>
                    <p className="text-[#d4af37] font-semibold uppercase tracking-widest text-lg">Profile Settings</p>
                  </div>
                  <button
                    onClick={() => setShowProfileEditor(true)}
                    className="group bg-gradient-to-r from-[#0f4c3a] to-[#1a5f4a] text-white px-8 py-4 rounded-2xl hover:from-[#0a3d2e] hover:to-[#0f4c3a] transition-all duration-500 font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 ring-4 ring-[#d4af37]/20"
                  >
                    <span className="text-2xl mr-2">ꯍꯛꯆꯥꯔꯣꯜ ꯁꯦꯝꯕ</span>
                    <span className="text-sm text-[#d4af37] uppercase tracking-wider">Edit Profile</span>
                  </button>
                </div>

                <div className="max-w-md">
                  <ProfileCard 
                    profile={profile} 
                    isOwnProfile={true}
                    onEdit={() => setShowProfileEditor(true)}
                  />
                </div>
                
                <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-10 border border-[#d4af37]/20">
                  <h3 className="text-3xl font-black text-[#0f4c3a] mb-2">ꯑꯦꯛꯇꯤꯚꯤꯇꯤ ꯂꯣꯒ</h3>
                  <p className="text-[#d4af37] font-semibold mb-8 uppercase tracking-widest text-lg">Activity Log</p>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center py-4 border-b border-gray-100">
                      <span className="text-gray-600 font-semibold">DID</span>
                      <span className="font-mono text-gray-900 text-sm bg-gray-100 px-4 py-2 rounded-xl">{profile.did}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-gray-100">
                      <div className="text-gray-600">
                        <span className="font-semibold block text-lg">ꯅꯠꯅꯕ ꯇꯥꯔꯤꯒ</span>
                        <span className="text-sm text-gray-400 uppercase tracking-wider">Created</span>
                      </div>
                      <span className="text-gray-900 font-semibold text-lg">
                        {new Date(profile.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-gray-100">
                      <div className="text-gray-600">
                        <span className="font-semibold block text-lg">ꯍꯥꯟꯅ ꯍꯛꯆꯥꯔꯣꯜ ꯇꯥꯔꯤꯒ</span>
                        <span className="text-sm text-gray-400 uppercase tracking-wider">Last Updated</span>
                      </div>
                      <span className="text-gray-900 font-semibold text-lg">
                        {new Date(profile.updatedAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-4">
                      <div className="text-gray-600">
                        <span className="font-semibold block text-lg">ꯚꯦꯔꯤꯐꯥꯏꯗ</span>
                        <span className="text-sm text-gray-400 uppercase tracking-wider">Verified</span>
                      </div>
                      <span className={profile.verified ? 'text-green-600 font-bold bg-green-100 px-6 py-3 rounded-xl text-lg shadow-md' : 'text-yellow-600 font-bold bg-yellow-100 px-6 py-3 rounded-xl text-lg shadow-md'}>
                        {profile.verified ? '✓ ꯌꯦꯡꯕ (Verified)' : '⏳ ꯇꯥꯛꯂꯕ (Pending)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Real-time Activity Feed */}
      {profile && isConnected && (
        <div className="fixed bottom-8 right-8 w-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-l-4 border-[#d4af37] p-8 z-50 ring-4 ring-[#0f4c3a]/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-[#0f4c3a]">ꯂꯥꯏꯔꯤꯛ ꯑꯦꯛꯇꯤꯚꯤꯇꯤ</h3>
              <p className="text-xs text-[#d4af37] uppercase tracking-widest font-semibold">Live Activity</p>
            </div>
            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-transparent rounded-xl p-4">
              <div className="flex items-center space-x-4">
                <span className="w-4 h-4 bg-blue-400 rounded-full shadow-md"></span>
                <span className="text-gray-700 font-semibold text-base">ꯄꯤꯔ ꯑꯣꯟꯂꯥꯏꯟ</span>
              </div>
              <span className="font-black text-[#0f4c3a] text-2xl">{onlinePeers.length}</span>
            </div>
            <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-transparent rounded-xl p-4">
              <div className="flex items-center space-x-4">
                <span className="w-4 h-4 bg-[#d4af37] rounded-full shadow-md"></span>
                <span className="text-gray-700 font-semibold text-base">ꯗꯣꯀꯨꯃꯦꯟ ꯂꯦꯤꯕ</span>
              </div>
              <span className="font-black text-[#0f4c3a] text-2xl">{profile.documents.length}</span>
            </div>
            <div className="flex items-center space-x-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
              <span className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-md shadow-green-400/50"></span>
              <span className="text-gray-700 font-semibold text-base">ꯃꯦꯁ ꯌꯦꯡꯕ (Mesh Active)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
