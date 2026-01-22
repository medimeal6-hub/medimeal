const AuditLog = require('../models/AuditLog');
const Role = require('../models/Role');
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');

/**
 * GET /api/admin/audit-logs
 * Paginated audit log viewer with filters.
 */
const getAuditLogs = async (req, res) => {
  try {
    const {
      userId,
      module,
      severity,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};
    if (userId) query.userId = userId;
    if (module) query.module = module;
    if (severity) query.severity = severity;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [items, total] = await Promise.all([
      AuditLog.find(query)
        .populate('userId', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      AuditLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/admin/audit-logs/export
 * Export full audit log list (simplified JSON export).
 */
const exportAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(5000);

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/admin/security-alerts
 * Derived security alerts from high‑severity audit events.
 */
const getSecurityAlerts = async (req, res) => {
  try {
    const sinceMinutes = parseInt(req.query.sinceMinutes || '1440', 10); // default last 24h
    const since = new Date(Date.now() - sinceMinutes * 60 * 1000);

    const alerts = await AuditLog.find({
      severity: 'high',
      createdAt: { $gte: since },
    })
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error('Get security alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security alerts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * POST /api/admin/roles
 * Create a new RBAC role.
 */
const createRole = async (req, res) => {
  try {
    const role = await Role.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role,
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * PUT /api/admin/roles/:id
 * Update role permissions/metadata.
 */
const updateRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: role,
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * POST /api/admin/roles/assign
 * Assign a role to a user (stores role name on user for now).
 */
const assignRole = async (req, res) => {
  try {
    const { userId, roleName } = req.body;
    if (!userId || !roleName) {
      return res.status(400).json({
        success: false,
        message: 'userId and roleName are required',
      });
    }

    const role = await Role.findOne({ name: roleName });
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role: roleName },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Role assigned successfully',
      data: { user, role },
    });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * POST /api/admin/security/block-user
 * Block a user account (lock out).
 */
const blockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User account blocked',
      data: user,
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * PUT /api/admin/security/alert/:id/resolve
 * Resolve a security alert (implemented as updating AuditLog metadata).
 */
const resolveSecurityAlert = async (req, res) => {
  try {
    const alert = await AuditLog.findByIdAndUpdate(
      req.params.id,
      { 'metadata.resolved': true, 'metadata.resolvedAt': new Date() },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.json({
      success: true,
      message: 'Alert resolved',
      data: alert,
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve alert',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/admin/login-history
 * Returns recent login activity.
 */
const getLoginHistory = async (req, res) => {
  try {
    const { userId } = req.query;
    const query = {};
    if (userId) query.userId = userId;

    const logs = await LoginLog.find(query)
      .populate('userId', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Get login history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch login history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * POST /api/admin/logout-user/:id
 * Force logout by deactivating the user (tokens will start failing).
 */
const forceLogoutUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User forcibly logged out / deactivated',
      data: user,
    });
  } catch (error) {
    console.error('Force logout user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to force logout user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
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
};



