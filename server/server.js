<<<<<<< HEAD
=======
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

>>>>>>> shary-backend
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
<<<<<<< HEAD
require('dotenv').config();
=======
const fs = require('fs');
>>>>>>> shary-backend

// Import routes
const inwardMailsRoutes = require('./routes/inwardMails');
const outwardMailsRoutes = require('./routes/outwardMails');
const departmentsRoutes = require('./routes/departments');
<<<<<<< HEAD
const usersRoutes = require('./routes/users'); // Uncommented
=======
const usersRoutes = require('./routes/users');
>>>>>>> shary-backend
const dashboardRoutes = require('./routes/dashboard');
const chatbotRoutes = require('./routes/chatbot');

const app = express();
const PORT = process.env.PORT || 5000;
<<<<<<< HEAD
const HOST = process.env.HOST || 'localhost';
=======

// Debug ENV
console.log("🔑 Gemini API Key:", process.env.GEMINI_API_KEY ? "SET" : "NOT SET");
console.log("🗄 Mongo URI:", process.env.MONGODB_URI ? "SET" : "NOT SET");
>>>>>>> shary-backend

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
<<<<<<< HEAD
    console.log('Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
=======
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
>>>>>>> shary-backend
    process.exit(1);
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/chatbot', chatbotRoutes);
<<<<<<< HEAD
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directories if they don't exist
const fs = require('fs');
=======

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure upload folders exist
>>>>>>> shary-backend
const uploadsDir = path.join(__dirname, 'uploads');
const inwardDir = path.join(uploadsDir, 'inward');
const outwardDir = path.join(uploadsDir, 'outward');

<<<<<<< HEAD
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(inwardDir)) {
  fs.mkdirSync(inwardDir, { recursive: true });
}
if (!fs.existsSync(outwardDir)) {
  fs.mkdirSync(outwardDir, { recursive: true });
}
=======
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(inwardDir)) fs.mkdirSync(inwardDir, { recursive: true });
if (!fs.existsSync(outwardDir)) fs.mkdirSync(outwardDir, { recursive: true });
>>>>>>> shary-backend

// Routes
app.use('/api/inward-mails', inwardMailsRoutes);
app.use('/api/outward-mails', outwardMailsRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);

<<<<<<< HEAD
// Health check route
=======
// Health route
>>>>>>> shary-backend
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Tapaal Server is running',
    timestamp: new Date().toISOString()
  });
});

<<<<<<< HEAD
// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Error handling middleware
=======
// Error handler
>>>>>>> shary-backend
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
<<<<<<< HEAD
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
=======
    message: 'Something went wrong!'
>>>>>>> shary-backend
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
<<<<<<< HEAD
app.listen(PORT, HOST, () => {
  console.log(`🚀 Tapaal Server is running on http://${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/api/health`);
  console.log(`📧 Inward Mails API: http://${HOST}:${PORT}/api/inward-mails`);
  console.log(`📤 Outward Mails API: http://${HOST}:${PORT}/api/outward-mails`);
  console.log(`🏢 Departments API: http://${HOST}:${PORT}/api/departments`);
  console.log(`👥 Users API: http://${HOST}:${PORT}/api/users`);
=======
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
>>>>>>> shary-backend
});
