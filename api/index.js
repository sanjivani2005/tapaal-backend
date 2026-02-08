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
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    bufferCommands: false
})
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Routes
app.use('/api/chatbot', chatbotRoutes);

// API endpoints with fallback data
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        // Simple approach with individual try-catch for each operation
        let totalUsers = 0;
        let totalDepartments = 0;
        let totalInward = 0;
        let totalOutward = 0;

        try {
            totalUsers = await User.countDocuments();
        } catch (e) {
            console.log('Users count failed:', e.message);
        }

        try {
            totalDepartments = await Department.countDocuments();
        } catch (e) {
            console.log('Departments count failed:', e.message);
        }

        try {
            totalInward = await Inward.countDocuments();
        } catch (e) {
            console.log('Inward count failed:', e.message);
        }

        try {
            totalOutward = await Outward.countDocuments();
        } catch (e) {
            console.log('Outward count failed:', e.message);
        }

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
        let departments = [];
        try {
            departments = await Department.find().limit(10);
        } catch (e) {
            console.log('Departments fetch failed:', e.message);
        }

        res.json({
            success: true,
            data: departments
        });
    } catch (error) {
        console.error('Departments API Error:', error);
        res.json({
            success: true,
            data: []
        });
    }
});

app.get('/api/inward-mails', async (req, res) => {
    try {
        let inwardMails = [];
        try {
            inwardMails = await Inward.find().limit(10);
        } catch (e) {
            console.log('Inward mails fetch failed:', e.message);
        }

        res.json({
            success: true,
            data: inwardMails
        });
    } catch (error) {
        console.error('Inward Mails API Error:', error);
        res.json({
            success: true,
            data: []
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
        let outwardMails = [];
        try {
            outwardMails = await Outward.find().limit(10);
        } catch (e) {
            console.log('Outward mails fetch failed:', e.message);
        }

        res.json({
            success: true,
            data: outwardMails
        });
    } catch (error) {
        console.error('Outward Mails API Error:', error);
        res.json({
            success: true,
            data: []
        });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        let users = [];
        try {
            users = await User.find().limit(10).lean();
        } catch (e) {
            console.log('Users fetch failed:', e.message);
        }

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Users API Error:', error);
        res.json({
            success: true,
            data: []
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
