# Smoocho Bill - System Test Script
# This script tests all components of the system

Write-Host "🔍 SMOOCHO BILL - COMPREHENSIVE SYSTEM TEST" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if servers are running
Write-Host "📡 TEST 1: Server Status Check" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow

$clientPort = 3000
$apiPort = 5000

# Check Client Server
$clientStatus = Get-NetTCPConnection -LocalPort $clientPort -ErrorAction SilentlyContinue
if ($clientStatus) {
    Write-Host "✅ Client Server (Port $clientPort): RUNNING" -ForegroundColor Green
} else {
    Write-Host "❌ Client Server (Port $clientPort): NOT RUNNING" -ForegroundColor Red
}

# Check API Server
$apiStatus = Get-NetTCPConnection -LocalPort $apiPort -ErrorAction SilentlyContinue
if ($apiStatus) {
    Write-Host "✅ API Server (Port $apiPort): RUNNING" -ForegroundColor Green
} else {
    Write-Host "❌ API Server (Port $apiPort): NOT RUNNING" -ForegroundColor Red
}

Write-Host ""

# Test 2: Check file structure
Write-Host "📁 TEST 2: File Structure Check" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow

$clientDir = ".\client"
$requiredFiles = @(
    "index.html",
    "server.py",
    ".htaccess",
    "nginx.conf"
)

$requiredAssets = @(
    "assets\index-*.js",
    "assets\index-*.css",
    "assets\router-*.js",
    "assets\ui-*.js",
    "assets\utils-*.js",
    "assets\vendor-*.js"
)

# Check required files
foreach ($file in $requiredFiles) {
    $filePath = Join-Path $clientDir $file
    if (Test-Path $filePath) {
        Write-Host "✅ $file`: PRESENT" -ForegroundColor Green
    } else {
        Write-Host "❌ $file`: MISSING" -ForegroundColor Red
    }
}

# Check assets
Write-Host ""
Write-Host "📦 Checking Assets:" -ForegroundColor Blue
foreach ($asset in $requiredAssets) {
    $assetPath = Join-Path $clientDir $asset
    $assetFiles = Get-ChildItem -Path $assetPath -ErrorAction SilentlyContinue
    if ($assetFiles) {
        Write-Host "✅ $asset`: $($assetFiles.Count) files found" -ForegroundColor Green
    } else {
        Write-Host "❌ $asset`: No files found" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Test API endpoints
Write-Host "🔌 TEST 3: API Endpoint Test" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow

try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Health Endpoint: RESPONDING" -ForegroundColor Green
    Write-Host "   Status: $($healthResponse.status)" -ForegroundColor Gray
    Write-Host "   Uptime: $($healthResponse.uptime) seconds" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health Endpoint: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Test client accessibility
Write-Host "🌐 TEST 4: Client Accessibility Test" -ForegroundColor Yellow
Write-Host "------------------------------------" -ForegroundColor Yellow

try {
    $clientResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 5
    if ($clientResponse.StatusCode -eq 200) {
        Write-Host "✅ Client Server: ACCESSIBLE" -ForegroundColor Green
        Write-Host "   Status Code: $($clientResponse.StatusCode)" -ForegroundColor Gray
        Write-Host "   Content Length: $($clientResponse.Content.Length) characters" -ForegroundColor Gray
    } else {
        Write-Host "⚠️ Client Server: Unexpected Status - $($clientResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Client Server: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Check responsive system
Write-Host "📱 TEST 5: Responsive System Check" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

# Check if responsive hook exists in built files
$jsFiles = Get-ChildItem -Path ".\client\assets\*.js" | Where-Object { $_.Name -like "*index*" }
$responsiveSystemFound = $false

foreach ($jsFile in $jsFiles) {
    $content = Get-Content $jsFile.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content.Contains("useResponsive")) {
        $responsiveSystemFound = $true
        Write-Host "✅ Responsive System: FOUND in $($jsFile.Name)" -ForegroundColor Green
        break
    }
}

if (-not $responsiveSystemFound) {
    Write-Host "❌ Responsive System: NOT FOUND in built files" -ForegroundColor Red
}

Write-Host ""

# Test 6: Check POS components
Write-Host "🛒 TEST 6: POS Components Check" -ForegroundColor Yellow
Write-Host "---------------------------------" -ForegroundColor Yellow

$posComponents = @(
    "POSPage",
    "POSMenu", 
    "POSCart",
    "POSPayment"
)

foreach ($component in $posComponents) {
    $componentFound = $false
    foreach ($jsFile in $jsFiles) {
        $content = Get-Content $jsFile.FullName -Raw -ErrorAction SilentlyContinue
        if ($content -and $content.Contains($component)) {
            $componentFound = $true
            Write-Host "✅ $component`: FOUND in $($jsFile.Name)" -ForegroundColor Green
            break
        }
    }
    
    if (-not $componentFound) {
        Write-Host "❌ $component`: NOT FOUND in built files" -ForegroundColor Red
    }
}

Write-Host ""

# Test 7: Check alert system
Write-Host "🚨 TEST 7: Alert System Check" -ForegroundColor Yellow
Write-Host "-------------------------------" -ForegroundColor Yellow

$alertSystemFound = $false
foreach ($jsFile in $jsFiles) {
    $content = Get-Content $jsFile.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content.Contains("AlertBanner")) {
        $alertSystemFound = $true
        Write-Host "✅ Alert System: FOUND in $($jsFile.Name)" -ForegroundColor Green
        break
    }
}

if (-not $alertSystemFound) {
    Write-Host "❌ Alert System: NOT FOUND in built files" -ForegroundColor Red
}

Write-Host ""

# Test 8: Check cart system
Write-Host "🛍️ TEST 8: Cart System Check" -ForegroundColor Yellow
Write-Host "-------------------------------" -ForegroundColor Yellow

$cartSystemFound = $false
foreach ($jsFile in $jsFiles) {
    $content = Get-Content $jsFile.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content.Contains("useCartStore")) {
        $cartSystemFound = $true
        Write-Host "✅ Cart System: FOUND in $($jsFile.Name)" -ForegroundColor Green
        break
    }
}

if (-not $cartSystemFound) {
    Write-Host "❌ Cart System: NOT FOUND in built files" -ForegroundColor Red
}

Write-Host ""

# Summary
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan

$totalTests = 8
$passedTests = 0

# Count passed tests (simplified logic)
if ($clientStatus) { $passedTests++ }
if ($apiStatus) { $passedTests++ }
if ($responsiveSystemFound) { $passedTests++ }
if ($alertSystemFound) { $passedTests++ }
if ($cartSystemFound) { $passedTests++ }

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor Red

Write-Host ""
Write-Host "🎯 SYSTEM STATUS:" -ForegroundColor Cyan
if ($passedTests -eq $totalTests) {
    Write-Host "✅ ALL SYSTEMS OPERATIONAL" -ForegroundColor Green
} elseif ($passedTests -gt ($totalTests / 2)) {
    Write-Host "⚠️ PARTIALLY OPERATIONAL" -ForegroundColor Yellow
} else {
    Write-Host "❌ SYSTEM ISSUES DETECTED" -ForegroundColor Red
}

Write-Host ""
Write-Host "🌐 Access your system at:" -ForegroundColor Cyan
Write-Host "   Client: http://localhost:3000" -ForegroundColor White
Write-Host "   API: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "📱 Test responsive features by resizing your browser window!" -ForegroundColor Cyan
Write-Host ""

# Wait for user input
Read-Host "Press Enter to continue"
