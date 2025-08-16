const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testDashboardFix() {
  console.log('🧪 Testing Dashboard Fix...\n');

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

    console.log('\n2. Testing tasks endpoint with empty parameters...');
    const tasksResponse = await axios.get(`${API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        status: '',
        priority: '',
        search: '',
        sort: '',
        order: ''
      }
    });

    console.log('✅ Tasks endpoint working with empty parameters');
    console.log('Response status:', tasksResponse.status);
    console.log('Tasks count:', tasksResponse.data.data.tasks.length);
    console.log('Stats:', tasksResponse.data.data.stats);

    console.log('\n3. Creating a test task...');
    const taskData = {
      title: 'Test Task',
      description: 'This is a test task',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isImportant: false,
      tags: ['test']
    };

    const createResponse = await axios.post(`${API_URL}/tasks`, taskData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Task created successfully');
    console.log('Task ID:', createResponse.data.data.task._id);

    console.log('\n4. Testing tasks endpoint again...');
    const tasksResponse2 = await axios.get(`${API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Tasks endpoint working after task creation');
    console.log('Tasks count:', tasksResponse2.data.data.tasks.length);
    console.log('Stats:', tasksResponse2.data.data.stats);

    console.log('\n🎉 Dashboard fix test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('Validation error - check the parameters');
      console.log('Error details:', error.response.data);
    } else if (error.response?.status === 401) {
      console.log('Authentication error - check token');
    }
  }
}

testDashboardFix();



