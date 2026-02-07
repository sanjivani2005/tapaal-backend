const mongoose = require('mongoose');

const dashboardConfigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  widgets: [{
    type: {
      type: String,
      enum: ['statistics', 'recent_mails', 'chart', 'quick_actions', 'notifications'],
      required: true
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 }
    },
    size: {
      width: { type: Number, default: 1 },
      height: { type: Number, default: 1 }
    },
    isVisible: {
      type: Boolean,
      default: true
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'light'
  },
  defaultView: {
    type: String,
    enum: ['overview', 'mails', 'analytics'],
    default: 'overview'
  },
  refreshInterval: {
    type: Number,
    default: 30000, // 30 seconds
    min: 5000,
    max: 300000
  },
  notifications: {
    email: { type: Boolean, default: true },
    browser: { type: Boolean, default: true },
    newMail: { type: Boolean, default: true },
    statusChange: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Index for faster user queries
dashboardConfigSchema.index({ userId: 1 });

module.exports = mongoose.model('DashboardConfig', dashboardConfigSchema);
