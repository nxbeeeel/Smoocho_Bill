@echo off
echo 🚀 Deploying Beloop POS API to Vercel...

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Check if user is logged in
vercel whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 🔐 Please login to Vercel first:
    vercel login
)

REM Create project structure
echo 📁 Creating project structure...
if not exist vercel-api mkdir vercel-api
cd vercel-api

REM Copy API files
echo 📋 Copying API files...
if not exist api mkdir api
copy "..\vercel-api-routes\*.js" "api\"
copy "..\firebase-vercel-config.js" "."
copy "..\vercel-package.json" "package.json"

REM Create vercel.json
echo 📝 Creating vercel.json...
(
echo {
echo   "functions": {
echo     "api/**/*.js": {
echo       "runtime": "nodejs18.x"
echo     }
echo   },
echo   "env": {
echo     "FIREBASE_PROJECT_ID": "@firebase-project-id",
echo     "FIREBASE_PRIVATE_KEY": "@firebase-private-key",
echo     "FIREBASE_CLIENT_EMAIL": "@firebase-client-email", 
echo     "FIREBASE_DATABASE_URL": "@firebase-database-url"
echo   }
echo }
) > vercel.json

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

echo ✅ Deployment complete!
echo 📱 Update your Android app with the new Vercel URL
echo 🔧 Don't forget to set up Firebase and environment variables
pause
