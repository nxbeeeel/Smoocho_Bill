# Smoocho Bill - Production Startup Script
# PowerShell version for better error handling

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    SMOOCHO BILL - PRODUCTION STARTUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Function to wait for port to be available
function Wait-ForPort {
    param([int]$Port, [int]$Timeout = 30)
    $startTime = Get-Date
    while ((Get-Date) -lt $startTime.AddSeconds($Timeout)) {
        if (-not (Test-Port $Port)) {
            Start-Sleep -Seconds 1
        } else {
            return $true
        }
    }
    return $false
}

try {
    Write-Host "[1/4] Stopping any existing processes..." -ForegroundColor Yellow
    Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✅ Processes stopped" -ForegroundColor Green
    Write-Host ""

    Write-Host "[2/4] Starting API Server (Port 5000)..." -ForegroundColor Yellow
    Set-Location "server"
    Start-Process -FilePath "cmd" -ArgumentList "/k", "npm start" -WindowStyle Normal
    Write-Host "✅ API Server started" -ForegroundColor Green
    Write-Host ""

    Write-Host "[3/4] Waiting for API server to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8
    if (Test-Port 5000) {
        Write-Host "✅ API Server is responding on port 5000" -ForegroundColor Green
    } else {
        Write-Host "⚠️  API Server may not be ready yet" -ForegroundColor Yellow
    }
    Write-Host ""

    Write-Host "[4/4] Starting Client Server (Port 3000)..." -ForegroundColor Yellow
    Set-Location "..\client"
    Start-Process -FilePath "cmd" -ArgumentList "/k", "python server.py" -WindowStyle Normal
    Write-Host "✅ Client Server started" -ForegroundColor Green
    Write-Host ""

    Write-Host "[5/5] Waiting for client server to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    if (Test-Port 3000) {
        Write-Host "✅ Client Server is responding on port 3000" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Client Server may not be ready yet" -ForegroundColor Yellow
    }
    Write-Host ""

    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "           STARTUP COMPLETE!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🌐 Client: http://localhost:3000" -ForegroundColor White
    Write-Host "🔗 API: http://localhost:5000" -ForegroundColor White
    Write-Host "📱 Health: http://localhost:5000/health" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Opening browser..." -ForegroundColor Yellow
    Start-Process "http://localhost:3000"
    Write-Host ""
    Write-Host "📋 Check the command windows for any errors" -ForegroundColor Cyan
    Write-Host "🔄 Both servers are now running" -ForegroundColor Green
    Write-Host ""
    Write-Host "Press any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

} catch {
    Write-Host "❌ Error during startup: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
