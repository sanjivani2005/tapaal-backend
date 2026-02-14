const https = require('https');

// Test with cache busting parameter
function testWithCacheBust() {
    const requestData = JSON.stringify({
        message: "hello"
    });

    const timestamp = Date.now();
    const options = {
        hostname: 'tapaal-backend.onrender.com',
        port: 443,
        path: `/api/chatbot?_t=${timestamp}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': requestData.length,
            'Cache-Control': 'no-cache'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            console.log('Headers:', res.headers);
            console.log('Response:', data);
            
            try {
                const parsed = JSON.parse(data);
                if (parsed.reply) {
                    console.log('✅ SUCCESS: Using "reply" field - DEPLOYMENT UPDATED!');
                } else if (parsed.response) {
                    console.log('⚠️  Still using old "response" field - OLD DEPLOYMENT');
                } else {
                    console.log('❌ Unknown response format');
                }
            } catch (e) {
                console.log('❌ Invalid JSON response');
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Request error: ${e.message}`);
    });

    req.write(requestData);
    req.end();
}

console.log('🧪 Testing with cache busting...');
testWithCacheBust();
