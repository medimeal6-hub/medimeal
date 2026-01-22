const mongoose = require('mongoose');

/**
 * SystemMetric
 * --------------------
 * Time‑series metrics for system health and AI analytics.
 * Examples:
 * - api_latency_p95
 * - total_conflicts_today
 * - diet_compliance_score_avg
 */

const systemMetricSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    // Optional grouping (infrastructure, compliance, usage, revenue, etc.)
    category: {
      type: String,
      trim: true,
      default: 'general',
      index: true,
    },
    // Numeric value for charting (latency, counts, scores, revenue, etc.)
    value: {
      type: Number,
      required: true,
    },
    // Optional structured payload for dashboards
    payload: {
      type: mongoose.Schema.Types.Mixed,
    },
    // Optional association to a user/doctor for per‑entity metrics
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Logical timestamp of the metric; defaults to createdAt
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

systemMetricSchema.index({ key: 1, timestamp: -1 });
systemMetricSchema.index({ category: 1, timestamp: -1 });

module.exports = mongoose.model('SystemMetric', systemMetricSchema);


