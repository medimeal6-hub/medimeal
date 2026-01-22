const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { createAuditLogger } = require('../middleware/audit');
const {
  getComplianceOverview,
  getComplianceViolations,
  getSystemMetrics,
  getComplianceHeatmap,
  flagComplianceUser,
  markViolationReviewed,
  escalateViolation,
  deleteViolation,
  getSystemHealth,
  triggerSystemHealthCheck,
} = require('../controllers/complianceController');

const router = express.Router();

// All routes in this file are admin‑only
router.use(auth, authorize('admin'));

// Overview
router.get(
  '/compliance/overview',
  createAuditLogger('admin.compliance', 'READ_OVERVIEW'),
  getComplianceOverview
);

// Violations list
router.get(
  '/compliance/violations',
  createAuditLogger('admin.compliance', 'READ_VIOLATIONS'),
  getComplianceViolations
);

// Heatmap
router.get(
  '/compliance/heatmap',
  createAuditLogger('admin.compliance', 'READ_HEATMAP'),
  getComplianceHeatmap
);

// Flag user
router.post(
  '/compliance/flag-user',
  createAuditLogger('admin.compliance', 'FLAG_USER', 'medium'),
  flagComplianceUser
);

// Violation lifecycle
router.put(
  '/compliance/violation/:id/review',
  createAuditLogger('admin.compliance', 'REVIEW_VIOLATION', 'medium'),
  markViolationReviewed
);

router.put(
  '/compliance/violation/:id/escalate',
  createAuditLogger('admin.compliance', 'ESCALATE_VIOLATION', 'high'),
  escalateViolation
);

router.delete(
  '/compliance/violation/:id',
  createAuditLogger('admin.compliance', 'DELETE_VIOLATION', 'high'),
  deleteViolation
);

// System metrics & health
router.get(
  '/analytics/system-metrics',
  createAuditLogger('admin.analytics', 'READ_SYSTEM_METRICS'),
  getSystemMetrics
);

router.get(
  '/system/health',
  createAuditLogger('admin.system', 'READ_HEALTH'),
  getSystemHealth
);

router.post(
  '/system/health/check',
  createAuditLogger('admin.system', 'TRIGGER_HEALTH_CHECK', 'medium'),
  triggerSystemHealthCheck
);

module.exports = router;



