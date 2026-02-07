const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const inwardMailsRoutes = require('./routes/inwardMails');
const outwardMailsRoutes = require('./routes/outwardMails');
const departmentsRoutes = require('./routes/departments');
const usersRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const chatbotRoutes = require('./routes/chatbot');

const app = express();
const PORT = process.env.PORT || 5000;

// Debug ENV
console.log("🔑 Gemini API Key:", process.env.GEMINI_API_KEY ? "SET" : "NOT SET");
console.log("🗄 Mongo URI:", process.env.MONGODB_URI ? "SET" : "NOT SET");

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://tapaal-frontend.vercel.app', 'https://tapaal.vercel.app'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

// Connect to DB before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }
});

// Routes
app.use('/api/inward-mails', inwardMailsRoutes);
app.use('/api/outward-mails', outwardMailsRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Tapaal Server is running',
    timestamp: new Date().toISOString(),
    connected: isConnected
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Only start server if not in serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Tapaal Server is running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
