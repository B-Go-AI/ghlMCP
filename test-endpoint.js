// test-endpoint.js
// Simple test script to verify the /execute-agent endpoint

const fetch = require('node-fetch');

async function testEndpoint() {
  const testUrl = 'http://localhost:3000/execute-agent';
  
  console.log('🧪 Testing /execute-agent endpoint...');
  console.log(`📍 URL: ${testUrl}`);
  
  const testData = {
    agentName: 'nora',
    clientId: 'client_BG',
    input: 'Create a contact named John Doe with email john.doe@example.com'
  };
  
  console.log('📤 Sending request:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`📥 Response status: ${response.status} ${response.statusText}`);
    
    const result = await response.json();
    console.log('📋 Response body:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Test passed! Endpoint is working correctly.');
    } else {
      console.log('❌ Test failed! Endpoint returned an error.');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running on port 3000');
      console.log('   Run: npm start');
    }
  }
}

// Run the test
testEndpoint();
