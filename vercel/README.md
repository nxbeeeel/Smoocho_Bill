# Beloop POS - Vercel API

This is the Vercel API deployment for Beloop POS system.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

3. **Set up Firebase:**
   - Follow the setup guide in `BELOOP_POS_FIREBASE_SETUP.md`
   - Update Firebase service account details in `firebase-bridge.js`

## 📁 Project Structure

```
vercel/
├── api/                    # API routes
│   ├── auth.js            # Authentication
│   ├── products.js        # Products management
│   ├── orders.js          # Orders management
│   ├── sync.js            # Data synchronization
│   └── sync-existing.js   # Existing data sync
├── firebase-bridge.js     # Firebase integration
├── package.json           # Dependencies
├── vercel.json           # Vercel configuration
└── README.md             # This file
```

## 🔧 API Endpoints

- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/sync-existing` - Sync existing data to Firebase
- `POST /api/auth/login` - User authentication

## 🔥 Firebase Integration

This API connects your existing Beloop POS database to Firebase for real-time synchronization with the Android app.

## 📱 Android App Integration

The Android app in `../SmoochoPOS-Android/` will sync with this API to provide real-time data synchronization.
