'use client';

import { useState } from 'react';
import { useZKPStore } from '@/hooks/useZKP';

export function ZKPVerifier() {
  const [documentId, setDocumentId] = useState('');
  const [proofType, setProofType] = useState<'degree' | 'identity'>('degree');
  const { isGenerating, proof, verify, reset } = useZKPStore();

  const handleGenerate = async () => {
    if (!documentId) return;
    await verify(documentId, proofType);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Zero-Knowledge Proof</h3>
        <p className="text-sm text-slate-400 mb-6">
          Generate a privacy-preserving proof that verifies your document without revealing its contents.
          Perfect for sharing verification with authorities while maintaining confidentiality.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Document ID
            </label>
            <input
              type="text"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              placeholder="Enter document ID from your vault"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-lairik-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Proof Type
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setProofType('degree')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  proofType === 'degree'
                    ? 'bg-lairik-primary text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Degree Verification
              </button>
              <button
                onClick={() => setProofType('identity')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  proofType === 'identity'
                    ? 'bg-lairik-primary text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Identity Proof
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !documentId}
            className="w-full bg-lairik-accent hover:bg-lairik-accent/80 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating Proof...
              </>
            ) : (
              'Generate ZK Proof'
            )}
          </button>
        </div>
      </div>

      {proof && (
        <div className="bg-slate-800 rounded-xl p-6 border border-lairik-success/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-lairik-success">
              Proof Generated Successfully
            </h3>
            <button
              onClick={reset}
              className="text-sm text-slate-400 hover:text-white"
            >
              Reset
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-1">Proof Hash</p>
              <p className="font-mono text-sm text-lairik-accent break-all">
                {proof.hash}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Verification Time</p>
                <p className="font-medium">{proof.verificationTime}ms</p>
              </div>
              <div className="bg-slate-900 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">Proof Size</p>
                <p className="font-medium">{proof.size} bytes</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-lairik-primary hover:bg-lairik-secondary text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Download Proof
              </button>
              <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Share via Mesh
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h4 className="font-medium mb-2 text-lairik-accent">How ZK Proofs Work</h4>
        <p className="text-sm text-slate-400 leading-relaxed">
          Zero-Knowledge Proofs (ZKPs) allow you to prove that you possess a valid document
          without revealing any information about the document itself. Using Groth16 protocol
          via gnark, we generate a cryptographic proof that can be verified by anyone
          without exposing sensitive data like grades, personal details, or document contents.
        </p>
      </div>
    </div>
  );
}
