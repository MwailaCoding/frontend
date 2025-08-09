// Simple Node.js script to test backend connection
// Run with: node test-backend-connection.js

const https = require('https');

const BACKEND_URL = 'https://hamilton47.pythonanywhere.com';

async function testBackendConnection() {
  console.log('🧪 Testing backend connection...');
  console.log(`🔗 Backend URL: ${BACKEND_URL}`);
  
  const endpoints = [
    '/api/health',
    '/api/products',
    '/api/categories'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const url = `${BACKEND_URL}${endpoint}`;
      console.log(`\n⏳ Testing: ${url}`);
      
      const result = await makeRequest(url);
      
      if (result.success) {
        console.log(`✅ ${endpoint} - Status: ${result.status}`);
        if (result.data) {
          console.log(`📊 Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
        }
      } else {
        console.log(`❌ ${endpoint} - Error: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Exception: ${error.message}`);
    }
  }
}

function makeRequest(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            success: true,
            status: res.statusCode,
            data: jsonData
          });
        } catch (e) {
          resolve({
            success: true,
            status: res.statusCode,
            data: data.substring(0, 200)
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout'
      });
    });
  });
}

// Run the test
testBackendConnection()
  .then(() => {
    console.log('\n🎉 Backend connection test completed!');
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
  });
