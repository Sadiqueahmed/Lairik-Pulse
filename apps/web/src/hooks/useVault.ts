import { useState, useCallback, useEffect, useRef } from 'react';
import localforage from 'localforage';

// ─── LocalForage instances ────────────────────────────────────────────────

const documentStore = localforage.createInstance({
  name: 'lairik-pulse',
  storeName: 'documents',
  description: 'Encrypted document storage',
});

const metadataStore = localforage.createInstance({
  name: 'lairik-pulse',
  storeName: 'metadata',
  description: 'Document metadata',
});

const syncStore = localforage.createInstance({
  name: 'lairik-pulse',
  storeName: 'sync-queue',
  description: 'Offline sync queue for documents',
});

// ─── Types ────────────────────────────────────────────────────────────────

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  timestamp: number;
  verified: boolean;
  cid?: string;
}

export interface UseVaultReturn {
  documents: Document[];
  addDocument: (file: File) => Promise<void>;
  removeDocument: (id: string) => Promise<void>;
  viewDocument: (id: string) => Promise<Blob | null>;
  downloadDocument: (id: string, filename: string) => Promise<void>;
  isLoading: boolean;
  backendOnline: boolean;
  syncPending: number;
}

// ─── Web Crypto helpers (AES-256-GCM) ────────────────────────────────────

/**
 * Derive a stable AES-GCM key from a password using PBKDF2.
 * The salt is fixed per-app so the same password always yields the same key.
 */
async function deriveKey(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('lairik-pulse-vault-v1'),   // fixed salt — key is stable across sessions
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt raw bytes. Returns IV (12 bytes) + ciphertext concatenated.
 */
async function encryptData(key: CryptoKey, data: ArrayBuffer): Promise<ArrayBuffer> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  // Prepend IV so we can recover it on decryption
  const result = new Uint8Array(12 + ciphertext.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(ciphertext), 12);
  return result.buffer;
}

/**
 * Decrypt bytes produced by encryptData. Expects IV prepended.
 */
async function decryptData(key: CryptoKey, data: ArrayBuffer): Promise<ArrayBuffer> {
  const buf = new Uint8Array(data);
  const iv = buf.slice(0, 12);
  const ciphertext = buf.slice(12);
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
}

// ─── Hook ─────────────────────────────────────────────────────────────────

import { usePulseStore } from '../store/pulseStore';

