'use client';

import { useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';

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

interface ProfileUpdate {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  role?: UserProfile['role'];
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

const PROFILE_KEY = 'lairik_profile';
const PEERS_KEY = 'lairik_peers';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [peers, setPeers] = useState<PeerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  // Load profile from local storage
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const stored = await localforage.getItem<UserProfile>(PROFILE_KEY);
        if (stored) {
          setProfile(stored);
          setIsOnline(true);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Create new profile
  const createProfile = useCallback(async (data: Omit<UserProfile, 'id' | 'did' | 'createdAt' | 'updatedAt' | 'publicKey'>) => {
    try {
      const id = crypto.randomUUID();
      const did = `did:lairik:${id}`;
      const keyPair = await generateKeyPair();
      
      const newProfile: UserProfile = {
        ...data,
        id,
        did,
        publicKey: keyPair.publicKey,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        documents: [],
        verified: false,
      };

      await localforage.setItem(PROFILE_KEY, newProfile);
      setProfile(newProfile);
      setIsOnline(true);
      
      // Broadcast profile creation to mesh
      broadcastProfileEvent('profile_created', newProfile);
      
      return newProfile;
    } catch (error) {
      console.error('Failed to create profile:', error);
      throw error;
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates: ProfileUpdate) => {
    if (!profile) return;

    try {
      const updated: UserProfile = {
        ...profile,
        ...updates,
        updatedAt: Date.now(),
      };

      await localforage.setItem(PROFILE_KEY, updated);
      setProfile(updated);
      
      // Broadcast update to mesh
      broadcastProfileEvent('profile_updated', updated);
      
      return updated;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }, [profile]);

  // Add document to profile
  const addDocument = useCallback(async (cid: string) => {
    if (!profile) return;

    try {
      const updated: UserProfile = {
        ...profile,
        documents: [...profile.documents, cid],
        updatedAt: Date.now(),
      };

      await localforage.setItem(PROFILE_KEY, updated);
      setProfile(updated);
      
      return updated;
    } catch (error) {
      console.error('Failed to add document:', error);
      throw error;
    }
  }, [profile]);

  // Delete profile
  const deleteProfile = useCallback(async () => {
    try {
      await localforage.removeItem(PROFILE_KEY);
      setProfile(null);
      setIsOnline(false);
    } catch (error) {
      console.error('Failed to delete profile:', error);
      throw error;
    }
  }, []);

  // Discover peers in mesh
  const discoverPeers = useCallback(async () => {
    try {
      // In real implementation, this would query the P2P mesh
      // For now, simulate with local storage
      const storedPeers = await localforage.getItem<PeerProfile[]>(PEERS_KEY) || [];
      setPeers(storedPeers);
      return storedPeers;
    } catch (error) {
      console.error('Failed to discover peers:', error);
      return [];
    }
  }, []);

  // Connect to peer
  const connectToPeer = useCallback(async (did: string) => {
    try {
      // In real implementation, this would establish WebRTC connection
      console.log('Connecting to peer:', did);
      
      // Simulate peer connection
      const peer: PeerProfile = {
        did,
        name: `Peer ${did.slice(-8)}`,
        role: 'student',
        status: 'online',
        lastSeen: Date.now(),
        publicKey: '',
        documents: [],
      };
      
      const updatedPeers = [...peers, peer];
      await localforage.setItem(PEERS_KEY, updatedPeers);
      setPeers(updatedPeers);
      
      return peer;
    } catch (error) {
      console.error('Failed to connect to peer:', error);
      throw error;
    }
  }, [peers]);

  // Broadcast profile event to mesh
  const broadcastProfileEvent = (type: string, data: any) => {
    // In real implementation, this would use WebRTC DataChannel or WebSocket
    const event = {
      type,
      timestamp: Date.now(),
      data,
    };
    
    // Dispatch custom event for local listeners
    window.dispatchEvent(new CustomEvent('lairik-profile', { detail: event }));
    
    // TODO: Broadcast to P2P mesh
    console.log('Broadcasting profile event:', event);
  };

  // Generate cryptographic key pair
  const generateKeyPair = async () => {
    // In real implementation, use Web Crypto API or libp2p-crypto
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true,
      ['sign', 'verify']
    );
    
    const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)));
    
    return {
      publicKey: publicKeyBase64,
      privateKey: keyPair,
    };
  };

  return {
    profile,
    peers,
    isLoading,
    isOnline,
    createProfile,
    updateProfile,
    addDocument,
    deleteProfile,
    discoverPeers,
    connectToPeer,
  };
}
