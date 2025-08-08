// Simple test script for the GHL API server
import https from 'https';

const testData = {
  input: "create a contact named John Smith with email john.smith@example.com"
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'ghlmcp-production.up.railway.app',
  port: 443,
  path: '/execute-agent',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing /execute-agent endpoint...');
console.log('📤 Sending data:', testData);

const req = https.request(options, (res) => {
  console.log(`📥 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📄 Response:');
    try {
      const jsonResponse = JSON.parse(data);
      console.log(JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
});

req.write(postData);
req.end();
