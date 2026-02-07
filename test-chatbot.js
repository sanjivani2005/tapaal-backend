// Test the updated chatbot route
const http = require('http');

function testChatbot() {
    const requestData = JSON.stringify({
        message: "hello"
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/chatbot/',
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
        });
    });

    req.on('error', (e) => {
        console.error(`Request error: ${e.message}`);
    });

    req.write(requestData);
    req.end();
}

testChatbot();
