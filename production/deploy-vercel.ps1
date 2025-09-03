# Smoocho Bill - Vercel Frontend Deployment Script
# This script deploys the frontend to Vercel

Write-Host "🌐 SMOOCHO BILL - VERCEL FRONTEND DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Vercel CLI is installed
Write-Host "[1/6] Checking Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
}

# Step 2: Navigate to client directory
Write-Host "[2/6] Preparing client directory..." -ForegroundColor Yellow
Set-Location ".\client"

# Step 3: Install dependencies
Write-Host "[3/6] Installing client dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Dependencies installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Step 4: Build the client
Write-Host "[4/6] Building client..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Client built successfully" -ForegroundColor Green

# Step 5: Check Vercel login status
Write-Host "[5/6] Checking Vercel login..." -ForegroundColor Yellow
try {
    $vercelStatus = vercel whoami
    Write-Host "✅ Already logged in to Vercel as: $vercelStatus" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Not logged in to Vercel" -ForegroundColor Yellow
    Write-Host "🔐 Please login to Vercel..." -ForegroundColor Cyan
    vercel login
}

# Step 6: Deploy to Vercel
Write-Host "[6/6] Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "🚀 Starting deployment..." -ForegroundColor Cyan
Write-Host "📝 Follow the prompts:" -ForegroundColor White
Write-Host "   - Project name: smoocho-bill-frontend" -ForegroundColor White
Write-Host "   - Build command: npm run build" -ForegroundColor White
Write-Host "   - Output directory: dist" -ForegroundColor White
Write-Host "   - Install command: npm install" -ForegroundColor White
Write-Host ""
vercel --prod

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "        DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor White
Write-Host "1. Check Vercel dashboard for deployment status" -ForegroundColor White
Write-Host "2. Copy the deployment URL" -ForegroundColor White
Write-Host "3. Configure custom domain (optional)" -ForegroundColor White
Write-Host "4. Test the deployed application" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Vercel Dashboard: https://vercel.com" -ForegroundColor Cyan
Write-Host "📚 Documentation: See deploy-vercel-railway.md" -ForegroundColor Cyan
Write-Host ""

# Wait for user input
Read-Host "Press Enter to continue"
