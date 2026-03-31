#!/bin/bash
set -e

echo "🧹 Cleaning legacy caching artifacts..."
rm -rf apps/web/.next apps/web/out apps/web/public/sw.js apps/web/public/workbox-*.js || true
rm -rf node_modules/.cache/turbo || true

echo "🔨 Testing a clean build locally to ensure integrity..."
npm run build

echo "🚀 Committing and triggering a Vercel deploy via GitHub push..."
git add .
git commit -m "chore: clear sw cache configs and fix vercel deployment paths" || echo "No changes to commit."
git push origin main

echo "✅ Done! Vercel is now building the true latest version."
