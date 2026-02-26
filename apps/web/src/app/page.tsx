'use client';

import { useState } from 'react';
import { VaultUploader } from '@/components/vault/VaultUploader';
import { MeshStatus } from '@/components/mesh/MeshStatus';
import { ZKPVerifier } from '@/components/verify/ZKPVerifier';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'vault' | 'mesh' | 'verify'>('vault');

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-lairik-accent">
            Lairik-Pulse
          </h1>
          <p className="text-slate-300">
            Offline-Mesh Verification & Recovery for Manipur
          </p>
        </header>

        <nav className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'vault'
                ? 'bg-lairik-primary text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Document Vault
          </button>
          <button
            onClick={() => setActiveTab('mesh')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'mesh'
                ? 'bg-lairik-primary text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Mesh Network
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'verify'
                ? 'bg-lairik-primary text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            ZKP Verify
          </button>
        </nav>

        <div className="max-w-4xl mx-auto">
          {activeTab === 'vault' && <VaultUploader />}
          {activeTab === 'mesh' && <MeshStatus />}
          {activeTab === 'verify' && <ZKPVerifier />}
        </div>
      </div>
    </main>
  );
}