export function useVault(vaultPassword = 'default-vault-key'): UseVaultReturn {
  const {
    documents, setDocuments,
    isLoading, setIsLoading,
    syncPending, setSyncPending,
    backendOnline, setBackendOnline,
  } = usePulseStore();
  const cryptoKeyRef = useRef<CryptoKey | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // Load documents from local cache + hydrate from backend on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      // Derive key once
      cryptoKeyRef.current = await deriveKey(vaultPassword);

      // 1. Load cached documents from IndexedDB first (instant, works offline)
      const storedDocs: Document[] = [];
      await metadataStore.iterate((value: unknown) => {
        storedDocs.push(value as Document);
      });

      // Show cached data immediately — prevents blank screen
      if (storedDocs.length > 0) {
        setDocuments(storedDocs.sort((a, b) => b.timestamp - a.timestamp));
      }

      // 2. Attempt hydration from Go backend
      if (typeof window !== 'undefined' && navigator.onLine) {
        try {
          const apiRes = await fetch(`${API_URL}/vault/documents`);
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            setBackendOnline(true);

            const apiDocs: Document[] = (apiData.documents || []).map((d: any) => ({
              id: d.id,
              name: d.name,
              type: d.type,
              size: d.size,
              timestamp: new Date(d.created_at).getTime(),
              verified: true,
              cid: d.cid,
            }));

            // Merge: backend is source of truth for verified docs,
            // local has pending unsynced docs
            const mergedMap = new Map<string, Document>();

            // Start with local docs (includes pending unsynced ones)
            storedDocs.forEach(d => mergedMap.set(d.id, d));

            // Overlay with backend docs (these are verified/persisted)
            apiDocs.forEach(apiDoc => {
              const existing = mergedMap.get(apiDoc.id);
              if (existing) {
                mergedMap.set(apiDoc.id, { ...existing, verified: true, cid: apiDoc.cid });
              } else {
                mergedMap.set(apiDoc.id, apiDoc);
              }
              // Cache the backend doc locally for offline use
              metadataStore.setItem(apiDoc.id, mergedMap.get(apiDoc.id)!);
            });

            const merged = Array.from(mergedMap.values()).sort((a, b) => b.timestamp - a.timestamp);
            setDocuments(merged);
          }
        } catch (e) {
          console.warn('Backend hydration skipped (offline or unreachable):', e);
          setBackendOnline(false);
        }
      }

      // 3. Count pending syncs
      const keys = await syncStore.keys();
      setSyncPending(keys.length);

      setIsLoading(false);
    };
    init();
  }, [vaultPassword]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Sync Queue Processor ────────────────────────────────────────────────
  const processSyncQueue = useCallback(async () => {
    if (typeof window !== 'undefined' && !navigator.onLine) return;

    try {
      const keys = await syncStore.keys();
      if (keys.length === 0) return;

      for (const localId of keys) {
        // Read decrypted file
        const key = cryptoKeyRef.current ?? (await deriveKey(vaultPassword));
        const encrypted = await documentStore.getItem<ArrayBuffer>(localId);
        const meta = await metadataStore.getItem<Document>(localId);

        if (!encrypted || !meta) {
          await syncStore.removeItem(localId); // Invalid entry
          continue;
        }

        const decrypted = await decryptData(key, encrypted);
        const fileBlob = new Blob([decrypted], { type: meta.type });

        // 1. Upload to backend
        const formData = new FormData();
        formData.append('file', fileBlob, meta.name);

        const uploadRes = await fetch(`${API_URL}/vault/documents`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) throw new Error('Failed to upload document to backend');
        const uploadData = await uploadRes.json();
        const backendDocId = uploadData.id;

        // 2. Generate ZKP
        try {
          const zkpRes = await fetch(`${API_URL}/zkp/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              document_id: backendDocId,
              proof_type: 'degree',
            }),
          });

          if (!zkpRes.ok) {
            console.warn('ZKP generation failed during sync, document still uploaded');
          }
        } catch (zkpErr) {
          console.warn('ZKP generation error during sync:', zkpErr);
        }

        // Success - remove from sync queue and mark local metadata verified
        await syncStore.removeItem(localId);
        const updatedMeta = { ...meta, verified: true, cid: uploadData.cid || '' };
        await metadataStore.setItem(localId, updatedMeta);
        
        setDocuments((prev: Document[]) => prev.map(d => d.id === localId ? updatedMeta : d));
      }

      // Update pending count
      const remaining = await syncStore.keys();
      setSyncPending(remaining.length);
      setBackendOnline(true);

    } catch (err) {
      console.error('Sync process interrupted:', err);
    }
  }, [vaultPassword]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for online events — auto-sync queued documents
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      console.log('Online! Processing sync queue...');
      processSyncQueue();
    };

    window.addEventListener('online', handleOnline);

    // Also attempt sync on mount if online
    if (navigator.onLine) {
      processSyncQueue();
    }

    return () => window.removeEventListener('online', handleOnline);
  }, [processSyncQueue]);

  const addDocument = useCallback(
    async (file: File) => {
      setIsLoading(true);
      try {
        const key = cryptoKeyRef.current ?? (await deriveKey(vaultPassword));

        // Read file as ArrayBuffer
        const fileBuffer = await file.arrayBuffer();

        // Encrypt
        const encrypted = await encryptData(key, fileBuffer);

        const id = crypto.randomUUID();
        const newDoc: Document = {
          id,
          name: file.name,
          type: file.type,
          size: file.size,
          timestamp: Date.now(),
          verified: false,
        };

        // Store encrypted bytes + metadata locally
        await documentStore.setItem(id, encrypted);
        await metadataStore.setItem(id, newDoc);

        // Add to sync queue
        await syncStore.setItem(id, Date.now());
        setSyncPending((prev: number) => prev + 1);

        setDocuments((prev: Document[]) => [newDoc, ...prev]);

        // Attempt sync immediately if online
        if (typeof window !== 'undefined' && navigator.onLine) {
          // Small delay to let UI update first
          setTimeout(() => processSyncQueue(), 100);
        }

      } catch (error) {
        console.error('Failed to store document:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [vaultPassword, processSyncQueue] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const removeDocument = useCallback(async (id: string) => {
    try {
      await documentStore.removeItem(id);
      await metadataStore.removeItem(id);
      await syncStore.removeItem(id); // Remove from sync queue if pending
      setDocuments((prev: Document[]) => prev.filter((doc: Document) => doc.id !== id));

      // Also delete from backend if online
      if (typeof window !== 'undefined' && navigator.onLine) {
        try {
          await fetch(`${API_URL}/vault/documents/${id}`, { method: 'DELETE' });
        } catch {
          // Best effort — local deletion is primary
        }
      }
    } catch (error) {
      console.error('Failed to remove document:', error);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const viewDocument = useCallback(
    async (id: string): Promise<Blob | null> => {
      try {
        const key = cryptoKeyRef.current ?? (await deriveKey(vaultPassword));
        const meta = documents.find((d: Document) => d.id === id);
        const encrypted = await documentStore.getItem<ArrayBuffer>(id);
        if (!encrypted) return null;
        const decrypted = await decryptData(key, encrypted);
        return new Blob([decrypted], { type: meta?.type ?? 'application/octet-stream' });
      } catch (error) {
        console.error('Failed to retrieve document:', error);
        return null;
      }
    },
    [vaultPassword, documents]
  );

  const downloadDocument = useCallback(
    async (id: string, filename: string) => {
      try {
        const blob = await viewDocument(id);
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Failed to download document:', error);
      }
    },
    [viewDocument]
  );

  return {
    documents,
    addDocument,
    removeDocument,
    viewDocument,
    downloadDocument,
    isLoading,
    backendOnline,
    syncPending,
  };
}
