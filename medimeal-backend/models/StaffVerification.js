const mongoose = require('mongoose');

/**
 * StaffVerification
 * --------------------
 * Tracks verification & credentialing workflow for doctors / dietitians.
 * Admins operate on this collection from the Staff Verification panel.
 */

const staffVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['doctor', 'dietitian'],
      required: true,
      index: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true,
    },
    documentUrl: {
      type: String,
      required: true,
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'expired'],
      default: 'pending',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Flag credentials as expired automatically when loading, for convenience.
staffVerificationSchema.methods.isExpired = function () {
  return this.expiryDate && this.expiryDate < new Date();
};

module.exports = mongoose.model('StaffVerification', staffVerificationSchema);


