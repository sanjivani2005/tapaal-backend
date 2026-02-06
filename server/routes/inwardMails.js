const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const InwardMail = require('../models/InwardMail');

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
router.post('/', upload.array('attachments', 5), async (req, res) => {
  try {
    // Handle multipart form data
    let mailData;
    if (req.body && typeof req.body === 'object') {
      mailData = req.body;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid form data' });
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

    console.log('📥 Received request body:', mailData);
    console.log('📁 Files:', req.files);

    // Generate unique IDs
    const id = `INW-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const trackingId = `TRK-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size
    })) : [];

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
      attachments
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
