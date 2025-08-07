#!/bin/bash

# 🚀 GHL MCP Server Deployment Script
# This script automates the deployment to Railway

echo "🚀 Starting GHL MCP Server deployment..."

# 1. Build the project
echo "📦 Building project..."
npm run build

# 2. Run tests
echo "🧪 Running tests..."
npm test

# 3. Check build output
echo "🔍 Verifying build..."
if [ -f "build/index.js" ]; then
    echo "✅ build/index.js exists"
else
    echo "❌ build/index.js missing"
    exit 1
fi

if grep -q "execute-agent" build/index.js; then
    echo "✅ /execute-agent route found in build"
else
    echo "❌ /execute-agent route missing from build"
    exit 1
fi

# 4. Commit changes
echo "📝 Committing changes..."
git add .
git commit -m "Fix Railway deployment: Add railway.json and update package.json scripts"

# 5. Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Deployment initiated!"
echo "📋 Next steps:"
echo "1. Check Railway dashboard for deployment status"
echo "2. Monitor Railway logs for: '✅ /execute-agent route registered'"
echo "3. Test with Postman: POST https://primary-production-1ca15.up.railway.app/execute-agent"
echo "4. Verify response is 200 OK with JSON output"

echo "🎯 Expected Railway logs:"
echo "✅ /execute-agent route registered"
echo "MCP Server listening on 0.0.0.0:3000"
echo "🚀 GHL API Server running on port 3000"
