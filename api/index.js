const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./server/models/User');
const Inward = require('./server/models/InwardMail');
const Outward = require('./server/models/OutwardMail');
const Department = require('./server/models/Department');

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

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Routes
app.use('/api/chatbot', chatbotRoutes);

// API endpoints for frontend compatibility
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalDepartments = await Department.countDocuments();
        const totalInward = await Inward.countDocuments();
        const totalOutward = await Outward.countDocuments();

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
        res.status(500).json({
            success: false,
            message: 'Error fetching stats',
            error: error.message
        });
    }
});

app.get('/api/departments', async (req, res) => {
    try {
        const departments = await Department.find();
        res.json({
            success: true,
            data: departments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching departments',
            error: error.message
        });
    }
});

app.get('/api/inward-mails', async (req, res) => {
    try {
        const inwardMails = await Inward.find();
        res.json({
            success: true,
            data: inwardMails
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching inward mails',
            error: error.message
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
        const outwardMails = await Outward.find();
        res.json({
            success: true,
            data: outwardMails
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching outward mails',
            error: error.message
        });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
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
