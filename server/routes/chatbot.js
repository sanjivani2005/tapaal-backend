const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// MongoDB Models
const InwardMail = require('../models/InwardMail');
const OutwardMail = require('../models/OutwardMail');
const User = require('../models/User');
const Department = require('../models/Department');
const ChatbotConversation = require('../models/ChatbotConversation'); // For future conversation history

// Gemini Init (STABLE MODEL)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let model = null;

// Initialize Gemini safely
try {
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('✅ Gemini AI initialized successfully');
} catch (error) {
    console.error('❌ Gemini AI initialization failed:', error.message);
}

// Debug: Check API Key
console.log('🔑 Gemini API Key:', process.env.GEMINI_API_KEY ? 'Set' : 'NOT SET');

router.post('/chat', async (req, res) => {
    try {
        console.log('🤖 Chatbot request received:', req.body);
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ response: 'Message is required' });
        }

        const lower = message.toLowerCase();

        /* ===============================
           1️⃣ GREETING (NO AI) - FAST & RELIABLE
        =============================== */
        if (['hello', 'hi', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening'].some(w => lower.includes(w))) {
            return res.json({
                response: '👋 Hello! I am your Tapaal Mail Management Assistant. How can I help you today?\n\n💡 Try: "show users", "show statistics", "show inward mails", "help"'
            });
        }

        /* ===============================
           2️⃣ HELP (NO AI) - INSTANT RESPONSE
        =============================== */
        if (['help', 'what can you do', 'commands', 'features'].some(w => lower.includes(w))) {
            return res.json({
                response: '🤖 **Tapaal Assistant Commands:**\n\n' +
                    '👥 **Users:** "show users", "user list", "how many users"\n' +
                    '📥 **Inward Mails:** "show inward mails", "inward mail list"\n' +
                    '📤 **Outward Mails:** "show outward mails", "outward mail list"\n' +
                    '📊 **Statistics:** "show statistics", "system status", "how many"\n' +
                    '🏢 **Departments:** "show departments", "department list"\n' +
                    '❓ **Questions:** Ask anything about the system!\n\n' +
                    '💡 Just type naturally, I\'ll understand! 🚀'
            });
        }

        /* ===============================
           3️⃣ USERS (NO AI) ✅ ALREADY WORKS
        =============================== */
        if (lower.includes('user')) {
            console.log('🎯 User intent detected - using direct DB query');
            const users = await User.find().lean();

            if (!users.length) {
                return res.json({ response: '👥 No users found in the system.' });
            }

            const userText = users.map(u =>
                `• ${u.fullName || u.name || 'Unknown'} (${u.email || 'N/A'}) - Role: ${u.role || 'User'}, Dept: ${u.department || 'N/A'}, Status: ${u.isActive ? '✅ Active' : '❌ Inactive'}`
            ).join('\n');

            return res.json({
                response: `👥 **Users List** (${new Date().toLocaleTimeString()})\n\n${userText}\n\n**Total:** ${users.length} users`
            });
        }

        /* ===============================
           4️⃣ INWARD MAILS (NO AI)
        =============================== */
        if (lower.includes('inward')) {
            console.log('📥 Inward mail intent detected - using direct DB query');
            const mails = await InwardMail.find().populate('department').lean();

            if (!mails.length) {
                return res.json({ response: '📥 No inward mails found in the system.' });
            }

            const mailText = mails.map(m =>
                `• ${m.mailId || m._id}\n  📧 Subject: ${m.subject || m.details || 'No Subject'}\n  👤 Sender: ${m.sender || 'Unknown'}\n  🏢 Dept: ${m.department?.name || 'N/A'}\n  📊 Status: ${m.status || 'Unknown'}\n  ⚡ Priority: ${m.priority || 'Normal'}`
            ).join('\n\n');

            return res.json({
                response: `📥 **Inward Mails** (${new Date().toLocaleTimeString()})\n\n${mailText}\n\n**Total:** ${mails.length} inward mails`
            });
        }

        /* ===============================
           5️⃣ OUTWARD MAILS (NO AI)
        =============================== */
        if (lower.includes('outward')) {
            console.log('📤 Outward mail intent detected - using direct DB query');
            const mails = await OutwardMail.find().populate('department').lean();

            if (!mails.length) {
                return res.json({ response: '📤 No outward mails found in the system.' });
            }

            const mailText = mails.map(m =>
                `• ${m.mailId || m._id}\n  📧 Subject: ${m.subject || 'No Subject'}\n  👤 Receiver: ${m.receiver || 'Unknown'}\n  🏢 Dept: ${m.department?.name || 'N/A'}\n  📊 Status: ${m.status || 'Unknown'}\n  ⚡ Priority: ${m.priority || 'Normal'}`
            ).join('\n\n');

            return res.json({
                response: `📤 **Outward Mails** (${new Date().toLocaleTimeString()})\n\n${mailText}\n\n**Total:** ${mails.length} outward mails`
            });
        }

        /* ===============================
           6️⃣ DEPARTMENTS (NO AI)
        =============================== */
        if (lower.includes('department')) {
            console.log('🏢 Department intent detected - using direct DB query');
            const departments = await Department.find().lean();

            if (!departments.length) {
                return res.json({ response: '🏢 No departments found in the system.' });
            }

            const deptText = departments.map(d =>
                `• ${d.name || 'Unknown'} (${d.code || 'N/A'})\n  👤 Head: ${d.head || 'N/A'}\n  📊 Status: ${d.status || 'Unknown'}`
            ).join('\n\n');

            return res.json({
                response: `🏢 **Departments** (${new Date().toLocaleTimeString()})\n\n${deptText}\n\n**Total:** ${departments.length} departments`
            });
        }

        /* ===============================
           7️⃣ STATISTICS (NO AI)
        =============================== */
        if (['statistics', 'stats', 'system status', 'how many', 'count', 'total'].some(w => lower.includes(w))) {
            console.log('📊 Statistics intent detected - using direct DB query');

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

            const stats = {
                totalInwardMails: inwardMails.length,
                totalOutwardMails: outwardMails.length,
                totalUsers: users.length,
                totalDepartments: departments.length,
                activeUsers: users.filter(u => u.isActive).length,
                inactiveUsers: users.filter(u => !u.isActive).length,
                totalMails: inwardMails.length + outwardMails.length
            };

            return res.json({
                response: `📊 **System Statistics** (${new Date().toLocaleTimeString()})\n\n` +
                    `👥 **Users:** ${stats.totalUsers} (${stats.activeUsers} active, ${stats.inactiveUsers} inactive)\n` +
                    `📥 **Inward Mails:** ${stats.totalInwardMails}\n` +
                    `📤 **Outward Mails:** ${stats.totalOutwardMails}\n` +
                    `📧 **Total Mails:** ${stats.totalMails}\n` +
                    `🏢 **Departments:** ${stats.totalDepartments}\n\n` +
                    `💡 System is running perfectly! 🚀`
            });
        }

        /* ===============================
           8️⃣ AI (ONLY FOR OPEN QUESTIONS)
        =============================== */
        if (!model) {
            return res.json({
                response: '🤖 AI service is not configured right now. Please try:\n\n' +
                    '• "show users" - See all users\n' +
                    '• "show statistics" - See system stats\n' +
                    '• "help" - See all commands'
            });
        }

        console.log('🧠 Using AI for complex query...');

        // Simple AI prompt for open questions
        const prompt = `You are a helpful assistant for a Government Tapaal (Mail Management) System.

The system has:
- Users with roles and departments
- Inward and outward mails with tracking
- Multiple departments
- Mail priority and status tracking

User question: "${message}"

Please provide a helpful, brief answer about the Tapaal system. If you're not sure about specific data, suggest they use "show statistics" or "help" commands.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        console.log('🤖 AI response sent successfully');
        return res.json({ response: responseText });

    } catch (error) {
        console.error('🔥 GEMINI ERROR:', error);
        console.error('🔥 ERROR STACK:', error.stack);

        // Check for specific Gemini errors
        if (error.message?.includes('API_KEY')) {
            return res.json({
                response: '🔑 Gemini API key issue. Please check configuration.\n\n' +
                    '💡 You can still use: "show users", "show statistics", "help"'
            });
        }

        if (error.message?.includes('quota')) {
            return res.json({
                response: '📊 AI quota exceeded. Please try again later.\n\n' +
                    '💡 You can still use: "show users", "show statistics", "help"'
            });
        }

        // Generic fallback
        return res.json({
            response: '🤖 AI service temporarily unavailable.\n\n' +
                '💡 Try these commands:\n' +
                '• "show users" - See all users\n' +
                '• "show statistics" - System overview\n' +
                '• "help" - All available commands\n' +
                '• "hello" - Start conversation'
        });
    }
});

module.exports = router;
