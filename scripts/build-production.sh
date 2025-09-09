#!/bin/bash

# Production build script for Resume Analyzer

set -e  # Exit on any error

echo "🚀 Starting production build for Resume Analyzer..."

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL is not set"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set"
    exit 1
fi

if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ Error: GEMINI_API_KEY is not set"
    exit 1
fi

echo "✅ Environment variables validated"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out
rm -rf dist

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run type checking
echo "🔍 Running type check..."
npm run type-check

# Run linting
echo "🔧 Running linter..."
npm run lint

# Run tests
echo "🧪 Running tests..."
npm test

# Build the application
echo "🏗️ Building application..."
NODE_ENV=production npm run build

# Check build output
if [ ! -d ".next" ]; then
    echo "❌ Build failed - .next directory not found"
    exit 1
fi

echo "✅ Production build completed successfully!"

# Optional: Run build analysis
if [ "$ANALYZE_BUNDLE" = "true" ]; then
    echo "📊 Analyzing bundle size..."
    npm run build:analyze
fi

echo "🎉 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Deploy to your hosting platform"
echo "2. Set up monitoring and error tracking"
echo "3. Configure domain and SSL"
echo "4. Test all functionality in production"