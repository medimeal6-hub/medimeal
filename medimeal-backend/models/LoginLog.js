const mongoose = require('mongoose');

/**
 * LoginLog
 * --------
 * Captures login events for audit and login history views.
 */

const loginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    ipAddress: {
      type: String,
      maxlength: 64,
    },
    userAgent: {
      type: String,
      maxlength: 512,
    },
    success: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

loginLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('LoginLog', loginLogSchema);



