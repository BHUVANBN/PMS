// test-server.js - Simple backend test script
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testBackend() {
  console.log('🚀 Starting backend tests...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/`);
    const healthText = await healthResponse.text();
    console.log(`   ✅ Health check: ${healthText}\n`);

    // Test 2: Register admin user
    console.log('2. Testing user registration...');
    const registerData = {
      username: 'testadmin',
      email: 'testadmin@example.com',
      password: 'TestAdmin@123',
      firstName: 'Test',
      lastName: 'Admin',
      role: 'admin'
    };

    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    if (registerResponse.ok) {
      const registerResult = await registerResponse.json();
      console.log('   ✅ Registration successful');
      console.log(`   Token: ${registerResult.token?.substring(0, 20)}...`);
      
      // Test 3: Login
      console.log('\n3. Testing login...');
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testadmin',
          password: 'TestAdmin@123'
        })
      });

      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        const token = loginResult.token;
        console.log('   ✅ Login successful');
        
        // Test 4: Protected route
        console.log('\n4. Testing protected route...');
        const usersResponse = await fetch(`${BASE_URL}/api/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (usersResponse.ok) {
          const usersResult = await usersResponse.json();
          console.log('   ✅ Protected route accessible');
          console.log(`   Found ${usersResult.data?.users?.length || 0} users`);
        } else {
          console.log('   ❌ Protected route failed:', await usersResponse.text());
        }

        // Test 5: Project creation
        console.log('\n5. Testing project creation...');
        const projectData = {
          name: 'Test Project',
          description: 'A test project for backend validation',
          startDate: '2025-01-01',
          status: 'planning'
        };

        const projectResponse = await fetch(`${BASE_URL}/api/projects`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(projectData)
        });

        if (projectResponse.ok) {
          const projectResult = await projectResponse.json();
          console.log('   ✅ Project creation successful');
          console.log(`   Project ID: ${projectResult.data?._id}`);
        } else {
          console.log('   ❌ Project creation failed:', await projectResponse.text());
        }

      } else {
        console.log('   ❌ Login failed:', await loginResponse.text());
      }

    } else {
      const errorText = await registerResponse.text();
      if (errorText.includes('already exists')) {
        console.log('   ⚠️  User already exists, trying login...');
        
        // Try login instead
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'testadmin',
            password: 'TestAdmin@123'
          })
        });

        if (loginResponse.ok) {
          console.log('   ✅ Login with existing user successful');
        } else {
          console.log('   ❌ Login failed:', await loginResponse.text());
        }
      } else {
        console.log('   ❌ Registration failed:', errorText);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the backend server is running on port 5000');
    console.log('💡 Make sure MongoDB is connected');
    console.log('💡 Make sure JWT_SECRET is set in .env file');
  }

  console.log('\n🏁 Backend tests completed!');
}

// Run tests if this file is executed directly
if (process.argv[1].endsWith('test-server.js')) {
  testBackend();
}

export default testBackend;
