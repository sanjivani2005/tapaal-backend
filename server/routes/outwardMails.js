const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const OutwardMail = require('../models/OutwardMail');

// SEED DATA: Add sample outward mails if database is empty
router.post('/seed', async (req, res) => {
  try {
    const existingCount = await OutwardMail.countDocuments();
    if (existingCount > 0) {
      return res.json({
        success: true,
        message: `Database already has ${existingCount} outward mails`,
        count: existingCount
      });
    }

    const sampleMails = [
      {
        id: 'OUT-2026-001',
        trackingId: 'TRK-2026001',
        sentBy: 'Admin Office',
        receiver: 'External Partner Ltd',
        receiverAddress: '123 Business Ave, Suite 100, City, State 12345',
        subject: 'Partnership Agreement 2026',
        details: 'Official partnership agreement for collaboration on upcoming projects',
        department: 'Administration',
        priority: 'High',
        status: 'Sent',
        date: '2026-02-07',
        createdAt: new Date('2026-02-07T09:00:00Z'),
        deliveryMode: 'Courier',
        attachments: [],
        cost: 25.50
      },
      {
        id: 'OUT-2026-002',
        trackingId: 'TRK-2026002',
        sentBy: 'Finance Department',
        receiver: 'Tax Consultant',
        receiverAddress: '456 Financial St, Floor 5, City, State 67890',
        subject: 'Annual Tax Documents',
        details: 'Complete tax documentation for fiscal year 2025-2026',
        department: 'Finance',
        priority: 'Normal',
        status: 'Delivered',
        date: '2026-02-06',
        createdAt: new Date('2026-02-06T14:30:00Z'),
        deliveryMode: 'Registered Post',
        attachments: [
          { filename: 'tax_docs.pdf', originalName: 'Tax_Documents_2026.pdf', size: 1536000 }
        ],
        cost: 15.75
      },
      {
        id: 'OUT-2026-003',
        trackingId: 'TRK-2026003',
        sentBy: 'Legal Department',
        receiver: 'Court House',
        receiverAddress: '789 Legal Blvd, Downtown, City, State 11111',
        subject: 'Legal Notice Response',
        details: 'Official response to legal notice regarding contract dispute',
        department: 'Legal',
        priority: 'Critical',
        status: 'In Transit',
        date: '2026-02-05',
        createdAt: new Date('2026-02-05T11:15:00Z'),
        deliveryMode: 'Express Courier',
        attachments: [
          { filename: 'legal_response.pdf', originalName: 'Legal_Notice_Response_2026.pdf', size: 2048000 }
        ],
        cost: 45.00
      },
      {
        id: 'OUT-2026-004',
        trackingId: 'TRK-2026004',
        sentBy: 'HR Department',
        receiver: 'Insurance Company',
        receiverAddress: '321 Insurance Plaza, Suite 200, City, State 33333',
        subject: 'Employee Insurance Claims',
        details: 'Monthly employee insurance claim submissions and documentation',
        department: 'Human Resources',
        priority: 'Medium',
        status: 'Processing',
        date: '2026-02-04',
        createdAt: new Date('2026-02-04T16:45:00Z'),
        deliveryMode: 'Standard Mail',
        attachments: [
          { filename: 'claims.xlsx', originalName: 'Employee_Claims_Feb_2026.xlsx', size: 512000 }
        ],
        cost: 8.50
      },
      {
        id: 'OUT-2026-005',
        trackingId: 'TRK-2026005',
        sentBy: 'IT Department',
        receiver: 'Software Vendor',
        receiverAddress: '555 Tech Park Drive, Building A, City, State 55555',
        subject: 'Software License Renewal',
        details: 'Annual software license renewal agreement and payment confirmation',
        department: 'Information Technology',
        priority: 'High',
        status: 'Pending',
        date: '2026-02-03',
        createdAt: new Date('2026-02-03T10:30:00Z'),
        deliveryMode: 'Email with Digital Signature',
        attachments: [
          { filename: 'license_agreement.pdf', originalName: 'Software_License_2026.pdf', size: 1024000 }
        ],
        cost: 0.00
      }
    ];

    const insertedMails = await OutwardMail.insertMany(sampleMails);

    res.json({
      success: true,
      message: `Successfully seeded ${insertedMails.length} outward mails`,
      count: insertedMails.length,
      data: insertedMails
    });
  } catch (error) {
    console.error('Error seeding outward mails:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed outward mails',
      error: error.message
    });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/outward/');
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

// GET all outward mails
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, priority, status, department } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { id: { $regex: search, $options: 'i' } },
        { receiver: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
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

    const outwardMails = await OutwardMail.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await OutwardMail.countDocuments(filter);

    res.json({
      success: true,
      data: outwardMails,
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

// GET single outward mail
router.get('/:id', async (req, res) => {
  try {
    const outwardMail = await OutwardMail.findOne({ id: req.params.id });
    if (!outwardMail) {
      return res.status(404).json({ success: false, message: 'Outward mail not found' });
    }
    res.json({ success: true, data: outwardMail });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create new outward mail
router.post('/', async (req, res) => {
  try {
    console.log('📥 Received outward mail request body:', req.body);
    console.log('📁 Request headers:', req.headers);

    // Handle form data in serverless environment
    if (!req.body) {
      return res.status(400).json({ success: false, message: 'No form data received' });
    }

    const {
      sentBy,
      receiver,
      receiverAddress,
      deliveryMode,
      subject,
      details,
      referenceDetails,
      priority,
      department,
      date,
      dueDate,
      cost,
      attachments
    } = req.body;

    // Generate unique IDs
    const id = `OUT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const trackingId = `TRK-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    // Process attachments (if any)
    const processedAttachments = attachments && Array.isArray(attachments) ? attachments.map(attachment => ({
      filename: attachment.filename || attachment.originalName,
      originalName: attachment.originalName || attachment.filename,
      size: attachment.size || 0,
      mimetype: attachment.mimetype || 'application/octet-stream'
    })) : [];

    const newOutwardMail = new OutwardMail({
      id,
      trackingId,
      sentBy: sentBy || 'System Admin',
      receiver: receiver || 'Unknown',
      receiverAddress: receiverAddress || '',
      date: date || new Date().toISOString().slice(0, 10),
      deliveryMode: deliveryMode || 'Courier',
      subject: subject || '',
      details: details || '',
      referenceDetails: referenceDetails || '',
      priority: priority || 'Normal',
      department: department || 'Administration',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      cost: cost ? parseFloat(cost) : undefined,
      attachments: processedAttachments,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedMail = await newOutwardMail.save();
    console.log('✅ Outward mail saved successfully:', savedMail);
    res.status(201).json({ success: true, data: savedMail });
  } catch (error) {
    console.error('💥 Error creating outward mail:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update outward mail
router.put('/:id', upload.array('attachments', 5), async (req, res) => {
  try {
    const {
      sentBy,
      receiver,
      receiverAddress,
      deliveryMode,
      subject,
      details,
      referenceDetails,
      priority,
      department,
      date,
      dueDate,
      cost,
      status
    } = req.body;

    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size
    })) : [];

    const updateData = {
      sentBy,
      receiver,
      receiverAddress,
      deliveryMode,
      subject,
      details,
      referenceDetails,
      priority,
      department,
      date: date || new Date().toISOString().slice(0, 10),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      cost: cost ? parseFloat(cost) : undefined,
      status,
      attachments
    };

    const updatedMail = await OutwardMail.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedMail) {
      return res.status(404).json({ success: false, message: 'Outward mail not found' });
    }

    res.json({ success: true, data: updatedMail });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE outward mail
router.delete('/:id', async (req, res) => {
  try {
    const deletedMail = await OutwardMail.findOneAndDelete({ id: req.params.id });

    if (!deletedMail) {
      return res.status(404).json({ success: false, message: 'Outward mail not found' });
    }

    res.json({ success: true, message: 'Outward mail deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await OutwardMail.countDocuments();
    const draft = await OutwardMail.countDocuments({ status: 'draft' });
    const sent = await OutwardMail.countDocuments({ status: 'sent' });
    const inTransit = await OutwardMail.countDocuments({ status: 'in-transit' });
    const delivered = await OutwardMail.countDocuments({ status: 'delivered' });

    res.json({
      success: true,
      data: {
        total,
        draft,
        sent,
        inTransit,
        delivered
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
