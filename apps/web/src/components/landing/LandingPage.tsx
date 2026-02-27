'use client';

import React from 'react';
import { SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#0f4c3a] border-t-[#d4af37] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#0f4c3a] font-medium">ꯂꯥꯏꯔꯤꯛ-ꯄꯨꯜꯁ ꯁꯝꯕ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Simple Header */}
      <header className="px-6 py-6 border-b border-[#0f4c3a]/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#0f4c3a] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ꯂ</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0f4c3a]">ꯂꯥꯏꯔꯤꯛ-ꯄꯨꯜꯁ</h1>
              <p className="text-xs text-[#d4af37] font-medium">Lairik Pulse</p>
            </div>
          </div>
          
          <SignInButton mode="modal">
            <button className="text-[#0f4c3a] hover:text-[#d4af37] font-medium transition-colors">
              Sign In
            </button>
          </SignInButton>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-[#0f4c3a]/5 rounded-full">
                <span className="w-2 h-2 bg-[#d4af37] rounded-full mr-2"></span>
                <span className="text-[#0f4c3a] text-sm font-medium">ꯃꯅꯤꯄꯨꯔ ꯇꯥꯒꯠꯄꯒꯤ ꯊꯕꯛ ꯄ꯭ꯔꯣꯖꯦꯛꯇ</span>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-5xl lg:text-6xl font-bold text-[#0f4c3a] leading-tight">
                  ꯃꯅꯤꯄꯨꯔ<br />
                  <span className="text-[#d4af37]">ꯇꯥꯒꯠꯄꯒꯤ</span><br />
                  ꯊꯕꯛ ꯄ꯭ꯔꯣꯖꯦꯛꯇ
                </h2>
                <p className="text-lg text-gray-600">
                  Offline-First Recovery Platform for Manipur
                </p>
              </div>

              <p className="text-gray-600 leading-relaxed max-w-md">
                Secure document verification using Zero-Knowledge Proofs. 
                Verify identity and credentials without internet through peer-to-peer mesh networking.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <SignUpButton mode="modal">
                  <button className="bg-[#0f4c3a] text-white px-8 py-4 rounded-lg hover:bg-[#0a3d2e] transition-colors font-semibold text-lg">
                    ꯍꯧꯖꯤꯛ ꯁꯦꯝꯕ
                    <span className="ml-2 text-[#d4af37]">Get Started →</span>
                  </button>
                </SignUpButton>
                
                <SignInButton mode="modal">
                  <button className="border-2 border-[#0f4c3a] text-[#0f4c3a] px-8 py-4 rounded-lg hover:bg-[#0f4c3a]/5 transition-colors font-semibold text-lg">
                    ꯂꯣꯒ ꯏꯟ
                  </button>
                </SignInButton>
              </div>

              <div className="pt-4">
                <p className="text-sm text-gray-500 mb-3">Or continue with</p>
                <SignInButton mode="modal">
                  <button className="flex items-center space-x-3 border border-gray-300 px-6 py-3 rounded-lg hover:border-[#d4af37] transition-colors bg-white">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </SignInButton>
              </div>
            </div>

            {/* Right - Features */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '📁', title: 'ꯗꯣꯀꯨꯃꯦꯟ ꯚꯣꯜꯠ', sub: 'Document Vault', color: 'bg-[#0f4c3a]' },
                { icon: '🌐', title: 'ꯃꯦꯁ ꯅꯦꯠꯋꯥꯔꯛ', sub: 'Mesh Network', color: 'bg-[#d4af37]' },
                { icon: '✓', title: 'ꯓꯤꯔꯣ ꯀ꯭ꯔꯤꯄꯇꯣꯒ꯭ꯔꯥꯐꯤ', sub: 'Zero-Knowledge', color: 'bg-[#c41e3a]' },
                { icon: '🔒', title: 'ꯑꯦꯟꯀ꯭ꯔꯤꯄꯁꯟ', sub: 'Encryption', color: 'bg-[#0f4c3a]' },
              ].map((feature, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 hover:border-[#d4af37] hover:shadow-lg transition-all duration-300 group">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0f4c3a] mb-1">{feature.title}</h3>
                  <p className="text-xs text-[#d4af37] uppercase tracking-wide">{feature.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="px-6 py-8 border-t border-gray-200 mt-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0f4c3a] rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">ꯂ</span>
            </div>
            <span className="font-semibold text-[#0f4c3a]">ꯂꯥꯏꯔꯤꯛ-ꯄꯨꯜꯁ</span>
          </div>
          <p className="text-sm text-gray-500">Built for Manipur Recovery</p>
        </div>
      </footer>
    </div>
  );
}
