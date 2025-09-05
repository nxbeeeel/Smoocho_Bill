# Vercel + Firebase Setup Guide for Beloop POS

## 🚀 Complete Setup Instructions

### Step 1: Firebase Project Setup

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Click "Create a project" or use existing project

2. **Enable Firestore Database**
   - Go to "Firestore Database" in Firebase Console
   - Click "Create database"
   - Choose "Start in test mode" (we'll secure it later)
   - Select a location (choose closest to your users)

3. **Enable Authentication**
   - Go to "Authentication" in Firebase Console
   - Click "Get started"
   - Go to "Sign-in method" tab
   - Enable "Email/Password" provider

4. **Create Service Account**
   - Go to "Project Settings" → "Service accounts"
   - Click "Generate new private key"
   - Download the JSON file
   - Keep this file secure!

### Step 2: Vercel Project Setup

1. **Create Vercel Project**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Create new project
   vercel
   ```

2. **Set up Project Structure**
   ```
   your-vercel-project/
   ├── api/
   │   ├── auth/
   │   │   └── login.js
   │   ├── products.js
   │   ├── orders.js
   │   └── sync.js
   ├── firebase-config.js
   ├── package.json
   └── vercel.json
   ```

3. **Install Dependencies**
   ```bash
   npm install firebase-admin cors helmet
   ```

### Step 3: Configure Firebase

1. **Update firebase-config.js**
   - Replace `your-firebase-project-id` with your actual project ID
   - Replace the service account JSON with your downloaded file
   - Update database URL

2. **Set Environment Variables in Vercel**
   ```bash
   # Set Firebase config as environment variables
   vercel env add FIREBASE_PROJECT_ID
   vercel env add FIREBASE_PRIVATE_KEY
   vercel env add FIREBASE_CLIENT_EMAIL
   vercel env add FIREBASE_DATABASE_URL
   ```

### Step 4: Deploy to Vercel

1. **Deploy the API**
   ```bash
   vercel --prod
   ```

2. **Get your Vercel URL**
   - Your API will be available at: `https://your-project.vercel.app/api/`

### Step 5: Update Android App

1. **Update VercelApiService.kt**
   ```kotlin
   // Replace the base URL with your Vercel URL
   .baseUrl("https://your-project.vercel.app/")
   ```

2. **Update Firebase Configuration**
   - Download `google-services.json` from Firebase Console
   - Replace the existing file in `app/google-services.json`

### Step 6: Test the Connection

1. **Test API Endpoints**
   ```bash
   # Test login
   curl -X POST https://your-project.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   
   # Test products
   curl https://your-project.vercel.app/api/products
   ```

2. **Test Android App**
   - Build and run the Android app
   - Check if sync is working
   - Verify data is being saved to Firebase

## 🔧 Configuration Files

### vercel.json
```json
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
```

### Environment Variables
Set these in Vercel dashboard:
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_PRIVATE_KEY`: Your service account private key
- `FIREBASE_CLIENT_EMAIL`: Your service account client email
- `FIREBASE_DATABASE_URL`: Your Firebase database URL

## 🔒 Security Setup

1. **Update Firestore Rules**
   - Copy the rules from `firestore.rules`
   - Go to Firebase Console → Firestore → Rules
   - Paste and publish the rules

2. **Set up Authentication**
   - Create admin user in Firebase Console
   - Update Android app with proper authentication

## 📱 Android App Updates

1. **Update Sync Service**
   - The `VercelSyncService.kt` is already configured
   - Just update the base URL

2. **Test Sync**
   - Run the app
   - Check if data syncs to Firebase
   - Verify offline/online functionality

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Add CORS headers in your API routes
   - Check Vercel function configuration

2. **Firebase Permission Errors**
   - Check Firestore rules
   - Verify service account permissions

3. **Authentication Issues**
   - Check Firebase Auth configuration
   - Verify custom token creation

4. **Sync Not Working**
   - Check network connectivity
   - Verify API endpoints are accessible
   - Check Firebase console for data

## 📊 Monitoring

1. **Vercel Dashboard**
   - Monitor API usage
   - Check function logs
   - Monitor performance

2. **Firebase Console**
   - Monitor Firestore usage
   - Check authentication logs
   - Monitor database performance

## 🎯 Next Steps

1. **Set up monitoring and alerts**
2. **Implement backup strategies**
3. **Add more API endpoints as needed**
4. **Optimize for production use**

## 📞 Support

If you encounter any issues:
1. Check Vercel function logs
2. Check Firebase console
3. Verify environment variables
4. Test API endpoints manually

Your Beloop POS system will now have real-time sync between Android app and Firebase database through Vercel! 🚀
