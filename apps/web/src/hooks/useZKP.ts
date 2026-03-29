import { useState, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface ZKProof {
  proofHash: string;
  circuitType: string;
  verificationTimeMs: number;
  sizeBytes: number;
  timestamp: number;
  verified: boolean;
}

export interface UseZKPReturn {
  generateProof: (documentId: string, type: 'degree' | 'identity') => Promise<ZKProof | null>;
  verifyProof: (proofHash: string) => Promise<boolean>;
  isGenerating: boolean;
  isVerifying: boolean;
  lastProof: ZKProof | null;
  error: string | null;
}

export function useZKP(): UseZKPReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastProof, setLastProof] = useState<ZKProof | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate a Groth16 ZK proof for a document via the Go backend.
   * Returns null if the backend is unreachable — NO mock proofs.
   */
  const generateProof = useCallback(
    async (documentId: string, type: 'degree' | 'identity'): Promise<ZKProof | null> => {
      setIsGenerating(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/zkp/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ document_id: documentId, proof_type: type }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(err.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const proof: ZKProof = {
          proofHash: data.proof_hash,
          circuitType: type === 'degree' ? 'DegreeVerification' : 'IdentityProof',
          verificationTimeMs: data.verification_time ?? 0,
          sizeBytes: data.size_bytes ?? 0,
          timestamp: Date.now(),
          verified: true,
        };

        setLastProof(proof);
        return proof;
      } catch (err) {
        console.error('ZKP generate error:', err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(`Proof generation failed: ${message}. Ensure the Go backend is running on port 8080.`);
        // NO mock proof — return null so UI can show proper state
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  /**
   * Verify a ZK proof by its hash via the Go backend.
   */
  const verifyProof = useCallback(async (proofHash: string): Promise<boolean> => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/zkp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proof_hash: proofHash }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.valid === true;
    } catch (err) {
      console.error('ZKP verify error:', err);
      setError('Verification failed — backend unreachable');
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return { generateProof, verifyProof, isGenerating, isVerifying, lastProof, error };
}
