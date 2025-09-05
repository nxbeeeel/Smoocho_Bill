import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBj7tgf_gqUzNRwge4D2cxWuxr3zKOHNXk",
  authDomain: "beloop-pos.firebaseapp.com",
  projectId: "beloop-pos",
  storageBucket: "beloop-pos.firebasestorage.app",
  messagingSenderId: "400302967243",
  appId: "1:400302967243:web:e239108515e94b2ab74e4e",
  measurementId: "G-S70VL8QCBH"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const db = getFirestore(app)
export const auth = getAuth(app)

export default app
