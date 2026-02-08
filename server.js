require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const chatbotRoute = require("./server/routes/chatbot");

// Import models for local server
const User = require("./server/models/User");
const Inward = require("./server/models/InwardMail");
const Outward = require("./server/models/OutwardMail");
const Department = require("./server/models/Department");

const app = express();

/* ---------------- CORS FIX ---------------- */
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://tapaal-frontend.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

/* ---------------- MongoDB ---------------- */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* ---------------- Routes ---------------- */
app.use("/api/chatbot", chatbotRoute);

// API endpoints for local development
app.get('/api/dashboard/stats', async (req, res) => {
  try {
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

app.get("/", (req, res) => {
  res.send("Tapaal backend running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port", PORT));
