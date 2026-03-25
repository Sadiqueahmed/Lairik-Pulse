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

export function useVault(vaultPassword = 'default-vault-key'): UseVaultReturn {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const cryptoKeyRef = useRef<CryptoKey | null>(null);

  // Load documents from storage on mount
  useEffect(() => {
    const init = async () => {
      // Derive key once
      cryptoKeyRef.current = await deriveKey(vaultPassword);

      const storedDocs: Document[] = [];
      await metadataStore.iterate((value: Document) => {
        storedDocs.push(value);
      });
      setDocuments(storedDocs.sort((a, b) => b.timestamp - a.timestamp));
    };
    init();
  }, [vaultPassword]);

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

        // Store encrypted bytes + metadata
        await documentStore.setItem(id, encrypted);
        await metadataStore.setItem(id, newDoc);

        setDocuments((prev: Document[]) => [newDoc, ...prev]);
      } catch (error) {
        console.error('Failed to store document:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [vaultPassword]
  );

  const removeDocument = useCallback(async (id: string) => {
    try {
      await documentStore.removeItem(id);
      await metadataStore.removeItem(id);
      setDocuments((prev: Document[]) => prev.filter((doc: Document) => doc.id !== id));
    } catch (error) {
      console.error('Failed to remove document:', error);
    }
  }, []);

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

  return { documents, addDocument, removeDocument, viewDocument, downloadDocument, isLoading };
}
