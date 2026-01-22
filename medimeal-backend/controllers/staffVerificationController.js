const { validationResult, body } = require('express-validator');
const StaffVerification = require('../models/StaffVerification');
const User = require('../models/User');

// Validation rules for create / update operations
const staffVerificationValidators = [
  body('userId').notEmpty().withMessage('userId is required'),
  body('role')
    .isIn(['doctor', 'dietitian'])
    .withMessage('role must be doctor or dietitian'),
  body('licenseNumber').notEmpty().withMessage('licenseNumber is required'),
  body('documentUrl').notEmpty().withMessage('documentUrl is required'),
  body('expiryDate').isISO8601().toDate().withMessage('expiryDate must be a valid date'),
];

/**
 * GET /api/admin/staff/pending
 * List all staff with pending / expired verifications.
 */
const getPendingStaff = async (req, res) => {
  try {
    const now = new Date();

    // Auto‑flag expired verifications
    await StaffVerification.updateMany(
      { expiryDate: { $lt: now }, verificationStatus: { $ne: 'expired' } },
      { verificationStatus: 'expired' }
    );

    const items = await StaffVerification.find({
      verificationStatus: { $in: ['pending', 'expired'] },
    })
      .populate('userId', 'firstName lastName email role doctorInfo');

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Get pending staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending staff',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * POST /api/admin/staff/verify
 * Approve staff credentials.
 */
const verifyStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { userId, role, licenseNumber, documentUrl, expiryDate, notes } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Upsert StaffVerification record
    const record = await StaffVerification.findOneAndUpdate(
      { userId },
      {
        userId,
        role,
        licenseNumber,
        documentUrl,
        expiryDate,
        verificationStatus: 'approved',
        notes,
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    // Also mark doctorInfo.isVerified for doctors
    if (role === 'doctor') {
      user.role = 'doctor';
      if (!user.doctorInfo) user.doctorInfo = {};
      user.doctorInfo.licenseNumber = licenseNumber;
      user.doctorInfo.isVerified = true;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Staff verified successfully',
      data: record,
    });
  } catch (error) {
    console.error('Verify staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify staff',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * POST /api/admin/staff/reject
 * Reject staff credentials.
 */
const rejectStaff = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    if (!userId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'userId and reason are required',
      });
    }

    const record = await StaffVerification.findOneAndUpdate(
      { userId },
      {
        verificationStatus: 'rejected',
        notes: reason,
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
      },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({ success: false, message: 'Verification record not found' });
    }

    res.json({
      success: true,
      message: 'Staff verification rejected',
      data: record,
    });
  } catch (error) {
    console.error('Reject staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject staff',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * POST /api/admin/staff/approve/:id
 * Approve by verification record id.
 */
const approveStaffById = async (req, res) => {
  try {
    const record = await StaffVerification.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Verification record not found' });
    }

    req.body = {
      userId: record.userId,
      role: record.role,
      licenseNumber: record.licenseNumber,
      documentUrl: record.documentUrl,
      expiryDate: record.expiryDate,
      notes: record.notes,
    };

    return verifyStaff(req, res);
  } catch (error) {
    console.error('Approve staff by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve staff',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * POST /api/admin/staff/reject/:id
 * Reject by verification record id.
 */
const rejectStaffById = async (req, res) => {
  try {
    const record = await StaffVerification.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Verification record not found' });
    }

    req.body = {
      userId: record.userId,
      reason: req.body.reason || 'Rejected by admin',
    };

    return rejectStaff(req, res);
  } catch (error) {
    console.error('Reject staff by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject staff',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * POST /api/admin/staff/reupload-request/:id
 * Request re-upload of verification document.
 */
const requestReupload = async (req, res) => {
  try {
    const record = await StaffVerification.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'pending' },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({ success: false, message: 'Verification record not found' });
    }

    // Here you would trigger an email notification.

    res.json({
      success: true,
      message: 'Re-upload requested from staff member',
      data: record,
    });
  } catch (error) {
    console.error('Request reupload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request reupload',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * PUT /api/admin/staff/suspend/:id
 * Suspend a verified staff member.
 */
const suspendStaff = async (req, res) => {
  try {
    const record = await StaffVerification.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Verification record not found' });
    }

    const user = await User.findById(record.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Staff suspended and access disabled',
    });
  } catch (error) {
    console.error('Suspend staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend staff',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * PUT /api/admin/staff/revoke/:id
 * Revoke staff license (soft revoke).
 */
const revokeStaffLicense = async (req, res) => {
  try {
    const record = await StaffVerification.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'rejected' },
      { new: true }
    );
    if (!record) {
      return res.status(404).json({ success: false, message: 'Verification record not found' });
    }

    const user = await User.findById(record.userId);
    if (user && user.doctorInfo) {
      user.doctorInfo.isVerified = false;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Staff license revoked',
      data: record,
    });
  } catch (error) {
    console.error('Revoke staff license error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke license',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * POST /api/admin/staff/notify-expiry
 * Notify staff with soon-to-expire credentials.
 */
const notifyExpiry = async (req, res) => {
  try {
    const { days = 30 } = req.body || {};
    const threshold = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const expiring = await StaffVerification.find({
      expiryDate: { $lte: threshold },
      verificationStatus: 'approved',
    });

    // Here you would send emails to each staff member.

    res.json({
      success: true,
      message: 'Expiry notifications queued',
      count: expiring.length,
    });
  } catch (error) {
    console.error('Notify expiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process expiry notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * POST /api/admin/staff/auto-suspend
 * Automatically suspend staff with expired credentials.
 */
const autoSuspendExpired = async (req, res) => {
  try {
    const now = new Date();
    const expired = await StaffVerification.find({
      expiryDate: { $lt: now },
      verificationStatus: 'approved',
    });

    let suspendedCount = 0;
    for (const rec of expired) {
      // eslint-disable-next-line no-await-in-loop
      const user = await User.findById(rec.userId);
      if (user) {
        user.isActive = false;
        // eslint-disable-next-line no-await-in-loop
        await user.save();
        suspendedCount += 1;
      }
    }

    res.json({
      success: true,
      message: 'Auto-suspension complete',
      suspendedCount,
    });
  } catch (error) {
    console.error('Auto-suspend error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to auto-suspend expired staff',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
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
};



