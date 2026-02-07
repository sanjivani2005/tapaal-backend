const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const OutwardMail = require('../models/OutwardMail');

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
router.post('/', upload.array('attachments', 5), async (req, res) => {
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
      cost
    } = req.body;

    // Generate unique IDs
    const id = `OUT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const trackingId = `TRK-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size
    })) : [];

    const newOutwardMail = new OutwardMail({
      id,
      trackingId,
      sentBy,
      receiver,
      receiverAddress,
      date: date || new Date().toISOString().slice(0, 10),
      deliveryMode,
      subject,
      details,
      referenceDetails,
      priority,
      department,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      cost: cost ? parseFloat(cost) : undefined,
      attachments
    });

    const savedMail = await newOutwardMail.save();
    res.status(201).json({ success: true, data: savedMail });
  } catch (error) {
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
