const mongoose = require('mongoose');

/**
 * Subscription
 * --------------------
 * Tracks user subscription lifecycle and payment history.
 * Used by the Subscription & Financial Management module.
 */

const paymentHistorySchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    provider: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'refunded', 'pending'],
      default: 'success',
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      // Keep this flexible to match Plan catalog entries (e.g., "Premium", "Enterprise", custom names).
      default: 'Free',
      trim: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'pending'],
      default: 'active',
      index: true,
    },
    paymentHistory: [paymentHistorySchema],
    // Feature flags derived from the plan (useful for RBAC / gating)
    features: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ plan: 1, status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);


