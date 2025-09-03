# Smoocho Bill - Production Startup Script
# This script starts both API and client servers

Write-Host "🚀 SMOOCHO BILL - PRODUCTION STARTUP" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Function to test if a port is available
function Test-Port {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $null -eq $connection
    } catch {
        return $true
    }
}

# Function to wait for port to be available
function Wait-ForPort {
    param([int]$Port, [int]$Timeout = 30)
    $startTime = Get-Date
    while ((Get-Date) -lt $startTime.AddSeconds($Timeout)) {
        if (Test-Port -Port $Port) {
            return $true
        }
        Start-Sleep -Seconds 1
    }
    return $false
}

# Step 1: Stop existing processes
Write-Host "[1/4] Stopping any existing processes..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✅ Processes stopped" -ForegroundColor Green
Write-Host ""

# Step 2: Start API Server
Write-Host "[2/4] Starting API Server (Port 5000)..." -ForegroundColor Yellow
Set-Location ".\server"
Start-Process -FilePath "cmd" -ArgumentList "/k", "npm start" -WindowStyle Normal
Write-Host "✅ API Server started" -ForegroundColor Green
Write-Host ""

# Step 3: Wait for API server
Write-Host "[3/4] Waiting for API server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8
Write-Host "✅ Wait complete" -ForegroundColor Green
Write-Host ""

# Step 4: Start Client Server
Write-Host "[4/4] Starting Client Server (Port 3000)..." -ForegroundColor Yellow
Set-Location "..\client"
Start-Process -FilePath "cmd" -ArgumentList "/k", "python server.py" -WindowStyle Normal
Write-Host "✅ Client Server started" -ForegroundColor Green
Write-Host ""

# Step 5: Wait for client server
Write-Host "[5/5] Waiting for client server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host "✅ Wait complete" -ForegroundColor Green
Write-Host ""

# Step 6: Test servers
Write-Host "🔍 Testing servers..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Test API server
try {
    $null = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -TimeoutSec 5
    Write-Host "✅ API Server: RESPONDING" -ForegroundColor Green
} catch {
    Write-Host "❌ API Server: NOT RESPONDING" -ForegroundColor Red
}

# Test client server
try {
    $null = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 5
    Write-Host "✅ Client Server: RESPONDING" -ForegroundColor Green
} catch {
    Write-Host "❌ Client Server: NOT RESPONDING" -ForegroundColor Red
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "        STARTUP COMPLETE!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Client: http://localhost:3000" -ForegroundColor White
Write-Host "🔗 API: http://localhost:5000" -ForegroundColor White
Write-Host "📱 Health: http://localhost:5000/health" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Opening browser..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"
Write-Host ""
Write-Host "📋 Check the command windows for any errors" -ForegroundColor Yellow
Write-Host "🔄 Both servers are now running" -ForegroundColor Green
Write-Host ""

# Wait for user input
Read-Host "Press Enter to continue"
