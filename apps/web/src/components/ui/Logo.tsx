'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizes = {
    sm: { container: 'w-8 h-8', svg: 'w-5 h-5', text: 'text-sm', subtext: 'text-xs' },
    md: { container: 'w-10 h-10', svg: 'w-6 h-6', text: 'text-lg', subtext: 'text-xs' },
    lg: { container: 'w-12 h-12', svg: 'w-7 h-7', text: 'text-xl', subtext: 'text-sm' },
    xl: { container: 'w-16 h-16', svg: 'w-10 h-10', text: 'text-2xl', subtext: 'text-sm' },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center space-x-2 sm:space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${s.container} bg-gradient-to-br from-[#0f4c3a] to-[#1a5c4a] rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105`}>
        <svg viewBox="0 0 40 40" className={s.svg}>
          <defs>
            <linearGradient id={`logoGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4af37"/>
              <stop offset="100%" stopColor="#f4d03f"/>
            </linearGradient>
          </defs>
          {/* Outer circle representing unity */}
          <circle cx="20" cy="20" r="18" fill="none" stroke={`url(#logoGrad-${size})`} strokeWidth="2"/>
          {/* L shape */}
          <path d="M12 12 L12 28 L20 28" fill="none" stroke={`url(#logoGrad-${size})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          {/* P shape */}
          <path d="M22 12 L22 28 M22 12 L28 12 Q32 12 32 16 Q32 20 28 20 L22 20" fill="none" stroke={`url(#logoGrad-${size})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Decorative dot representing Manipur */}
          <circle cx="20" cy="32" r="2" fill="#c41e3a"/>
        </svg>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div>
          <h1 className={`${s.text} font-bold text-[#0f4c3a] leading-tight`}>ꯂꯥꯏꯔꯤꯛ-ꯄꯨꯜꯁ</h1>
          <p className={`${s.subtext} text-[#d4af37] font-medium tracking-wider`}>Lairik Pulse</p>
        </div>
      )}
    </div>
  );
}

// Simple icon-only version for small spaces
export function LogoIcon({ size = 'md', className = '', showText = false }: { size?: 'sm' | 'md' | 'lg' | 'xl', className?: string, showText?: boolean }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const svgSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizes[size]} bg-gradient-to-br from-[#0f4c3a] to-[#1a5c4a] rounded-xl flex items-center justify-center shadow-lg`}>
      <svg viewBox="0 0 40 40" className={svgSizes[size]}>
        <defs>
          <linearGradient id={`logoIconGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4af37"/>
            <stop offset="100%" stopColor="#f4d03f"/>
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="18" fill="none" stroke={`url(#logoIconGrad-${size})`} strokeWidth="2"/>
        <path d="M12 12 L12 28 L20 28" fill="none" stroke={`url(#logoIconGrad-${size})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 12 L22 28 M22 12 L28 12 Q32 12 32 16 Q32 20 28 20 L22 20" fill="none" stroke={`url(#logoIconGrad-${size})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20" cy="32" r="2" fill="#c41e3a"/>
      </svg>
      </div>
      {showText && (
        <span className="font-semibold text-[#0f4c3a] text-sm sm:text-base">ꯂꯥꯏꯔꯤꯛ-ꯄꯨꯜꯁ</span>
      )}
    </div>
  );
}
