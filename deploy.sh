#!/bin/bash
echo "🚀 Deploying Toxicity Detector to Vercel..."

# Make sure we're in the right directory
cd /Users/aakashjawle/Desktop/toxicitydetector

# Build the project to make sure it works
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🌐 Ready for deployment!"
    echo ""
    echo "Now run: npx vercel --prod"
    echo "Or go to: https://vercel.com/new and import your GitHub repo"
else
    echo "❌ Build failed. Please fix errors before deploying."
fi
