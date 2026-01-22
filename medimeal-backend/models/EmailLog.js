const mongoose = require('mongoose');

/**
 * EmailLog
 * --------
 * Tracks all email notifications sent to users.
 * Used for audit, debugging, and compliance.
 */
const emailLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: [
      'daily_food_alert',
      'appointment_approval',
      'appointment_booking',
      'appointment_rejection',
      'payment_success',
      'appointment_reminder_24h',
      'appointment_reminder_1h',
      'food_alert',
      'diet_recommendation',
      'health_alert',
      'general'
    ],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'pending'],
    default: 'pending',
    index: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  errorMessage: {
    type: String,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

emailLogSchema.index({ userId: 1, sentAt: -1 });
emailLogSchema.index({ type: 1, sentAt: -1 });
emailLogSchema.index({ status: 1 });

module.exports = mongoose.model('EmailLog', emailLogSchema);
