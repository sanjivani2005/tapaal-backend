const mongoose = require('mongoose');

const outwardMailSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  trackingId: {
    type: String,
    required: true
  },
  sentBy: {
    type: String,
    required: true
  },
  receiver: {
    type: String,
    required: true
  },
  receiverAddress: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'Outward'
  },
  deliveryMode: {
    type: String,
    enum: ['Courier', 'Post', 'Hand Delivery', 'Email', 'Registered Post', 'Speed Post', 'Fax'],
    required: true,
    default: 'Courier'
  },
  subject: {
    type: String,
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
    enum: ['pending', 'approved', 'waiting', 'in-progress', 'sent', 'delivered', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'Medium', 'High', 'Important'],
    default: 'Normal'
  },
  department: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date
  },
  cost: {
    type: Number
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

// Temporarily disable validation for testing
// outwardMailSchema.pre('save', function (next) {
//   this.updatedAt = new Date();
//   next();
// });

module.exports = mongoose.model('OutwardMail', outwardMailSchema);
