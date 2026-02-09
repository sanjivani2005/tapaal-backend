const http = require('http');

// Test Gemini AI functionality
function testGeminiAI() {
    const requestData = JSON.stringify({
        message: "What is Tapaal system?"
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
                    console.log('✅ SUCCESS: Gemini AI working!');
                    console.log('AI Response:', parsed.reply);
                    
                    // Check if it's a real AI response (not a fallback)
                    if (parsed.reply.includes('Tapaal') && parsed.reply.length > 100) {
                        console.log('✅ Real AI response detected!');
                    } else {
                        console.log('⚠️  Might be a fallback response');
                    }
                } else {
                    console.log('❌ ISSUE: No reply field found');
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

console.log('🧪 Testing Gemini AI with question: "What is Tapaal system?"');
testGeminiAI();
