// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/waffer-1b16d/us-central1/api';

console.log('🔍 Running Firebase Functions health check...');
console.log('📋 API URL:', API_URL);

async function runHealthCheck() {
  try {
    // Test ping endpoint
    console.log('🔄 Testing ping endpoint...');
    const pingResponse = await axios.get(`${API_URL}/ping`);
    
    if (pingResponse.status === 200 && pingResponse.data === 'pong') {
      console.log('✅ Ping endpoint is working correctly');
    } else {
      console.error('❌ Ping endpoint returned unexpected response:', pingResponse.data);
      process.exit(1);
    }
    
    // Test users endpoint (requires authentication)
    console.log('🔄 Testing users endpoint...');
    try {
      await axios.get(`${API_URL}/users`);
      console.log('⚠️ Users endpoint did not require authentication as expected');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Users endpoint correctly requires authentication');
      } else {
        console.error('❌ Users endpoint returned unexpected error:', error.message);
      }
    }
    
    console.log('✅ Firebase Functions health check completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Firebase Functions health check failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

runHealthCheck();
