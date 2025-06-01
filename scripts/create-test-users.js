#!/usr/bin/env node

/**
 * Script to create test users for Firebase Authentication
 * Run this after enabling Email/Password authentication in Firebase Console
 */

const { auth } = require('../app/config/firebase');

// Test users to create
const testUsers = [
  {
    email: 'admin@waffer.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'merchant@waffer.com', 
    password: 'merchant123',
    name: 'Merchant User',
    role: 'merchant'
  },
  {
    email: 'customer@waffer.com',
    password: 'customer123', 
    name: 'Customer User',
    role: 'customer'
  },
  {
    email: 'test@waffer.com',
    password: 'test123',
    name: 'Test User',
    role: 'customer'
  }
];

async function createTestUsers() {
  console.log('🔥 Creating test users for Firebase Authentication...\n');

  for (const userData of testUsers) {
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
      
      console.log(`✅ Updated profile for: ${userData.email}\n`);
      
    } catch (error) {
      console.error(`❌ Failed to create user ${userData.email}:`, error.message);
      
      if (error.code === 'auth/email-already-in-use') {
        console.log(`ℹ️  User ${userData.email} already exists\n`);
      } else {
        console.log('');
      }
    }
  }
  
  console.log('🎉 Test user creation completed!');
  console.log('\n📋 Test Credentials:');
  console.log('==================');
  testUsers.forEach(user => {
    console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
  });
}

// Run the script
if (require.main === module) {
  createTestUsers()
    .then(() => {
      console.log('\n✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createTestUsers, testUsers };
