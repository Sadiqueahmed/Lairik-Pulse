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
          primary: '#1a365d',
          secondary: '#2c5282',
          accent: '#ed8936',
          success: '#38a169',
          warning: '#d69e2e',
          error: '#e53e3e',
        },
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
