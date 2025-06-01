import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Connect to emulators in development mode
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
  // Auth emulator
  connectAuthEmulator(auth, 'http://localhost:9099');

  // Firestore emulator
  connectFirestoreEmulator(db, 'localhost', 8080);

  // Storage emulator
  connectStorageEmulator(storage, 'localhost', 9199);

  console.log('Using Firebase emulators');
}

// Initialize Analytics conditionally (only in browser and production)
let analytics = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Helper function to check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  return !!firebaseConfig.apiKey &&
         firebaseConfig.apiKey !== 'AIzaSyDummyKeyForDevelopment123456';
};

export { app, auth, db, storage, analytics };
