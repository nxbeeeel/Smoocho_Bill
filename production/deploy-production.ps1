# Smoocho Bill - Complete Production Deployment Script
# This script deploys both backend (Railway) and frontend (Vercel)

Write-Host "🚀 SMOOCHO BILL - COMPLETE PRODUCTION DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check prerequisites
Write-Host "[1/7] Checking prerequisites..." -ForegroundColor Yellow
Write-Host "📋 Required accounts:" -ForegroundColor White
Write-Host "   - Railway: https://railway.app" -ForegroundColor White
Write-Host "   - Vercel: https://vercel.com" -ForegroundColor White
Write-Host ""

# Step 2: Deploy Backend to Railway
Write-Host "[2/7] Deploying Backend to Railway..." -ForegroundColor Yellow
Write-Host "🔧 This will deploy your Node.js API server" -ForegroundColor White
Write-Host ""

$deployBackend = Read-Host "Do you want to deploy the backend to Railway? (y/n)"
if ($deployBackend -eq "y" -or $deployBackend -eq "Y") {
    Write-Host "🚀 Starting Railway deployment..." -ForegroundColor Green
    & ".\deploy-railway.ps1"
} else {
    Write-Host "⏭️  Skipping Railway deployment" -ForegroundColor Yellow
}

# Step 3: Get Railway deployment URL
Write-Host "[3/7] Getting Railway deployment URL..." -ForegroundColor Yellow
Write-Host "📝 Please copy your Railway deployment URL from the dashboard" -ForegroundColor White
Write-Host "🔗 Railway Dashboard: https://railway.app" -ForegroundColor Cyan
$railwayUrl = Read-Host "Enter your Railway deployment URL (e.g., https://your-app.railway.app)"

if ($railwayUrl) {
    Write-Host "✅ Railway URL: $railwayUrl" -ForegroundColor Green
    
    # Step 4: Update frontend configuration
    Write-Host "[4/7] Updating frontend configuration..." -ForegroundColor Yellow
    $configFile = ".\client\src\config\index.ts"
    
    if (Test-Path $configFile) {
        $configContent = Get-Content $configFile -Raw
        $updatedConfig = $configContent -replace 'http://localhost:5000', $railwayUrl
        Set-Content $configFile $updatedConfig
        Write-Host "✅ Frontend configuration updated with Railway URL" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Frontend config file not found, will update manually" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  No Railway URL provided, using default" -ForegroundColor Yellow
}

# Step 5: Deploy Frontend to Vercel
Write-Host "[5/7] Deploying Frontend to Vercel..." -ForegroundColor Yellow
Write-Host "🌐 This will deploy your React frontend" -ForegroundColor White
Write-Host ""

$deployFrontend = Read-Host "Do you want to deploy the frontend to Vercel? (y/n)"
if ($deployFrontend -eq "y" -or $deployFrontend -eq "Y") {
    Write-Host "🚀 Starting Vercel deployment..." -ForegroundColor Green
    & ".\deploy-vercel.ps1"
} else {
    Write-Host "⏭️  Skipping Vercel deployment" -ForegroundColor Yellow
}

# Step 6: Get Vercel deployment URL
Write-Host "[6/7] Getting Vercel deployment URL..." -ForegroundColor Yellow
Write-Host "📝 Please copy your Vercel deployment URL from the dashboard" -ForegroundColor White
Write-Host "🔗 Vercel Dashboard: https://vercel.com" -ForegroundColor Cyan
$vercelUrl = Read-Host "Enter your Vercel deployment URL (e.g., https://your-app.vercel.app)"

if ($vercelUrl) {
    Write-Host "✅ Vercel URL: $vercelUrl" -ForegroundColor Green
} else {
    Write-Host "⚠️  No Vercel URL provided" -ForegroundColor Yellow
}

# Step 7: Final configuration
Write-Host "[7/7] Final configuration..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "        DEPLOYMENT SUMMARY" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

if ($railwayUrl) {
    Write-Host "🔧 Backend (Railway): $railwayUrl" -ForegroundColor Green
} else {
    Write-Host "🔧 Backend (Railway): Not deployed" -ForegroundColor Red
}

if ($vercelUrl) {
    Write-Host "🌐 Frontend (Vercel): $vercelUrl" -ForegroundColor Green
} else {
    Write-Host "🌐 Frontend (Vercel): Not deployed" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor White
Write-Host "1. Test your deployed application" -ForegroundColor White
Write-Host "2. Configure custom domains (optional)" -ForegroundColor White
Write-Host "3. Set up monitoring and alerts" -ForegroundColor White
Write-Host "4. Configure environment variables in Railway" -ForegroundColor White
Write-Host ""

if ($railwayUrl -and $vercelUrl) {
    Write-Host "🎉 CONGRATULATIONS! Your Smoocho Bill app is now live!" -ForegroundColor Green
    Write-Host "🔗 Test your app: $vercelUrl" -ForegroundColor Cyan
    Write-Host "🔗 API endpoint: $railwayUrl" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Deployment incomplete. Please complete the missing steps." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📚 For detailed instructions, see: deploy-vercel-railway.md" -ForegroundColor Cyan
Write-Host "🆘 Need help? Check the troubleshooting section in the guide" -ForegroundColor Cyan
Write-Host ""

# Wait for user input
Read-Host "Press Enter to continue"
