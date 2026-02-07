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
const HOST = process.env.HOST || 'localhost';

// Debug ENV
console.log("🔑 Gemini API Key:", process.env.GEMINI_API_KEY ? "SET" : "NOT SET");
console.log("🗄 Mongo URI:", process.env.MONGODB_URI ? "SET" : "NOT SET");

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://tapaal-frontend.vercel.app'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ensure upload folders exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../uploads');
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
app.listen(PORT, HOST, () => {
  console.log(`🚀 Tapaal Server is running on http://${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/api/health`);
  console.log(`📧 Inward Mails API: http://${HOST}:${PORT}/api/inward-mails`);
  console.log(`📤 Outward Mails API: http://${HOST}:${PORT}/api/outward-mails`);
  console.log(`🏢 Departments API: http://${HOST}:${PORT}/api/departments`);
  console.log(`👥 Users API: http://${HOST}:${PORT}/api/users`);
});

module.exports = app;
