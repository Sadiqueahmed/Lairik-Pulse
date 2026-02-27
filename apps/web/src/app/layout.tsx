import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ꯂꯥꯏꯔꯤꯛ-ꯄꯨꯜꯁ | Lairik-Pulse',
  description: 'Offline-Mesh Verification & Recovery for Manipur',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f4c3a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Meetei+Mayek&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased min-h-screen">
        {/* Decorative top border */}
        <div className="h-1 bg-gradient-to-r from-[#0f4c3a] via-[#d4af37] to-[#c41e3a]" />
        
        {children}
        
        {/* Footer with cultural elements */}
        <footer className="mt-auto py-6 text-center text-[#0f4c3a]/60 text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-8 h-px bg-[#d4af37]" />
            <span className="text-[#d4af37]">꯫</span>
            <span className="w-8 h-px bg-[#d4af37]" />
          </div>
          <p>ꯂꯥꯏꯔꯤꯛ-ꯄꯨꯜꯁ • Built for Manipur&apos;s Recovery</p>
          <p className="mt-1 text-xs">Offline • Private • Resilient</p>
        </footer>
      </body>
    </html>
  );
}
