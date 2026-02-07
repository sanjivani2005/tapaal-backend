const mongoose = require('mongoose');

const inwardMailSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  trackingId: {
    type: String,
    required: true
  },
  receivedBy: {
    type: String,
    required: true
  },
  handoverTo: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'Inward'
  },
  deliveryMode: {
    type: String,
    enum: ['Courier', 'Post', 'Hand Delivery', 'Email'],
    required: true
  },
  details: {
    type: String,
    required: true
  },
  referenceDetails: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'waiting', 'in-progress', 'delivered', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Important', 'Normal'],
    default: 'Medium'
  },
  department: {
    type: String,
    required: true
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update the updatedAt field
inwardMailSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('InwardMail', inwardMailSchema);
