import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ꯂꯥꯏꯔꯤꯛ-ꯄꯨꯜꯁ | Lairik Pulse',
  description: 'Offline-Mesh Verification & Recovery for Manipur',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
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
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: '#0f4c3a',
          colorText: '#1a1a1a',
          colorBackground: '#ffffff',
          colorInputBackground: '#f8f9f5',
          colorInputText: '#1a1a1a',
          colorDanger: '#c41e3a',
          borderRadius: '0.5rem',
        },
        elements: {
          formButtonPrimary: 'bg-[#0f4c3a] hover:bg-[#0a3d2e] text-white',
          card: 'bg-white shadow-lg border-l-4 border-[#d4af37]',
          headerTitle: 'text-[#0f4c3a] font-bold',
          headerSubtitle: 'text-[#d4af37]',
          socialButtonsBlockButton: 'border-2 border-[#0f4c3a] hover:bg-[#0f4c3a]/5',
          socialButtonsBlockButtonText: 'text-[#0f4c3a] font-medium',
          formFieldLabel: 'text-[#0f4c3a] font-medium',
          formFieldInput: 'border-gray-300 focus:border-[#0f4c3a] focus:ring-[#0f4c3a]',
          footerActionLink: 'text-[#d4af37] hover:text-[#b8941f]',
          identityPreviewText: 'text-[#0f4c3a]',
          identityPreviewEditButton: 'text-[#d4af37] hover:text-[#b8941f]',
        },
      }}
    >
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
