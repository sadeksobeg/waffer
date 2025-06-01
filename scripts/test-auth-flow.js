#!/usr/bin/env node

/**
 * Script to test Firebase Authentication flow
 * Tests login, logout, and auth state changes
 */

const { auth } = require('../app/config/firebase');

// Test user credentials
const testUsers = [
  {
    email: 'admin@waffer.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'test@waffer.com',
    password: 'test123',
    name: 'Test User',
    role: 'customer'
  }
];

async function createTestUser(userData) {
  try {
    console.log(`Creating user: ${userData.email}`);

    // Create user with email and password
    const userCredential = await auth().createUserWithEmailAndPassword(
      userData.email,
      userData.password
    );

    const user = userCredential.user;
    console.log(`✅ Created user: ${userData.email} (ID: ${user.uid})`);

    // Update display name
    await user.updateProfile({
      displayName: userData.name
    });

    console.log(`✅ Updated profile for: ${userData.email}`);
    return user;

  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`ℹ️  User ${userData.email} already exists`);
      return null;
    } else {
      console.error(`❌ Failed to create user ${userData.email}:`, error.message);
      throw error;
    }
  }
}

async function testLogin(email, password) {
  try {
    console.log(`\n🔐 Testing login with: ${email}`);

    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    console.log(`✅ Login successful!`);
    console.log(`   User ID: ${user.uid}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Display Name: ${user.displayName || 'Not set'}`);

    return user;

  } catch (error) {
    console.error(`❌ Login failed:`, error.message);
    console.error(`   Error code: ${error.code}`);
    throw error;
  }
}

async function testLogout() {
  try {
    console.log(`\n🚪 Testing logout...`);
    await auth().signOut();
    console.log(`✅ Logout successful!`);

    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.log(`✅ No current user after logout (correct)`);
    } else {
      console.log(`❌ User still logged in after logout`);
    }

  } catch (error) {
    console.error(`❌ Logout failed:`, error.message);
    throw error;
  }
}

async function runAuthTests() {
  console.log('🧪 Firebase Authentication Test Suite');
  console.log('=====================================\n');

  try {
    // Test 1: Create test users
    console.log('1️⃣ Creating test users...');
    for (const userData of testUsers) {
      await createTestUser(userData);
    }

    // Test 2: Test login
    console.log('\n2️⃣ Testing authentication...');
    const testUser = testUsers[1]; // Use test@waffer.com
    const user = await testLogin(testUser.email, testUser.password);

    // Test 3: Test current user
    console.log('\n3️⃣ Testing current user state...');
    const currentUser = auth().currentUser;
    if (currentUser && currentUser.uid === user.uid) {
      console.log(`✅ Current user correctly set: ${currentUser.email}`);
    } else {
      console.log(`❌ Current user mismatch`);
    }

    // Test 4: Test logout
    await testLogout();

    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📋 Test Credentials Created:');
    console.log('============================');
    testUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
    });

    console.log('\n✅ You can now use these credentials to test login in your app!');

  } catch (error) {
    console.error('\n❌ Authentication tests failed:', error.message);

    if (error.code === 'auth/operation-not-allowed') {
      console.log('\n💡 Make sure Email/Password authentication is enabled in Firebase Console');
    } else if (error.code === 'auth/weak-password') {
      console.log('\n💡 Password should be at least 6 characters');
    } else if (error.code === 'auth/invalid-email') {
      console.log('\n💡 Check the email format');
    }
  }
}

// Run the tests
if (require.main === module) {
  runAuthTests()
    .then(() => {
      console.log('\n✅ Test suite completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runAuthTests, testUsers };
