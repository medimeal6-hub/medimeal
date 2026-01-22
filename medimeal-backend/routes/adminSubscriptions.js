const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { createAuditLogger } = require('../middleware/audit');
const {
  updateSubscriptionValidators,
  getSubscriptions,
  getRevenueAnalytics,
  updateSubscription,
  updateSubscriptionForUser,
  cancelSubscriptionForUser,
  createPlan,
  updatePlan,
  deletePlan,
  exportRevenue,
  getPayments,
  refundPayment,
} = require('../controllers/subscriptionController');

const router = express.Router();

router.use(auth, authorize('admin'));

router.get(
  '/subscriptions',
  createAuditLogger('admin.subscriptions', 'LIST'),
  getSubscriptions
);

router.get(
  '/revenue',
  createAuditLogger('admin.subscriptions', 'REVENUE'),
  getRevenueAnalytics
);

router.get(
  '/revenue/export',
  createAuditLogger('admin.subscriptions', 'REVENUE_EXPORT'),
  exportRevenue
);

router.put(
  '/subscription/update',
  updateSubscriptionValidators,
  createAuditLogger('admin.subscriptions', 'UPDATE', 'medium'),
  updateSubscription
);

router.put(
  '/subscription/update/:userId',
  createAuditLogger('admin.subscriptions', 'UPDATE_USER', 'medium'),
  updateSubscriptionForUser
);

router.put(
  '/subscription/cancel/:userId',
  createAuditLogger('admin.subscriptions', 'CANCEL_USER', 'medium'),
  cancelSubscriptionForUser
);

// Plans CRUD
router.post(
  '/plans',
  createAuditLogger('admin.plans', 'CREATE_PLAN', 'medium'),
  createPlan
);

router.put(
  '/plans/:id',
  createAuditLogger('admin.plans', 'UPDATE_PLAN', 'medium'),
  updatePlan
);

router.delete(
  '/plans/:id',
  createAuditLogger('admin.plans', 'DELETE_PLAN', 'medium'),
  deletePlan
);

// Payments
router.get(
  '/payments',
  createAuditLogger('admin.payments', 'LIST_PAYMENTS'),
  getPayments
);

router.post(
  '/payments/refund/:id',
  createAuditLogger('admin.payments', 'REFUND_PAYMENT', 'high'),
  refundPayment
);

// Finance & Commission Management
const {
  getRevenueTracking,
  getCommissions,
  markCommissionPaid
} = require('../controllers/adminFinanceController');

router.get('/finance/revenue-tracking', getRevenueTracking);
router.get('/finance/commissions', getCommissions);
router.post('/finance/commissions/:staffId/pay', markCommissionPaid);

module.exports = router;



