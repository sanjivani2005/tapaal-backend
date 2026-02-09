const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: './server/.env' });

async function checkAvailableModels() {
    try {
        console.log('🔑 Checking API key:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Try to list models using the REST API directly
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();

        console.log('📋 Available models:');
        if (data.models) {
            data.models.forEach(model => {
                console.log(`- ${model.name} (${model.displayName})`);
            });
        } else {
            console.log('❌ No models found or error:', data);
        }

    } catch (error) {
        console.error('❌ Error checking models:', error);
    }
}

checkAvailableModels();
