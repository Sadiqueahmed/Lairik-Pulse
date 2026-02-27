'use client';

import React from 'react';

interface UserProfile {
  id: string;
  did: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  role: 'student' | 'verifier' | 'admin' | 'camp_coordinator';
  documents: string[];
  verified: boolean;
  createdAt: number;
  updatedAt: number;
  publicKey: string;
  metadata?: Record<string, any>;
}

interface PeerProfile {
  did: string;
  name: string;
  avatar?: string;
  role: UserProfile['role'];
  status: 'online' | 'offline' | 'busy';
  lastSeen: number;
  publicKey: string;
  documents: string[];
}

interface ProfileCardProps {
  profile: UserProfile | PeerProfile;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function ProfileCard({ 
  profile, 
  isOwnProfile = false, 
  onEdit, 
  onConnect, 
  onDisconnect 
}: ProfileCardProps) {
  const isPeer = 'status' in profile;
  const status = isPeer ? (profile as PeerProfile).status : 'online';
  
  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getRoleColor = () => {
    switch (profile.role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'verifier': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'camp_coordinator': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getRoleLabel = () => {
    switch (profile.role) {
      case 'admin': return 'ꯑꯗꯃꯤꯟ';
      case 'verifier': return 'ꯌꯦꯡꯕ ꯆꯤꯡꯕ';
      case 'camp_coordinator': return 'ꯀꯣꯑ꯭ꯔꯗꯤꯅꯦꯇꯔ';
      default: return 'ꯍꯥꯡꯕ';
    }
  };

  const getRoleSub = () => {
    switch (profile.role) {
      case 'admin': return 'Admin';
      case 'verifier': return 'Verifier';
      case 'camp_coordinator': return 'Coordinator';
      default: return 'Student';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'online': return 'ꯑꯣꯟꯂꯥꯏꯟ';
      case 'busy': return 'ꯑꯦꯇꯤꯕ';
      case 'offline': return 'ꯑꯣꯐꯂꯥꯏꯟ';
      default: return 'ꯑꯣꯐꯂꯥꯏꯟ';
    }
  };

  const getStatusSub = () => {
    switch (status) {
      case 'online': return 'Online';
      case 'busy': return 'Busy';
      case 'offline': return 'Offline';
      default: return 'Offline';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#d4af37] hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0f4c3a] to-[#d4af37] flex items-center justify-center text-white text-xl font-bold shadow-md">
            {profile.avatar ? (
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              profile.name.charAt(0).toUpperCase()
            )}
          </div>
          {isPeer && (
            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ${getStatusColor()} border-2 border-white`} />
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#0f4c3a]">{profile.name}</h3>
              <p className="text-xs text-[#d4af37]">{getRoleSub()}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor()}`}>
              {getRoleLabel()}
            </span>
          </div>
          
          {'did' in profile && (
            <p className="text-xs text-gray-400 mt-1 font-mono">
              {profile.did.slice(0, 16)}...
            </p>
          )}

          {'bio' in profile && profile.bio && (
            <p className="text-sm text-gray-600 mt-2 italic">{profile.bio}</p>
          )}

          {'location' in profile && profile.location && (
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <svg className="w-4 h-4 mr-1 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {profile.location}
            </div>
          )}

          {'documents' in profile && (
            <div className="mt-3 flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-1 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-bold text-[#0f4c3a]">{profile.documents.length}</span>
              <span className="ml-1 text-xs">ꯄꯨꯜꯄ</span>
              <span className="ml-1 text-xs text-gray-400">(docs)</span>
            </div>
          )}

          {isPeer && (
            <div className="mt-2 text-xs text-gray-400">
              {getStatusLabel()} 
              <span className="text-[#d4af37] ml-1">({getStatusSub()})</span>
              <span className="mx-1">•</span>
              {new Date((profile as PeerProfile).lastSeen).toLocaleTimeString('en-IN')}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex space-x-2">
        {isOwnProfile ? (
          <button
            onClick={onEdit}
            className="flex-1 bg-gradient-to-r from-[#0f4c3a] to-[#1a5f4a] text-white px-4 py-2 rounded-md hover:from-[#0a3d2e] hover:to-[#0f4c3a] transition-all text-sm font-medium shadow-md"
          >
            ꯍꯛꯆꯥꯔꯣꯜ ꯁꯦꯝꯕ
            <span className="block text-xs text-[#d4af37]">Edit Profile</span>
          </button>
        ) : (
          <>
            {status === 'online' ? (
              <button
                onClick={onDisconnect}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-md hover:from-red-700 hover:to-red-800 transition-all text-sm font-medium shadow-md"
              >
                ꯃꯅꯤꯡ ꯊꯥꯒꯠꯄ
                <span className="block text-xs">Disconnect</span>
              </button>
            ) : (
              <button
                onClick={onConnect}
                className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-white px-4 py-2 rounded-md hover:from-[#b8941f] hover:to-[#9a7a1a] transition-all text-sm font-medium shadow-md"
              >
                ꯁꯝꯕ
                <span className="block text-xs">Connect</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
