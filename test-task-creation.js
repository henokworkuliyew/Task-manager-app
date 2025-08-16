const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testTaskCreation() {
  console.log('🧪 Testing Task Creation...\n');

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

    console.log('\n2. Creating a test task...');
    const taskData = {
      title: 'Test Task',
      description: 'This is a test task to verify creation',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isImportant: false,
      tags: ['test', 'verification']
    };

    const createResponse = await axios.post(`${API_URL}/tasks`, taskData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Task creation response:', createResponse.data);
    console.log('Task ID:', createResponse.data.data.task._id);

    console.log('\n3. Fetching all tasks...');
    const tasksResponse = await axios.get(`${API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Tasks fetched successfully');
    console.log('Total tasks:', tasksResponse.data.data.tasks.length);
    console.log('Tasks:', tasksResponse.data.data.tasks.map(t => ({ id: t._id, title: t.title, status: t.status })));

    console.log('\n4. Creating another task with today\'s date...');
    const todayTask = {
      title: 'Today Task',
      description: 'Task due today',
      status: 'pending',
      priority: 'high',
      dueDate: new Date().toISOString().split('T')[0],
      isImportant: true,
      tags: ['urgent']
    };

    const todayResponse = await axios.post(`${API_URL}/tasks`, todayTask, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Today task created:', todayResponse.data.data.task.title);

    console.log('\n5. Final task count...');
    const finalTasksResponse = await axios.get(`${API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Final task count:', finalTasksResponse.data.data.tasks.length);
    console.log('Stats:', finalTasksResponse.data.data.stats);

    console.log('\n🎉 Task creation test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('Validation error - check the task data format');
    } else if (error.response?.status === 401) {
      console.log('Authentication error - check token');
    }
  }
}

testTaskCreation();



