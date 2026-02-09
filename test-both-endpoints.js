const http = require('http');

// Test both /api/chatbot and /api/chatbot/chat
function testEndpoint(path, label) {
    const requestData = JSON.stringify({
        message: "hello"
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': requestData.length
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log(`\n=== ${label} ===`);
            console.log(`Status: ${res.statusCode}`);
            console.log('Response:', data);
            
            try {
                const parsed = JSON.parse(data);
                if (parsed.reply) {
                    console.log('✅ SUCCESS: Using "reply" field');
                } else if (parsed.response) {
                    console.log('⚠️  Using old "response" field');
                } else {
                    console.log('❌ Unknown response format');
                }
            } catch (e) {
                console.log('❌ ERROR: Invalid JSON response');
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Request error: ${e.message}`);
    });

    req.write(requestData);
    req.end();
}

console.log('🧪 Testing both endpoints...');

// Test /api/chatbot (what frontend calls)
testEndpoint('/api/chatbot', 'POST /api/chatbot');

// Test /api/chatbot/chat (what might be expected)
setTimeout(() => {
    testEndpoint('/api/chatbot/chat', 'POST /api/chatbot/chat');
}, 1000);
