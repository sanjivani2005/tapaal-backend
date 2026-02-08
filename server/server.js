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
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://tapaal-frontend.vercel.app"
  ],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    // Updated MongoDB connection options for newer versions
    const options = {
      maxPoolSize: 10, // Connection pooling for serverless
      serverSelectionTimeoutMS: 5000, // Faster timeout
      socketTimeoutMS: 45000, // Socket timeout
      bufferCommands: true, // Enable buffering for serverless functions
    };

    await mongoose.connect(process.env.MONGODB_URI, {
      ...options,
      dbName: "tapaal"
    });
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Don't throw error in serverless, just log it
    isConnected = false;
    throw error; // Re-throw to let middleware handle it
  }
};

// Connect to DB before handling requests
app.use(async (req, res, next) => {
  try {
    // For serverless, always ensure connection is ready
    if (process.env.VERCEL) {
      if (mongoose.connection.readyState !== 1) {
        await connectDB();
      }
    } else if (!isConnected) {
      await connectDB();
    }

    // Final connection check
    if (mongoose.connection.readyState !== 1) {
      throw new Error(`Database not connected. State: ${mongoose.connection.readyState}`);
    }

    next();
  } catch (error) {
    console.error('❌ Database middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Routes
app.use('/api/inward-mails', inwardMailsRoutes);
app.use('/api/outward-mails', outwardMailsRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chatbot', chatbotRoutes);

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

// Only start server if not in production (Vercel serverless)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log("Local server running on", PORT));
}

module.exports = app;
