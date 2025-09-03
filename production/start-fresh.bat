@echo off
echo Starting Smoocho POS System - Fresh Installation
echo.

echo Stopping any existing processes...
taskkill /f /im python.exe 2>nul
taskkill /f /im node.exe 2>nul

echo.
echo Starting API Server...
cd server
start "API Server" cmd /k "npm start"

echo.
echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting Client Server...
cd ..\client
start "Client Server" cmd /k "python -m http.server 3000"

echo.
echo Waiting for client to start...
timeout /t 3 /nobreak >nul

echo.
echo Opening browser...
start http://localhost:3000

echo.
echo System started! Check the command windows for any errors.
echo.
pause
