// Firebase configuration for Vercel deployment
// This file should be placed in your Vercel project root

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = {
  "type": "service_account",
  "project_id": "beloop-pos",
  "private_key_id": "YOUR_PRIVATE_KEY_ID", // You need to get this from Firebase Console
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n", // You need to get this from Firebase Console
  "client_email": "firebase-adminsdk-xxxxx@beloop-pos.iam.gserviceaccount.com", // You need to get this from Firebase Console
  "client_id": "YOUR_CLIENT_ID", // You need to get this from Firebase Console
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40beloop-pos.iam.gserviceaccount.com"
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://beloop-pos-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = {
  admin,
  db,
  auth
};
