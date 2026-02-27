'use client';

import { useState } from 'react';
import { VaultUploader } from '@/components/vault/VaultUploader';
import { MeshStatus } from '@/components/mesh/MeshStatus';
import { ZKPVerifier } from '@/components/verify/ZKPVerifier';

type Tab = 'vault' | 'mesh' | 'verify';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('vault');

  return (
    <main className="min-h-screen pb-8">
      {/* Header */}
      <header className="manipur-header sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo icon */}
              <div className="manipur-icon-circle w-10 h-10 bg-white/10 border-white/30 text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  ꯂꯥꯏꯔꯤꯛ-ꯄꯨꯜꯁ
                </h1>
                <p className="text-xs text-white/80">Lairik-Pulse</p>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-medium">Offline Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="manipur-card p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-bl-full" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="manipur-badge">ꯃꯅꯤꯄꯨꯔ</span>
              <span className="text-[#0f4c3a]/60 text-sm">Manipur Recovery</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0f4c3a] mb-2">
              Document Verification & Recovery
            </h2>
            <p className="text-[#0f4c3a]/70 max-w-2xl">
              Secure, offline-first document vault with Zero-Knowledge Proof verification. 
              Designed for resilience in connectivity-challenged environments.
            </p>
            
            <div className="flex gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1.5 text-[#0f4c3a]/60">
                <svg className="w-4 h-4 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Zero-Knowledge Proofs</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#0f4c3a]/60">
                <svg className="w-4 h-4 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>P2P Mesh Network</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#0f4c3a]/60">
                <svg className="w-4 h-4 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>End-to-End Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[#d4af37]/30">
          <button
            onClick={() => setActiveTab('vault')}
            className={`manipur-tab flex items-center gap-2 ${activeTab === 'vault' ? 'manipur-tab-active' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Document Vault</span>
          </button>
          <button
            onClick={() => setActiveTab('mesh')}
            className={`manipur-tab flex items-center gap-2 ${activeTab === 'mesh' ? 'manipur-tab-active' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Mesh Network</span>
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`manipur-tab flex items-center gap-2 ${activeTab === 'verify' ? 'manipur-tab-active' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Verify</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="animate-shimmer rounded-xl">
          {activeTab === 'vault' && <VaultUploader />}
          {activeTab === 'mesh' && <MeshStatus />}
          {activeTab === 'verify' && <ZKPVerifier />}
        </div>
      </section>
    </main>
  );
}
