// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDoc, doc, deleteDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔍 Running Firebase health check...');
console.log('📋 Firebase Configuration:');
console.log('   - Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('   - Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);

// Initialize Firebase
try {
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
  
  // Initialize Firestore
  const db = getFirestore(app);
  console.log('✅ Firestore initialized successfully');
  
  // Run health check
  async function runHealthCheck() {
    try {
      // Write test document
      console.log('📝 Writing test document to Firestore...');
      const healthcheckCollection = collection(db, 'healthcheck');
      const testData = {
        message: 'Health check test document',
        timestamp: new Date(),
      };
      
      const docRef = await addDoc(healthcheckCollection, testData);
      console.log('✅ Successfully wrote test document to Firestore with ID:', docRef.id);
      
      // Read test document
      console.log('📖 Reading test document from Firestore...');
      const docSnap = await getDoc(doc(db, 'healthcheck', docRef.id));
      
      if (docSnap.exists()) {
        console.log('✅ Successfully read test document from Firestore');
        console.log('📄 Document data:', docSnap.data());
      } else {
        console.error('❌ Test document not found in Firestore');
        process.exit(1);
      }
      
      // Delete test document
      console.log('🗑️ Deleting test document from Firestore...');
      await deleteDoc(doc(db, 'healthcheck', docRef.id));
      console.log('✅ Successfully deleted test document from Firestore');
      
      console.log('✅ Firebase health check completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Firebase health check failed:', error);
      process.exit(1);
    }
  }
  
  runHealthCheck();
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error);
  process.exit(1);
}
