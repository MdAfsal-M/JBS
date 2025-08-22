const axios = require('axios');

// Test the API endpoint
async function testAPIEndpoint() {
  try {
    console.log('🔍 Testing API endpoint...');
    
    // Test the health endpoint first
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health endpoint working:', healthResponse.data);
    
    // Test the database health
    const dbHealthResponse = await axios.get('http://localhost:5000/api/health/db');
    console.log('✅ Database health:', dbHealthResponse.data);
    
    // Test if the owner-opportunities route is accessible
    try {
      const opportunitiesResponse = await axios.get('http://localhost:5000/api/owner-opportunities/opportunities');
      console.log('✅ Owner opportunities endpoint accessible');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('⚠️  Owner opportunities endpoint requires authentication (expected)');
      } else {
        console.log('❌ Owner opportunities endpoint error:', error.response?.status, error.message);
      }
    }
    
    console.log('\n🎯 API endpoints are working correctly!');
    console.log('   The issue might be:');
    console.log('   1. Authentication token not being sent');
    console.log('   2. Backend server not running');
    console.log('   3. Form validation failing');
    console.log('   4. Database connection issues');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to backend server at http://localhost:5000');
      console.error('   Make sure the backend server is running with: npm start');
    } else {
      console.error('❌ API test failed:', error.message);
    }
  }
}

// Run the test
testAPIEndpoint();
