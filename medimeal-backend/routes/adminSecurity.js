const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { createAuditLogger } = require('../middleware/audit');
const {
  getAuditLogs,
  exportAuditLogs,
  getSecurityAlerts,
  createRole,
  updateRole,
  assignRole,
  blockUser,
  resolveSecurityAlert,
  getLoginHistory,
  forceLogoutUser,
} = require('../controllers/securityController');

const router = express.Router();

router.use(auth, authorize('admin'));

router.get(
  '/audit-logs',
  createAuditLogger('admin.security', 'LIST_AUDIT_LOGS'),
  getAuditLogs
);

router.get(
  '/audit-logs/export',
  createAuditLogger('admin.security', 'EXPORT_AUDIT_LOGS'),
  exportAuditLogs
);

router.get(
  '/security-alerts',
  createAuditLogger('admin.security', 'LIST_ALERTS'),
  getSecurityAlerts
);

// Roles & permissions
router.post(
  '/roles',
  createAuditLogger('admin.security', 'CREATE_ROLE', 'medium'),
  createRole
);

router.put(
  '/roles/:id',
  createAuditLogger('admin.security', 'UPDATE_ROLE', 'medium'),
  updateRole
);

router.post(
  '/roles/assign',
  createAuditLogger('admin.security', 'ASSIGN_ROLE', 'medium'),
  assignRole
);

// Security actions
router.post(
  '/security/block-user',
  createAuditLogger('admin.security', 'BLOCK_USER', 'high'),
  blockUser
);

router.put(
  '/security/alert/:id/resolve',
  createAuditLogger('admin.security', 'RESOLVE_ALERT', 'medium'),
  resolveSecurityAlert
);

// Login history
router.get(
  '/login-history',
  createAuditLogger('admin.security', 'LOGIN_HISTORY'),
  getLoginHistory
);

router.post(
  '/logout-user/:id',
  createAuditLogger('admin.security', 'FORCE_LOGOUT', 'high'),
  forceLogoutUser
);

// Enhanced Security & Compliance
const {
  getDataAccessLogs,
  getComplianceFlags
} = require('../controllers/adminSecurityController');

router.get('/security/data-access-logs', getDataAccessLogs);
router.get('/security/compliance-flags', getComplianceFlags);

module.exports = router;



