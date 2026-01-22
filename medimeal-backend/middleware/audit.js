const AuditLog = require('../models/AuditLog');

/**
 * createAuditLogger
 * --------------------
 * Factory that returns an Express middleware which writes an AuditLog entry
 * for each request that passes through it.
 *
 * Usage:
 *   router.post('/admin/xyz',
 *     auth,
 *     authorize('admin'),
 *     createAuditLogger('admin.compliance', 'CREATE_RULE'),
 *     controllerHandler
 *   )
 */

const createAuditLogger = (moduleName, actionName, severity = 'low') => {
  return async (req, res, next) => {
    try {
      const userId = req.user?._id;
      const ipAddress =
        req.ip ||
        req.headers['x-forwarded-for'] ||
        req.connection?.remoteAddress ||
        undefined;

      const metadata = {
        method: req.method,
        path: req.originalUrl,
        query: req.query,
        // Only store a shallow snapshot of the body to avoid PII overload
        bodyPreview: req.body
          ? Object.keys(req.body).slice(0, 10).reduce((acc, key) => {
              acc[key] = req.body[key];
              return acc;
            }, {})
          : undefined,
      };

      await AuditLog.create({
        userId,
        module: moduleName,
        action: actionName,
        ipAddress,
        metadata,
        severity,
      });
    } catch (err) {
      // Never block the request flow due to audit logging failures
      console.error('Audit log error:', err.message);
    }

    next();
  };
};

module.exports = {
  createAuditLogger,
};



