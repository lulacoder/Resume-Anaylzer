#!/bin/bash

# Vercel deployment script for Resume Analyzer

set -e

echo "🚀 Deploying Resume Analyzer to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel..."
    vercel login
fi

# Set environment variables (if not already set in Vercel dashboard)
echo "🔧 Setting up environment variables..."

# You can uncomment and modify these if you want to set env vars via CLI
# vercel env add NEXT_PUBLIC_SUPABASE_URL production
# vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# vercel env add GEMINI_API_KEY production
# vercel env add NEXT_PUBLIC_SITE_URL production

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Deployment completed!"
echo ""
echo "🔗 Your app should be available at your Vercel domain"
echo "📊 Check deployment status: https://vercel.com/dashboard"
echo ""
echo "Post-deployment checklist:"
echo "1. ✅ Test authentication flow"
echo "2. ✅ Test resume upload and analysis"
echo "3. ✅ Verify all pages load correctly"
echo "4. ✅ Check error tracking is working"
echo "5. ✅ Monitor performance metrics"