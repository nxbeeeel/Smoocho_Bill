# Smoocho Bill - Railway Backend Deployment Script
# This script deploys the backend to Railway

Write-Host "🚀 SMOOCHO BILL - RAILWAY BACKEND DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Railway CLI is installed
Write-Host "[1/5] Checking Railway CLI..." -ForegroundColor Yellow
try {
    $railwayVersion = railway --version
    Write-Host "✅ Railway CLI found: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Red
    npm install -g @railway/cli
    Write-Host "✅ Railway CLI installed" -ForegroundColor Green
}

# Step 2: Build the server
Write-Host "[2/5] Building server..." -ForegroundColor Yellow
Set-Location ".\server"
npm run build:server
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Server built successfully" -ForegroundColor Green

# Step 3: Check Railway login status
Write-Host "[3/5] Checking Railway login..." -ForegroundColor Yellow
try {
    $railwayStatus = railway status
    Write-Host "✅ Already logged in to Railway" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Not logged in to Railway" -ForegroundColor Yellow
    Write-Host "🔐 Please login to Railway..." -ForegroundColor Cyan
    railway login
}

# Step 4: Initialize Railway project (if needed)
Write-Host "[4/5] Initializing Railway project..." -ForegroundColor Yellow
if (-not (Test-Path "railway.json")) {
    Write-Host "📝 Creating railway.json..." -ForegroundColor Cyan
    railway init
} else {
    Write-Host "✅ Railway project already initialized" -ForegroundColor Green
}

# Step 5: Deploy to Railway
Write-Host "[5/5] Deploying to Railway..." -ForegroundColor Yellow
Write-Host "🚀 Starting deployment..." -ForegroundColor Cyan
railway up

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "        DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor White
Write-Host "1. Check Railway dashboard for deployment status" -ForegroundColor White
Write-Host "2. Copy the deployment URL" -ForegroundColor White
Write-Host "3. Update frontend configuration with the new API URL" -ForegroundColor White
Write-Host "4. Deploy frontend to Vercel" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Railway Dashboard: https://railway.app" -ForegroundColor Cyan
Write-Host "📚 Documentation: See deploy-vercel-railway.md" -ForegroundColor Cyan
Write-Host ""

# Wait for user input
Read-Host "Press Enter to continue"
