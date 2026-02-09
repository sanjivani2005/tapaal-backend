const https = require('https');

// Test the live Render endpoint
function testLiveEndpoint() {
    const requestData = JSON.stringify({
        message: "hello"
    });

    const options = {
        hostname: 'tapaal-backend.onrender.com',
        port: 443,
        path: '/api/chatbot',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': requestData.length
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
                    console.log('✅ SUCCESS: Live endpoint working!');
                    console.log('Reply:', parsed.reply);
                } else if (parsed.response) {
                    console.log('⚠️  Using old "response" field');
                } else if (parsed.error || parsed.message) {
                    console.log('❌ ERROR:', parsed.error || parsed.message);
                } else {
                    console.log('❌ Unknown response format');
                }
            } catch (e) {
                console.log('❌ Invalid JSON:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Request error: ${e.message}`);
    });

    req.write(requestData);
    req.end();
}

console.log('🧪 Testing live Render endpoint...');
testLiveEndpoint();
