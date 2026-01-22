const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { createAuditLogger } = require('../middleware/audit');
const {
  staffVerificationValidators,
  getPendingStaff,
  verifyStaff,
  rejectStaff,
  approveStaffById,
  rejectStaffById,
  requestReupload,
  suspendStaff,
  revokeStaffLicense,
  notifyExpiry,
  autoSuspendExpired,
} = require('../controllers/staffVerificationController');

const router = express.Router();

// Admin‑only staff verification endpoints
router.use(auth, authorize('admin'));

router.get(
  '/staff/pending',
  createAuditLogger('admin.staff', 'LIST_PENDING'),
  getPendingStaff
);

// Legacy body-based verify/reject
router.post(
  '/staff/verify',
  staffVerificationValidators,
  createAuditLogger('admin.staff', 'VERIFY', 'medium'),
  verifyStaff
);

router.post(
  '/staff/reject',
  createAuditLogger('admin.staff', 'REJECT', 'medium'),
  rejectStaff
);

// ID-based approve/reject as specified in requirements
router.post(
  '/staff/approve/:id',
  createAuditLogger('admin.staff', 'APPROVE_BY_ID', 'medium'),
  approveStaffById
);

router.post(
  '/staff/reject/:id',
  createAuditLogger('admin.staff', 'REJECT_BY_ID', 'medium'),
  rejectStaffById
);

router.post(
  '/staff/reupload-request/:id',
  createAuditLogger('admin.staff', 'REQUEST_REUPLOAD', 'medium'),
  requestReupload
);

router.put(
  '/staff/suspend/:id',
  createAuditLogger('admin.staff', 'SUSPEND', 'high'),
  suspendStaff
);

router.put(
  '/staff/revoke/:id',
  createAuditLogger('admin.staff', 'REVOKE_LICENSE', 'high'),
  revokeStaffLicense
);

router.post(
  '/staff/notify-expiry',
  createAuditLogger('admin.staff', 'NOTIFY_EXPIRY', 'medium'),
  notifyExpiry
);

router.post(
  '/staff/auto-suspend',
  createAuditLogger('admin.staff', 'AUTO_SUSPEND', 'high'),
  autoSuspendExpired
);

module.exports = router;



