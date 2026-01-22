const AuditLog = require('../models/AuditLog');
const LoginLog = require('../models/LoginLog');
const User = require('../models/User');

/**
 * GET /api/admin/security/data-access-logs
 * Get data access logs (who accessed what & when)
 */
const getDataAccessLogs = async (req, res) => {
  try {
    const { userId, module, startDate, endDate, limit = 100 } = req.query;

    const query = {};
    if (userId) query.userId = userId;
    if (module) query.module = module;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .populate('userId', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Get data access logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get data access logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/admin/security/compliance-flags
 * Get GDPR/HIPAA-style compliance flags
 */
const getComplianceFlags = async (req, res) => {
  try {
    const flags = [];

    // Check for users with missing privacy consent
    const usersWithoutConsent = await User.countDocuments({
      $or: [
        { privacyConsent: { $exists: false } },
        { privacyConsent: false }
      ]
    });

    if (usersWithoutConsent > 0) {
      flags.push({
        type: 'privacy-consent',
        severity: 'high',
        title: 'Missing Privacy Consent',
        description: `${usersWithoutConsent} users have not provided privacy consent`,
        count: usersWithoutConsent,
        action: 'Require privacy consent for all users'
      });
    }

    // Check for expired staff licenses
    const StaffVerification = require('../models/StaffVerification');
    const expiredLicenses = await StaffVerification.countDocuments({
      expiryDate: { $lt: new Date() },
      verificationStatus: { $ne: 'expired' }
    });

    if (expiredLicenses > 0) {
      flags.push({
        type: 'expired-license',
        severity: 'high',
        title: 'Expired Staff Licenses',
        description: `${expiredLicenses} staff members have expired licenses`,
        count: expiredLicenses,
        action: 'Review and suspend staff with expired licenses'
      });
    }

    // Check for failed login attempts
    const failedLogins = await LoginLog.countDocuments({
      success: false,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (failedLogins > 10) {
      flags.push({
        type: 'failed-logins',
        severity: 'medium',
        title: 'High Failed Login Attempts',
        description: `${failedLogins} failed login attempts in the last 24 hours`,
        count: failedLogins,
        action: 'Review security and consider rate limiting'
      });
    }

    // Check for high-severity audit logs
    const highSeverityLogs = await AuditLog.countDocuments({
      severity: 'high',
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    if (highSeverityLogs > 0) {
      flags.push({
        type: 'high-severity-actions',
        severity: 'medium',
        title: 'High Severity Actions',
        description: `${highSeverityLogs} high-severity actions in the last 7 days`,
        count: highSeverityLogs,
        action: 'Review audit logs for suspicious activity'
      });
    }

    // Check for users without data retention policy acknowledgment
    const usersWithoutRetention = await User.countDocuments({
      dataRetentionAcknowledged: { $ne: true }
    });

    if (usersWithoutRetention > 0) {
      flags.push({
        type: 'data-retention',
        severity: 'low',
        title: 'Data Retention Policy',
        description: `${usersWithoutRetention} users have not acknowledged data retention policy`,
        count: usersWithoutRetention,
        action: 'Request data retention policy acknowledgment'
      });
    }

    res.json({
      success: true,
      data: {
        flags,
        summary: {
          total: flags.length,
          high: flags.filter(f => f.severity === 'high').length,
          medium: flags.filter(f => f.severity === 'medium').length,
          low: flags.filter(f => f.severity === 'low').length
        }
      }
    });
  } catch (error) {
    console.error('Get compliance flags error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get compliance flags',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getDataAccessLogs,
  getComplianceFlags
};

