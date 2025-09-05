#!/bin/bash

# Deploy Beloop POS API to Vercel
# Make sure you have Vercel CLI installed: npm i -g vercel

echo "🚀 Deploying Beloop POS API to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel first:"
    vercel login
fi

# Create project structure
echo "📁 Creating project structure..."
mkdir -p vercel-api
cd vercel-api

# Copy API files
cp ../vercel-api-routes/*.js ./api/
cp ../firebase-vercel-config.js ./
cp ../vercel-package.json ./package.json

# Create vercel.json
cat > vercel.json << EOF
{
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "env": {
    "FIREBASE_PROJECT_ID": "@firebase-project-id",
    "FIREBASE_PRIVATE_KEY": "@firebase-private-key", 
    "FIREBASE_CLIENT_EMAIL": "@firebase-client-email",
    "FIREBASE_DATABASE_URL": "@firebase-database-url"
  }
}
EOF

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📱 Update your Android app with the new Vercel URL"
echo "🔧 Don't forget to set up Firebase and environment variables"
