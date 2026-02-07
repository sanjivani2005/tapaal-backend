// const path = require('path');

// require('dotenv').config({
//   path: path.resolve(__dirname, '../.env')
// });

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');


// // Import routes
// const inwardMailsRoutes = require('./routes/inwardMails');
// const outwardMailsRoutes = require('./routes/outwardMails');
// const departmentsRoutes = require('./routes/departments');
// const usersRoutes = require('./routes/users'); // Uncommented
// const dashboardRoutes = require('./routes/dashboard');
// const chatbotRoutes = require('./routes/chatbot');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => {
//     console.log('Connected to MongoDB successfully');
//   })
//   .catch((err) => {
//     console.error('MongoDB connection error:', err);
//     process.exit(1);
//   });

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use('/api/chatbot', chatbotRoutes);
// // Serve uploaded files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Create uploads directories if they don't exist
// const fs = require('fs');
// const uploadsDir = path.join(__dirname, 'uploads');
// const inwardDir = path.join(uploadsDir, 'inward');
// const outwardDir = path.join(uploadsDir, 'outward');

// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }
// if (!fs.existsSync(inwardDir)) {
//   fs.mkdirSync(inwardDir, { recursive: true });
// }
// if (!fs.existsSync(outwardDir)) {
//   fs.mkdirSync(outwardDir, { recursive: true });
// }

// // Routes
// app.use('/api/inward-mails', inwardMailsRoutes);
// app.use('/api/outward-mails', outwardMailsRoutes);
// app.use('/api/departments', departmentsRoutes);
// app.use('/api/users', usersRoutes);
// app.use('/api/dashboard', dashboardRoutes);

// // Health check route
// app.get('/api/health', (req, res) => {
//   res.json({
//     success: true,
//     message: 'Tapaal Server is running',
//     timestamp: new Date().toISOString()
//   });
// });

// // Database connection
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
//   .then(() => {
//     console.log('Connected to MongoDB successfully');
//   })
//   .catch((error) => {
//     console.error('MongoDB connection error:', error);
//     process.exit(1);
//   });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({
//     success: false,
//     message: 'Something went wrong!',
//     error: process.env.NODE_ENV === 'development' ? err.message : undefined
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route not found'
//   });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Tapaal Server is running on port ${PORT}`);
//   console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
//   console.log(`📧 Inward Mails API: http://localhost:${PORT}/api/inward-mails`);
//   console.log(`📤 Outward Mails API: http://localhost:${PORT}/api/outward-mails`);
//   console.log(`🏢 Departments API: http://localhost:${PORT}/api/departments`);
//   console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
// });
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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
