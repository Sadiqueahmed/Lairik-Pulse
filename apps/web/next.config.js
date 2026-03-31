const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Disable SW in development to prevent caching issues
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      // Dashboard route — available offline via StaleWhileRevalidate
      urlPattern: /\/dashboard/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'dashboard-pages',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    {
      // API calls — try network first, fall back to cache
      urlPattern: /^http:\/\/localhost:8080\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
        networkTimeoutSeconds: 3,
      },
    },
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /\/_next\/image\?url/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image-cache',
      },
    },
  ],
  fallbacks: {
    document: '/dashboard', // Fallback route when fully offline
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

module.exports = withPWA(nextConfig);
