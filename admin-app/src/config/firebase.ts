import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Use environment variables if available, otherwise use hardcoded values for development
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD9HFPv5WxDDDSNR7w8NxRKkLxHP0jLjss",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "waffer-1b16d.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "waffer-1b16d",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "waffer-1b16d.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "492077695557",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:492077695557:web:c9b5180c08cbd6b34dd92c",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-TENWT118ZM",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Use emulators in development mode
if (isDevelopment && typeof window !== 'undefined') {
  console.log('Using Firebase emulators in development mode');

  // Uncomment these lines if you're running Firebase emulators locally
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectStorageEmulator(storage, 'localhost', 9199);
}

// Initialize Analytics conditionally (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined' && !isDevelopment) {
  // Check if analytics is supported before initializing
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(error => {
    console.error('Analytics initialization error:', error);
  });
}

export { app, auth, db, storage, messaging, analytics };