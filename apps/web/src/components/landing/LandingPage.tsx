'use client';

import React, { useState, useEffect } from 'react';
import { SignInButton, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard');
    }
    // Trigger fade-in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-12 h-12 border-3 border-[#0f4c3a] border-t-[#d4af37] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#0f4c3a] font-medium">ꯂꯥꯏꯔꯤꯛ-ꯄꯨꯜꯁ ꯁꯝꯕ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#fafaf8] transition-opacity duration-700 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'} relative overflow-hidden`}>
      {/* Manipur-inspired Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        {/* Traditional geometric pattern inspired by Manipuri textiles */}
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="manipur-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              {/* Diamond shapes representing traditional motifs */}
              <path d="M30 5 L55 30 L30 55 L5 30 Z" fill="none" stroke="#0f4c3a" strokeWidth="1"/>
              <path d="M30 15 L45 30 L30 45 L15 30 Z" fill="none" stroke="#d4af37" strokeWidth="0.5"/>
              {/* Small circles representing unity */}
              <circle cx="30" cy="30" r="3" fill="#c41e3a" opacity="0.3"/>
              <circle cx="5" cy="5" r="2" fill="#0f4c3a" opacity="0.2"/>
              <circle cx="55" cy="55" r="2" fill="#0f4c3a" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#manipur-pattern)"/>
        </svg>
      </div>
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fafaf8] via-transparent to-[#0f4c3a]/5 pointer-events-none"/>
      
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M0 0 L100 0 L100 20 Q50 20 20 50 Q20 100 0 100 Z" fill="#0f4c3a"/>
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10 rotate-180">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M0 0 L100 0 L100 20 Q50 20 20 50 Q20 100 0 100 Z" fill="#d4af37"/>
        </svg>
      </div>

      {/* Header */}
      <header className="px-4 sm:px-6 py-4 sm:py-6 border-b border-[#0f4c3a]/10 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Beautiful Logo */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#0f4c3a] to-[#1a5c4a] rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105 hover:rotate-3">
              <svg viewBox="0 0 40 40" className="w-6 h-6 sm:w-7 sm:h-7">
                {/* Stylized LP monogram with Manipur-inspired design */}
                <defs>
                  <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d4af37"/>
                    <stop offset="100%" stopColor="#f4d03f"/>
                  </linearGradient>
                </defs>
                {/* Outer circle representing unity */}
                <circle cx="20" cy="20" r="18" fill="none" stroke="url(#logoGrad)" strokeWidth="2"/>
                {/* L shape */}
                <path d="M12 12 L12 28 L20 28" fill="none" stroke="url(#logoGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                {/* P shape */}
                <path d="M22 12 L22 28 M22 12 L28 12 Q32 12 32 16 Q32 20 28 20 L22 20" fill="none" stroke="url(#logoGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Decorative dot representing Manipur */}
                <circle cx="20" cy="32" r="2" fill="#c41e3a"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[#0f4c3a]">ꯂꯥꯏꯔꯤꯛ-ꯄꯨꯜꯁ</h1>
              <p className="text-xs text-[#d4af37] font-medium tracking-wider">Lairik Pulse</p>
            </div>
          </div>
          
          <SignInButton mode="modal">
            <button className="text-[#0f4c3a] hover:text-[#d4af37] font-medium transition-colors duration-300 text-sm sm:text-base">
              Sign In
            </button>
          </SignInButton>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left - Content */}
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-[#0f4c3a]/5 rounded-full transition-all duration-300 hover:bg-[#0f4c3a]/10">
                <span className="w-2 h-2 bg-[#d4af37] rounded-full mr-2 animate-pulse"></span>
                <span className="text-[#0f4c3a] text-xs sm:text-sm font-medium">ꯃꯅꯤꯄꯨꯔ ꯇꯥꯒꯠꯄꯒꯤ ꯊꯕꯛ ꯄ꯭ꯔꯣꯖꯦꯛꯇ</span>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#0f4c3a] leading-tight">
                  ꯃꯅꯤꯄꯨꯔ<br />
                  <span className="text-[#d4af37]">ꯇꯥꯒꯠꯄꯒꯤ</span><br />
                  ꯊꯕꯛ ꯄ꯭ꯔꯣꯖꯦꯛꯇ
                </h2>
                <p className="text-base sm:text-lg text-gray-600">
                  Offline-First Recovery Platform for Manipur
                </p>
              </div>

              <p className="text-gray-600 leading-relaxed max-w-md mx-auto lg:mx-0 text-sm sm:text-base">
                Secure document verification using Zero-Knowledge Proofs. 
                Verify identity and credentials without internet through peer-to-peer mesh networking.
              </p>

              <div className="space-y-3 sm:space-y-4 max-w-sm mx-auto lg:max-w-none lg:mx-0">
                <SignInButton 
                  mode="modal"
                  fallbackRedirectUrl="/dashboard"
                  signUpFallbackRedirectUrl="/dashboard"
                >
                  <button className="w-full bg-[#0f4c3a] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-[#0a3d2e] active:scale-[0.98] transition-all duration-200 font-semibold text-base sm:text-lg flex items-center justify-center space-x-2 sm:space-x-3 shadow-md hover:shadow-lg">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
                      <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-lg sm:text-2xl">ꯒꯨꯒꯜ ꯇꯥꯒꯠꯄ</span>
                    <span className="text-[#d4af37] text-sm sm:text-base">Google</span>
                  </button>
                </SignInButton>
                
                <p className="text-center text-xs sm:text-sm text-gray-500">or</p>
                
                <SignInButton 
                  mode="modal"
                  fallbackRedirectUrl="/dashboard"
                  signUpFallbackRedirectUrl="/dashboard"
                >
                  <button className="w-full border-2 border-[#0f4c3a] text-[#0f4c3a] px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-[#0f4c3a]/5 active:scale-[0.98] transition-all duration-200 font-semibold text-base sm:text-lg">
                    <span className="text-lg sm:text-2xl mr-1 sm:mr-2">ꯏꯃꯦꯜ</span>
                    <span className="text-gray-600 text-sm sm:text-base">Email</span>
                  </button>
                </SignInButton>
              </div>
            </div>

            {/* Right - Features */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-8 lg:mt-0 relative z-10">
              {[
                { icon: '📁', title: 'ꯗꯣꯀꯨꯃꯦꯟ ꯚꯣꯜꯠ', sub: 'Vault', color: 'bg-gradient-to-br from-[#0f4c3a] to-[#1a5c4a]', shadow: 'shadow-[#0f4c3a]/20' },
                { icon: '🌐', title: 'ꯃꯦꯁ ꯅꯦꯠꯋꯥꯔꯛ', sub: 'Mesh', color: 'bg-gradient-to-br from-[#d4af37] to-[#e5c158]', shadow: 'shadow-[#d4af37]/20' },
                { icon: '✓', title: 'ꯓꯤꯔꯣ ꯀ꯭ꯔꯤꯄꯇꯣꯒ꯭ꯔꯥꯐꯤ', sub: 'ZKP', color: 'bg-gradient-to-br from-[#c41e3a] to-[#d6334d]', shadow: 'shadow-[#c41e3a]/20' },
                { icon: '🔒', title: 'ꯑꯦꯟꯀ꯭ꯔꯤꯄꯁꯟ', sub: 'Secure', color: 'bg-gradient-to-br from-[#0f4c3a] to-[#1a5c4a]', shadow: 'shadow-[#0f4c3a]/20' },
              ].map((feature, idx) => (
                <div 
                  key={idx} 
                  className={`bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-100 hover:border-[#d4af37] hover:shadow-lg ${feature.shadow} transition-all duration-300 group cursor-pointer`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${feature.color} rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                    <span className="text-xl sm:text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold text-[#0f4c3a] mb-1">{feature.title}</h3>
                  <p className="text-xs text-[#d4af37] uppercase tracking-wide font-semibold">{feature.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-6 sm:py-8 border-t border-gray-200 mt-12 sm:mt-20 relative z-10 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-[#0f4c3a] to-[#1a5c4a] rounded-lg flex items-center justify-center shadow-md">
              <svg viewBox="0 0 40 40" className="w-5 h-5 sm:w-6 sm:h-6">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#d4af37" strokeWidth="2"/>
                <path d="M14 14 L14 26 L20 26" fill="none" stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 14 L22 26 M22 14 L26 14 Q29 14 29 17 Q29 20 26 20 L22 20" fill="none" stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="20" cy="30" r="1.5" fill="#c41e3a"/>
              </svg>
            </div>
            <span className="font-semibold text-[#0f4c3a] text-sm sm:text-base">ꯂꯥꯏꯔꯤꯛ-ꯄꯨꯜꯁ</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-gray-500">
            <span>© 2024 Sadique Ahmed</span>
            <div className="flex items-center space-x-4">
              <a 
                href="https://github.com/sadique-ahmed" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#0f4c3a] transition-colors duration-300 flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </a>
              <a 
                href="https://linkedin.com/in/sadique-ahmed" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#0f4c3a] transition-colors duration-300 flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
