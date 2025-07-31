// test-server.js
// Simple test script to verify the server endpoints

const http = require('http');

const PORT = process.env.PORT || 3000;

// Test health endpoint
function testHealth() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: '/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Health check passed:', response);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Test execute-agent endpoint
function testExecuteAgent(action, data = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      action,
      ...data
    });

    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: '/execute-agent',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`✅ ${action} test:`, response.success ? 'PASSED' : 'FAILED');
          if (!response.success) {
            console.log('   Error:', response.error);
          }
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting server tests...\n');

  try {
    // Test health endpoint
    await testHealth();
    console.log('');

    // Test list contacts (should work if default client is configured)
    await testExecuteAgent('list');
    console.log('');

    // Test create contact (will fail without proper data, but tests endpoint)
    await testExecuteAgent('create', {
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: `test+${Date.now()}@example.com`
      }
    });
    console.log('');

    console.log('🎉 All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testHealth, testExecuteAgent }; 