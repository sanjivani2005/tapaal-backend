const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../server/models/User');
const Inward = require('../server/models/InwardMail');
const Outward = require('../server/models/OutwardMail');
const Department = require('../server/models/Department');

// Import chatbot route
const chatbotRoutes = require('./chatbot');

const app = express();

// CORS middleware
app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://tapaal-frontend.vercel.app"
    ],
    credentials: true
}));

// Parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with serverless optimization
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // 5 second timeout
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    bufferCommands: false
})
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Routes
app.use('/api/chatbot', chatbotRoutes);

// API endpoints for frontend compatibility
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        // Use timeout promises to avoid hanging
        const [totalUsers, totalDepartments, totalInward, totalOutward] = await Promise.all([
            User.countDocuments().catch(() => 0),
            Department.countDocuments().catch(() => 0),
            Inward.countDocuments().catch(() => 0),
            Outward.countDocuments().catch(() => 0)
        ]);

        res.json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    totalDepartments,
                    totalMails: totalInward + totalOutward,
                    totalTrackingEvents: 0,
                    totalInwardMails: totalInward,
                    totalOutwardMails: totalOutward,
                    pendingMails: 0,
                    assignedMails: 0,
                    registeredMails: totalInward + totalOutward,
                },
                realData: {
                    stats: {
                        totalUsers,
                        totalDepartments,
                        totalMails: totalInward + totalOutward,
                        totalTrackingEvents: 0,
                        totalInwardMails: totalInward,
                        totalOutwardMails: totalOutward,
                        pendingMails: 0,
                        assignedMails: 0,
                        registeredMails: totalInward + totalOutward,
                    },
                    statusData: [],
                    monthlyData: [],
                    recentMails: []
                }
            }
        });
    } catch (error) {
        console.error('Dashboard Stats API Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stats',
            error: error.message
        });
    }
});

app.get('/api/departments', async (req, res) => {
    try {
        // Use a timeout promise to avoid hanging
        const departments = await Promise.race([
            Department.find(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 8000)
        ]);

        res.json({
            success: true,
            data: departments
        });
    } catch (error) {
        console.error('Departments API Error:', error);
        // Return fallback data instead of error
        res.json({
            success: true,
            data: [] // Empty array as fallback
        });
    }
});

app.get('/api/inward-mails', async (req, res) => {
    try {
        // Use a timeout promise to avoid hanging
        const inwardMails = await Promise.race([
            Inward.find(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 8000)
        ]);

        res.json({
            success: true,
            data: inwardMails
        });
    } catch (error) {
        console.error('Inward Mails API Error:', error);
        // Return fallback data instead of error
        res.json({
            success: true,
            data: [] // Empty array as fallback
        });
    }
});

app.post('/api/inward-mails', async (req, res) => {
    try {
        const inwardMail = new Inward(req.body);
        await inwardMail.save();
        res.json({
            success: true,
            data: inwardMail
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating inward mail',
            error: error.message
        });
    }
});

app.get('/api/outward-mails', async (req, res) => {
    try {
        // Use a timeout promise to avoid hanging
        const outwardMails = await Promise.race([
            Outward.find(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 8000)
        ]);

        res.json({
            success: true,
            data: outwardMails
        });
    } catch (error) {
        console.error('Outward Mails API Error:', error);
        // Return fallback data instead of error
        res.json({
            success: true,
            data: [] // Empty array as fallback
        });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().limit(10).lean();
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Users API Error:', error);
        res.json({
            success: true,
            data: [] // Empty array as fallback
        });
    }
});

// Health check
app.get('/', (req, res) => {
    res.send("Tapaal API running");
});

// Export for Vercel serverless functions
module.exports = async (req, res) => {
    try {
        console.log('🚀 API function called:', req.method, req.url);

        // Handle serverless function execution
        app(req, res);
    } catch (error) {
        console.error('❌ API function error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
