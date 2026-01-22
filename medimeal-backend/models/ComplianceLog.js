const mongoose = require('mongoose');

/**
 * ComplianceLog
 * --------------------
 * Captures all safety / compliance events for a user in the system.
 * This is the primary source for:
 * - Diet plan violations
 * - Food–disease conflicts
 * - Food–medicine interactions
 * - Aggregated compliance scoring per user / doctor / dietitian
 */

const complianceLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dietitianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // High‑level category of the compliance event
    category: {
      type: String,
      enum: ['food-disease', 'food-medicine', 'diet-plan'],
      required: true,
      index: true,
    },
    // More specific rule identifier – useful for analytics / tuning
    ruleCode: {
      type: String,
      trim: true,
    },
    // low, medium, high – used heavily in dashboards
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
      index: true,
    },
    // Human readable description for auditability
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    // Optional structured context used for analytics / drill down
    context: {
      foodName: String,
      foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
      },
      medicineName: String,
      diseaseName: String,
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodPlan',
      },
      // Arbitrary additional key/value detail
      meta: {
        type: mongoose.Schema.Types.Mixed,
      },
    },
    // Derived scores to make querying faster
    impactScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    resolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient analytics queries
complianceLogSchema.index({ userId: 1, createdAt: -1 });
complianceLogSchema.index({ doctorId: 1, createdAt: -1 });
complianceLogSchema.index({ dietitianId: 1, createdAt: -1 });
complianceLogSchema.index({ category: 1, severity: 1 });

// Helper to compute a simple impact score based on severity
complianceLogSchema.pre('save', function (next) {
  if (!this.isModified('severity')) return next();

  const map = {
    low: 1,
    medium: 5,
    high: 10,
  };

  this.impactScore = map[this.severity] || 0;
  next();
});

module.exports = mongoose.model('ComplianceLog', complianceLogSchema);


