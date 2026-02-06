const mongoose = require('mongoose');

const chatbotConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [{
    message: {
      type: String,
      required: true
    },
    response: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    intent: {
      type: String,
      enum: ['inward_mails', 'outward_mails', 'users', 'departments', 'statistics', 'help', 'general'],
      default: 'general'
    }
  }],
  sessionStart: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
chatbotConversationSchema.index({ userId: 1, lastActivity: -1 });
chatbotConversationSchema.index({ 'messages.timestamp': -1 });

module.exports = mongoose.model('ChatbotConversation', chatbotConversationSchema);
