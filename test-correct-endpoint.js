const http = require('http');

// Test the correct chatbot endpoint
function testChatbotEndpoint() {
    const requestData = JSON.stringify({
        message: "hello"
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/chatbot',
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
            console.log(`Status: ${res.statusCode}`);
            console.log('Response:', data);
            
            try {
                const parsed = JSON.parse(data);
                if (parsed.reply) {
                    console.log('✅ SUCCESS: Chatbot endpoint working correctly!');
                    console.log('Reply content:', parsed.reply);
                } else if (parsed.response) {
                    console.log('❌ ISSUE: Backend still returning "response" field');
                } else {
                    console.log('❌ ISSUE: No recognizable response field');
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

console.log('🧪 Testing correct chatbot endpoint: /api/chatbot');
testChatbotEndpoint();
