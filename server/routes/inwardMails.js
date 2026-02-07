const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const InwardMail = require('../models/InwardMail');

// SEED DATA: Add sample inward mails if database is empty
router.post('/seed', async (req, res) => {
  try {
    const existingCount = await InwardMail.countDocuments();
    if (existingCount > 0) {
      return res.json({
        success: true,
        message: `Database already has ${existingCount} inward mails`,
        count: existingCount
      });
    }

    const sampleMails = [
      {
        id: 'IN-2026-001',
        mailId: 'IN-2026-001',
        sender: 'John Doe',
        subject: 'Application for Leave',
        details: 'Request for medical leave for 3 days due to health reasons',
        department: 'Human Resources',
        priority: 'Normal',
        status: 'Pending',
        date: '2026-02-07',
        createdAt: new Date('2026-02-07T10:00:00Z'),
        updatedAt: new Date('2026-02-07T10:00:00Z'),
        attachments: [],
        receiver: 'HR Manager',
        referenceNumber: 'REF-001',
        dueDate: '2026-02-10'
      },
      {
        id: 'IN-2026-002',
        mailId: 'IN-2026-002',
        sender: 'Jane Smith',
        subject: 'Budget Proposal Q2 2026',
        details: 'Quarterly budget proposal for marketing department including campaign expenses and resource allocation',
        department: 'Finance',
        priority: 'High',
        status: 'Under Review',
        date: '2026-02-06',
        createdAt: new Date('2026-02-06T14:30:00Z'),
        updatedAt: new Date('2026-02-06T14:30:00Z'),
        attachments: [
          { filename: 'budget.pdf', originalName: 'Q2_Budget_2026.pdf', size: 1024000 }
        ],
        receiver: 'Finance Director',
        referenceNumber: 'REF-002',
        dueDate: '2026-02-15'
      },
      {
        id: 'IN-2026-003',
        mailId: 'IN-2026-003',
        sender: 'Mike Johnson',
        subject: 'Project Status Report - January 2026',
        details: 'Monthly project status report including milestones achieved, budget utilization, and upcoming deliverables',
        department: 'Operations',
        priority: 'Medium',
        status: 'Approved',
        date: '2026-02-05',
        createdAt: new Date('2026-02-05T09:15:00Z'),
        updatedAt: new Date('2026-02-05T16:30:00Z'),
        attachments: [
          { filename: 'report.pdf', originalName: 'Project_Report_Jan_2026.pdf', size: 2048000 },
          { filename: 'metrics.xlsx', originalName: 'Project_Metrics_Jan.xlsx', size: 512000 }
        ],
        receiver: 'Operations Manager',
        referenceNumber: 'REF-003',
        dueDate: '2026-02-08'
      },
      {
        id: 'IN-2026-004',
        mailId: 'IN-2026-004',
        sender: 'Sarah Williams',
        subject: 'Supplier Contract Review',
        details: 'New supplier contract for office supplies and equipment requiring legal review and approval',
        department: 'Legal',
        priority: 'High',
        status: 'In Progress',
        date: '2026-02-04',
        createdAt: new Date('2026-02-04T11:20:00Z'),
        updatedAt: new Date('2026-02-04T11:20:00Z'),
        attachments: [
          { filename: 'contract.pdf', originalName: 'Supplier_Contract_2026.pdf', size: 3072000 }
        ],
        receiver: 'Legal Head',
        referenceNumber: 'REF-004',
        dueDate: '2026-02-12'
      },
      {
        id: 'IN-2026-005',
        mailId: 'IN-2026-005',
        sender: 'Robert Chen',
        subject: 'IT Infrastructure Upgrade Request',
        details: 'Request for server upgrade and network infrastructure improvements to support growing business needs',
        department: 'Information Technology',
        priority: 'Critical',
        status: 'Pending',
        date: '2026-02-03',
        createdAt: new Date('2026-02-03T13:45:00Z'),
        updatedAt: new Date('2026-02-03T13:45:00Z'),
        attachments: [
          { filename: 'requirements.docx', originalName: 'IT_Upgrade_Requirements.docx', size: 256000 }
        ],
        receiver: 'IT Manager',
        referenceNumber: 'REF-005',
        dueDate: '2026-02-07'
      }
    ];

    const insertedMails = await InwardMail.insertMany(sampleMails);

    res.json({
      success: true,
      message: `Successfully seeded ${insertedMails.length} inward mails`,
      count: insertedMails.length,
      data: insertedMails
    });
  } catch (error) {
    console.error('Error seeding inward mails:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed inward mails',
      error: error.message
    });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/inward/');
  },
  filename: function (req, file, cb) {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// GET all inward mails
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, priority, status, department } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { id: { $regex: search, $options: 'i' } },
        { sender: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } }
      ];
    }
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (department && department !== 'all') {
      filter.department = department;
    }

    const inwardMails = await InwardMail.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await InwardMail.countDocuments(filter);

    res.json({
      success: true,
      data: inwardMails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single inward mail
router.get('/:id', async (req, res) => {
  try {
    const inwardMail = await InwardMail.findById(req.params.id);
    if (!inwardMail) {
      return res.status(404).json({ success: false, message: 'Inward mail not found' });
    }
    res.json({ success: true, data: inwardMail });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create new inward mail
router.post('/', async (req, res) => {
  try {
    // Handle form data in serverless environment
    let mailData;
    let attachments = [];

    console.log('📥 Received request body:', req.body);
    console.log('📁 Request headers:', req.headers);

    // For serverless environment, handle form data differently
    if (req.body) {
      mailData = req.body;

      // Handle attachments if they exist (base64 or file references)
      if (req.files && req.files.length > 0) {
        attachments = req.files.map(file => ({
          filename: file.filename || file.originalname,
          originalName: file.originalname,
          size: file.size || 0,
          mimetype: file.mimetype || 'application/octet-stream'
        }));
      }
    } else {
      return res.status(400).json({ success: false, message: 'No form data received' });
    }

    const {
      receivedBy,
      handoverTo,
      sender,
      deliveryMode,
      details,
      referenceDetails,
      priority,
      department,
      date
    } = mailData;

    // Generate unique IDs
    const id = `INW-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const trackingId = `TRK-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    const newInwardMail = new InwardMail({
      id,
      trackingId,
      receivedBy: receivedBy || 'System Admin',
      handoverTo: handoverTo || 'System Admin',
      sender: sender || 'Unknown',
      deliveryMode: deliveryMode || 'Courier',
      details: details || '',
      referenceDetails: referenceDetails || '',
      priority: priority || 'Normal',
      department: department || 'Administration',
      date: date || new Date().toISOString().slice(0, 19).replace('T', ' '),
      attachments,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedMail = await newInwardMail.save();
    console.log('✅ Mail saved successfully:', savedMail);
    res.status(201).json({ success: true, data: savedMail });
  } catch (error) {
    console.error('💥 Error creating inward mail:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update inward mail
router.put('/:id', async (req, res) => {
  try {
    const updatedMail = await InwardMail.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedMail) {
      return res.status(404).json({ success: false, message: 'Inward mail not found' });
    }

    res.json({ success: true, data: updatedMail });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE inward mail
router.delete('/:id', async (req, res) => {
  try {
    const deletedMail = await InwardMail.findByIdAndDelete(req.params.id);

    if (!deletedMail) {
      return res.status(404).json({ success: false, message: 'Inward mail not found' });
    }

    res.json({ success: true, message: 'Inward mail deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await InwardMail.countDocuments();
    const pending = await InwardMail.countDocuments({ status: 'pending' });
    const approved = await InwardMail.countDocuments({ status: 'approved' });
    const inProgress = await InwardMail.countDocuments({ status: 'in-progress' });
    const delivered = await InwardMail.countDocuments({ status: 'delivered' });

    res.json({
      success: true,
      data: {
        total,
        pending,
        approved,
        inProgress,
        delivered
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
