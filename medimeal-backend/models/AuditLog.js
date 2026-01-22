const mongoose = require('mongoose');

/**
 * AuditLog
 * ---------
 * Captures audit trail of admin actions and system events for compliance and security.
 * Used by the audit middleware to log all admin operations.
 */

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    module: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    ipAddress: {
      type: String,
      maxlength: 64,
    },
    metadata: {
      method: String,
      path: String,
      query: mongoose.Schema.Types.Mixed,
      bodyPreview: mongoose.Schema.Types.Mixed,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ module: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

