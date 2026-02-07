const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

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

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Routes
app.use('/api/chatbot', chatbotRoutes);

// Mock data endpoints for frontend compatibility
app.get('/api/dashboard/stats', (req, res) => {
    res.json({
        success: true,
        data: {
            stats: {
                totalUsers: 0,
                totalDepartments: 0,
                totalMails: 0,
                totalTrackingEvents: 0,
                totalInwardMails: 0,
                totalOutwardMails: 0,
                pendingMails: 0,
                assignedMails: 0,
                registeredMails: 0,
            },
            realData: {
                stats: {
                    totalUsers: 0,
                    totalDepartments: 0,
                    totalMails: 0,
                    totalTrackingEvents: 0,
                    totalInwardMails: 0,
                    totalOutwardMails: 0,
                    pendingMails: 0,
                    assignedMails: 0,
                    registeredMails: 0,
                },
                statusData: [],
                monthlyData: [],
                recentMails: []
            }
        }
    });
});

app.get('/api/departments', (req, res) => {
    res.json({
        success: true,
        data: []
    });
});

app.get('/api/inward-mails', (req, res) => {
    res.json({
        success: true,
        data: []
    });
});

app.get('/api/outward-mails', (req, res) => {
    res.json({
        success: true,
        data: []
    });
});

app.get('/api/users', (req, res) => {
    res.json({
        success: true,
        data: []
    });
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
