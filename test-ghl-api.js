// Test script to verify GHL API endpoints
const fetch = require('node-fetch');

async function testGhlApi() {
  const locationId = process.env.GHL_LOCATION_ID || process.env.GHL_LOCATION_ID_BG || "gMgcCQOGXIn1DK6lCDa7";
  const pit = process.env.PIT_BG || "Pit-f79562d9-d6cd-4c32-bf57-8dde28fda52c";
  
  console.log('Testing GHL API with:');
  console.log('Location ID:', locationId);
  console.log('PIT Token:', pit ? 'Set' : 'Missing');
  
  // Test different endpoint formats
  const endpoints = [
    'https://rest.gohighlevel.com/v1/contacts',
    'https://rest.gohighlevel.com/v1/contacts/upsert',
    'https://rest.gohighlevel.com/contacts',
    'https://rest.gohighlevel.com/contacts/upsert'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${pit}`,
          'locationId': locationId,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Success! Response:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
      } else {
        const error = await response.text();
        console.log('Error:', error.substring(0, 200));
      }
    } catch (error) {
      console.log('Exception:', error.message);
    }
  }
}

testGhlApi().catch(console.error);
