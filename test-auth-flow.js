const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow...\n');

  try {
    console.log('1. Registering test user...');
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPass123'
    };

    const registerResponse = await axios.post(`${API_URL}/auth/register`, registerData);
    const token = registerResponse.data.data.token;
    console.log('✅ User registered, token received');

    console.log('\n2. Testing getCurrentUser endpoint...');
    const userResponse = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ getCurrentUser working:', userResponse.data.data.user.name);

    console.log('\n3. Testing tasks endpoint with valid token...');
    const tasksResponse = await axios.get(`${API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Tasks endpoint working with valid token');
    console.log('Tasks count:', tasksResponse.data.data.tasks.length);

    console.log('\n4. Testing with expired/invalid token...');
    const invalidToken = 'invalid.token.here';
    try {
      await axios.get(`${API_URL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${invalidToken}`
        }
      });
      console.log('❌ Should have failed with invalid token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected invalid token');
      } else {
        console.log('❌ Unexpected error with invalid token:', error.response?.status);
      }
    }

    console.log('\n5. Testing logout...');
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Logout endpoint working');
    } catch (error) {
      console.log('⚠️ Logout endpoint not implemented or error:', error.response?.status);
    }

    console.log('\n🎉 Authentication flow test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('Authentication error - check JWT_SECRET and token generation');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('Connection refused - make sure backend is running on port 5000');
    }
  }
}

testAuthFlow();




