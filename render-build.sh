#!/usr/bin/env bash
# Build script for Render.com deployment

set -o errexit  # Exit on error

echo "🚀 Starting build process..."

# Check Node version
echo "📋 Node version: $(node --version)"
echo "📋 NPM version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production=false

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Build completed successfully!"

# Verify build output
if [ -d "dist" ]; then
    echo "📁 Build output directory found"
    ls -la dist/
else
    echo "❌ Build output directory not found!"
    exit 1
fi

echo "🎉 Ready for deployment!"
