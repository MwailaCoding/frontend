#!/bin/bash

# Sera's Kitchen Frontend Deployment Script
echo "🍰 Deploying Sera's Kitchen Frontend..."

# Set production environment
export NODE_ENV=production
export VITE_API_URL=https://hamilton47.pythonanywhere.com

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.vite/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the project
echo "🔨 Building frontend..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build successful! Files ready for deployment:"
    ls -la dist/
    echo ""
    echo "🚀 Next steps:"
    echo "1. Choose your .co.ke domain name"
    echo "2. Upload 'dist' folder contents to your hosting provider"
    echo "3. Configure DNS settings"
    echo "4. Update backend CORS settings"
else
    echo "❌ Build failed! Check the errors above."
    exit 1
fi
