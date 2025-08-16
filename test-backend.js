const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testBackend() {
  console.log('🧪 Testing Backend API...\n');

  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    console.log('\n2. Testing registration...');
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPass123'
    };

    const registerResponse = await axios.post(`${API_URL}/auth/register`, registerData);
    console.log('✅ Registration successful:', registerResponse.data.message);
    
    const token = registerResponse.data.data.token;
    console.log('Token received:', token ? 'Yes' : 'No');

    console.log('\n3. Testing login...');
    const loginData = {
      email: 'test@example.com',
      password: 'TestPass123'
    };

    const loginResponse = await axios.post(`${API_URL}/auth/login`, loginData);
    console.log('✅ Login successful:', loginResponse.data.message);

    console.log('\n4. Testing tasks endpoint with auth...');
    const tasksResponse = await axios.get(`${API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Tasks endpoint working:', tasksResponse.data.success);
    console.log('Tasks count:', tasksResponse.data.data.tasks.length);
    console.log('Stats:', tasksResponse.data.data.stats);

    console.log('\n5. Testing task creation...');
    const newTask = {
      title: 'Test Task',
      description: 'This is a test task',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    const createTaskResponse = await axios.post(`${API_URL}/tasks`, newTask, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Task creation successful:', createTaskResponse.data.message);

    console.log('\n6. Testing tasks endpoint again...');
    const tasksResponse2 = await axios.get(`${API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Tasks endpoint working after creation:', tasksResponse2.data.success);
    console.log('Tasks count:', tasksResponse2.data.data.tasks.length);

    console.log('\n🎉 All tests passed! Backend is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('Authentication error - check JWT_SECRET and token generation');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('Connection refused - make sure backend is running on port 5000');
    }
  }
}

testBackend();




