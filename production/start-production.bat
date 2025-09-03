@echo off
echo ========================================
echo    SMOOCHO BILL - PRODUCTION STARTUP
echo ========================================
echo.

echo [1/4] Stopping any existing processes...
taskkill /f /im python.exe 2>nul
taskkill /f /im node.exe 2>nul
echo ✅ Processes stopped
echo.

echo [2/4] Starting API Server (Port 5000)...
cd server
start "API Server" cmd /k "npm start"
echo ✅ API Server started
echo.

echo [3/4] Waiting for API server to initialize...
timeout /t 8 /nobreak >nul
echo ✅ Wait complete
echo.

echo [4/4] Starting Client Server (Port 3000)...
cd ..\client
start "Client Server" cmd /k "python server.py"
echo ✅ Client Server started
echo.

echo [5/5] Waiting for client server to initialize...
timeout /t 5 /nobreak >nul
echo ✅ Wait complete
echo.

echo ========================================
echo           STARTUP COMPLETE!
echo ========================================
echo.
echo 🌐 Client: http://localhost:3000
echo 🔗 API: http://localhost:5000
echo 📱 Health: http://localhost:5000/health
echo.
echo 🚀 Opening browser...
start http://localhost:3000
echo.
echo 📋 Check the command windows for any errors
echo 🔄 Both servers are now running
echo.
pause
