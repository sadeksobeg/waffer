// React Native Firebase configuration
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

console.log('🔥 Firebase modules loaded');

// Initialize Firebase app if it doesn't exist
const initializeFirebaseApp = () => {
  try {
    // Check if default app exists
    const app = firebase.app();
    console.log('✅ Firebase app already initialized');
    if (app.options && app.options.projectId) {
      console.log('Project ID:', app.options.projectId);
    } else {
      console.log('Project ID: Available after initialization');
    }
    return app;
  } catch (error) {
    console.log('🔧 Initializing Firebase app...');
    try {
      // Initialize with default configuration from google-services.json
      const app = firebase.initializeApp();
      console.log('✅ Firebase app initialized successfully');
      if (app.options && app.options.projectId) {
        console.log('Project ID:', app.options.projectId);
      } else {
        console.log('Project ID: Will be available from google-services.json');
      }
      return app;
    } catch (initError) {
      console.error('❌ Failed to initialize Firebase app:', initError);
      throw initError;
    }
  }
};

// Initialize Firebase
const firebaseApp = initializeFirebaseApp();

// Export Firebase services
export { firebase, auth, firestore, storage };

// Add global test functions for manual testing
(global as any).testFirebaseLogin = async (email: string, password: string) => {
  try {
    console.log(`🧪 Testing login with: ${email}`);
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    console.log(`✅ Login successful!`);
    console.log(`   User ID: ${user.uid}`);
    console.log(`   Email: ${user.email}`);
    return user;
  } catch (error: any) {
    console.error(`❌ Login failed:`, error.message);
    console.error(`   Error code: ${error.code}`);
    throw error;
  }
};

(global as any).testFirestore = async () => {
  try {
    console.log('🧪 Testing Firestore connection...');
    const testDoc = firestore().collection('test').doc('connection');
    await testDoc.set({
      timestamp: new Date(),
      test: true,
      platform: 'mobile',
      device: 'real-device'
    });
    console.log('✅ Firestore write successful');

    const doc = await testDoc.get();
    console.log('✅ Firestore read successful:', doc.data());
    return true;
  } catch (error: any) {
    console.error('❌ Firestore test failed:', error.message);
    return false;
  }
};

(global as any).testCreateCoupon = async () => {
  try {
    console.log('🧪 Testing real coupon creation...');
    const couponData = {
      title: 'Test Mobile Coupon',
      description: 'Created from real mobile device',
      discount: 20,
      code: 'MOBILE20',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(),
      platform: 'mobile-device'
    };

    const couponRef = await firestore().collection('coupons').add(couponData);
    console.log('✅ Real coupon created with ID:', couponRef.id);

    const doc = await couponRef.get();
    console.log('✅ Coupon data verified:', doc.data());
    return couponRef.id;
  } catch (error: any) {
    console.error('❌ Coupon creation failed:', error.message);
    return false;
  }
};

console.log('🧪 Test functions available:');
console.log('  - testFirebaseLogin("test@waffer.com", "test123")');
console.log('  - testFirestore()');
console.log('  - testCreateCoupon()');

// Export a React component as default for Expo Router
export default function FirebaseConfig() {
  return null;
}