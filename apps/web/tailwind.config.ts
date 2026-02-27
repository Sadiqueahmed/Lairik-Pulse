import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lairik: {
          // Manipur-inspired palette
          primary: '#0f4c3a',      // Deep forest green (Manipuri hills)
          secondary: '#1a6b52',  // Lighter green
          accent: '#d4af37',     // Traditional gold (Manipuri jewelry)
          gold: '#d4af37',
          red: '#c41e3a',        // Traditional red (Manipuri textiles)
          cream: '#f5f5dc',      // Traditional cream
          earth: '#8b4513',      // Earth brown
          sky: '#87ceeb',        // Manipur sky blue
          lake: '#4682b4',       // Loktak lake blue
          success: '#228b22',
          warning: '#ff8c00',
          error: '#dc143c',
        },
        manipur: {
          green: '#0f4c3a',
          gold: '#d4af37',
          red: '#c41e3a',
          cream: '#f5f5dc',
          blue: '#4682b4',
        },
      },
      backgroundImage: {
        'manipur-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23d4af37\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        meetei: ['Noto Sans Meetei Mayek', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
