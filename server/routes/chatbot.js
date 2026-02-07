const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// MongoDB Models
const InwardMail = require('../models/InwardMail');
const OutwardMail = require('../models/OutwardMail');
const User = require('../models/User');
const Department = require('../models/Department');

// Load Gemini API Key
if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is not set in .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash'
});

console.log('🔑 Gemini API Key:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                response: 'Message is required'
            });
        }

        const lower = message.toLowerCase();

        // ✅ Direct Intent Example (Users Query)
        if (lower.includes('user')) {
            const users = await User.find().lean();

            if (!users.length) {
                return res.json({
                    success: true,
                    response: '👥 No users found in the system.'
                });
            }

            const userText = users.map(u =>
                `• ${u.fullName || u.name || 'Unknown'}
Email: ${u.email || 'N/A'}
Role: ${u.role || 'User'}
Department: ${u.department || 'N/A'}
Status: ${u.isActive ? 'Active' : 'Inactive'}`
            ).join('\n\n');

            return res.json({
                success: true,
                response: `👥 Users List\n\n${userText}\n\nTotal: ${users.length} users`
            });
        }

        // Fetch DB Data
        const [
            inwardMails,
            outwardMails,
            users,
            departments
        ] = await Promise.all([
            InwardMail.find().lean(),
            OutwardMail.find().lean(),
            User.find().lean(),
            Department.find().lean()
        ]);

        const systemStats = {
            totalInwardMails: inwardMails.length,
            totalOutwardMails: outwardMails.length,
            totalUsers: users.length,
            totalDepartments: departments.length,
            activeUsers: users.filter(u => u.isActive).length
        };

        const prompt = `
You are an intelligent AI assistant for a Government Tapaal (Mail Management) System.

SYSTEM STATISTICS:
- Total Inward Mails: ${systemStats.totalInwardMails}
- Total Outward Mails: ${systemStats.totalOutwardMails}
- Total Users: ${systemStats.totalUsers}
- Active Users: ${systemStats.activeUsers}
- Total Departments: ${systemStats.totalDepartments}

User Question:
"${message}"

Respond professionally and clearly. Always provide helpful guidance.
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return res.json({
            success: true,
            response: responseText
        });

    } catch (error) {
        console.error('🤖 Gemini Error:', error);

        if (error.message?.includes('API_KEY')) {
            return res.status(500).json({
                success: false,
                response: '🔑 Gemini API key configuration issue.'
            });
        }

        if (error.message?.toLowerCase().includes('quota')) {
            return res.status(500).json({
                success: false,
                response: '📊 Gemini quota exceeded. Please try later.'
            });
        }

        return res.status(500).json({
            success: false,
            response: '🤖 AI service error. Please try again.'
        });
    }
});

module.exports = router;
