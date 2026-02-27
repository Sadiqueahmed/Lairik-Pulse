'use client';

import { useState } from 'react';
import { useZKP } from '@/hooks/useZKP';
import { useVault } from '@/hooks/useVault';

export function ZKPVerifier() {
  const { generateProof, isGenerating, lastProof } = useZKP();
  const { documents } = useVault();
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<'degree' | 'identity'>('degree');
  const [showResult, setShowResult] = useState(false);
  const [verifiedDocs, setVerifiedDocs] = useState<Set<string>>(new Set());

  const handleGenerate = async () => {
    if (!selectedDoc) return;
    await generateProof(documentType);
    setVerifiedDocs(prev => new Set([...prev, selectedDoc]));
    setShowResult(true);
  };

  const selectedDocument = documents.find(d => d.id === selectedDoc);

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="manipur-card p-6">
        <div className="flex items-start gap-4">
          <div className="manipur-icon-circle flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#0f4c3a] mb-2">
              Zero-Knowledge Proof Verification
            </h3>
            <p className="text-sm text-[#0f4c3a]/70 leading-relaxed">
              Prove your credentials without revealing sensitive information. 
              Using Groth16 ZK-SNARKs for privacy-preserving verification.
            </p>
          </div>
        </div>
      </div>

      {/* Document Selection */}
      {documents.length > 0 ? (
        <div className="manipur-card p-6">
          <h4 className="font-medium text-[#0f4c3a] mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Select Document to Verify
            <span className="manipur-badge">{documents.length}</span>
          </h4>
          
          <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoc(doc.id)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left flex items-center gap-3 ${
                  selectedDoc === doc.id
                    ? 'border-[#d4af37] bg-[#d4af37]/10'
                    : 'border-[#0f4c3a]/10 hover:border-[#d4af37]/30'
                }`}
              >
                <div className="w-8 h-8 rounded bg-[#0f4c3a]/5 flex items-center justify-center">
                  {doc.type === 'application/pdf' ? (
                    <svg className="w-4 h-4 text-[#0f4c3a]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-[#0f4c3a]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#0f4c3a] text-sm truncate">{doc.name}</p>
                  <p className="text-xs text-[#0f4c3a]/50">
                    {(doc.size / 1024 / 1024).toFixed(2)} MB
                    {verifiedDocs.has(doc.id) && (
                      <span className="ml-2 text-green-600">✓ Verified</span>
                    )}
                  </p>
                </div>
                {selectedDoc === doc.id && (
                  <svg className="w-5 h-5 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          <h4 className="font-medium text-[#0f4c3a] mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Select Verification Type
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setDocumentType('degree')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                documentType === 'degree'
                  ? 'border-[#d4af37] bg-[#d4af37]/10'
                  : 'border-[#0f4c3a]/10 hover:border-[#d4af37]/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  documentType === 'degree' ? 'bg-[#d4af37]/30' : 'bg-[#0f4c3a]/5'
                }`}>
                  <svg className="w-5 h-5 text-[#0f4c3a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <span className="font-medium text-[#0f4c3a]">Academic Degree</span>
              </div>
              <p className="text-xs text-[#0f4c3a]/60">
                Verify educational qualifications without revealing full transcript
              </p>
            </button>

            <button
              onClick={() => setDocumentType('identity')}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                documentType === 'identity'
                  ? 'border-[#d4af37] bg-[#d4af37]/10'
                  : 'border-[#0f4c3a]/10 hover:border-[#d4af37]/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  documentType === 'identity' ? 'bg-[#d4af37]/30' : 'bg-[#0f4c3a]/5'
                }`}>
                  <svg className="w-5 h-5 text-[#0f4c3a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <span className="font-medium text-[#0f4c3a]">Identity Proof</span>
              </div>
              <p className="text-xs text-[#0f4c3a]/60">
                Prove residency or identity without exposing personal details
              </p>
            </button>
          </div>
        </div>
      ) : (
        <div className="manipur-card p-8 text-center">
          <div className="manipur-icon-circle mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="font-medium text-[#0f4c3a] mb-2">No Documents Available</h4>
          <p className="text-sm text-[#0f4c3a]/60 mb-4">
            Upload documents in the Vault tab first to verify them.
          </p>
          <a 
            href="/dashboard?tab=vault" 
            className="manipur-button-primary inline-block text-sm"
          >
            Go to Vault
          </a>
        </div>
      )}

      {/* Generate Button */}
      {documents.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedDoc}
            className="manipur-button-primary flex items-center gap-2 text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating ZK Proof...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Generate ZK Proof
              </>
            )}
          </button>
        </div>
      )}

      {/* Result Card */}
      {showResult && lastProof && selectedDocument && (
        <div className="manipur-card p-6 border-[#d4af37] animate-shimmer">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-[#0f4c3a]">Proof Generated Successfully</h4>
              <p className="text-sm text-[#0f4c3a]/60">
                {selectedDocument.name} verified with Groth16 ZK-SNARK
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-[#0f4c3a]/5 rounded-lg p-3">
              <span className="text-xs text-[#0f4c3a]/60 block mb-1">Proof Hash</span>
              <code className="text-xs text-[#0f4c3a] break-all">{lastProof.proofHash}</code>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0f4c3a]/5 rounded-lg p-3">
                <span className="text-xs text-[#0f4c3a]/60 block mb-1">Circuit</span>
                <span className="text-sm font-medium text-[#0f4c3a]">{lastProof.circuitType}</span>
              </div>
              <div className="bg-[#0f4c3a]/5 rounded-lg p-3">
                <span className="text-xs text-[#0f4c3a]/60 block mb-1">Timestamp</span>
                <span className="text-sm font-medium text-[#0f4c3a]">
                  {new Date(lastProof.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-3">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Verification successful - No sensitive data exposed</span>
            </div>
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-[#0f4c3a]/10 to-transparent rounded-lg p-4 border border-[#0f4c3a]/20">
          <h4 className="font-medium text-[#0f4c3a] mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Privacy Preserved
          </h4>
          <p className="text-xs text-[#0f4c3a]/70">
            Your document contents remain encrypted. Only the proof of validity is shared.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-lg p-4 border border-[#d4af37]/20">
          <h4 className="font-medium text-[#0f4c3a] mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Instant Verification
          </h4>
          <p className="text-xs text-[#0f4c3a]/70">
            Proofs are verified in milliseconds using Groth16, perfect for mobile devices.
          </p>
        </div>
      </div>
    </div>
  );
}
