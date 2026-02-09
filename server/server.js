require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

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

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://tapaal-frontend.vercel.app"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

app.use(express.json({
  type: ['application/json', 'text/plain'],
  limit: '10mb'
}));
app.use(express.urlencoded({
  extended: true,
  parameterLimit: 1000,
  limit: '10mb'
}));

// Set UTF-8 encoding for responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use('/api/chatbot', chatbotRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure upload folders exist
const uploadsDir = path.join(__dirname, 'uploads');
const inwardDir = path.join(uploadsDir, 'inward');
const outwardDir = path.join(uploadsDir, 'outward');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(inwardDir)) fs.mkdirSync(inwardDir, { recursive: true });
if (!fs.existsSync(outwardDir)) fs.mkdirSync(outwardDir, { recursive: true });

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
    timestamp: new Date().toISOString()
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});