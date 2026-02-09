const https = require('https');

// Test Render health endpoint
function testRenderHealth() {
    const options = {
        hostname: 'tapaal-backend.onrender.com',
        port: 443,
        path: '/api/health',
        method: 'GET'
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log('=== Render Health Check ===');
            console.log(`Status: ${res.statusCode}`);
            console.log('Response:', data);
            
            try {
                const parsed = JSON.parse(data);
                if (parsed.message && parsed.message.includes('Tapaal Server is running')) {
                    console.log('✅ Render backend is healthy and updated');
                } else {
                    console.log('⚠️  Unexpected health response');
                }
            } catch (e) {
                console.log('❌ Invalid health response');
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Health check error: ${e.message}`);
    });

    req.end();
}

console.log('🏥 Testing Render health endpoint...');
testRenderHealth();
