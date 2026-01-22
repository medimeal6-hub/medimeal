const { body, validationResult } = require('express-validator');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Payment = require('../models/Payment');

const updateSubscriptionValidators = [
  body('userId').notEmpty().withMessage('userId is required'),
  body('plan').optional().isString().withMessage('plan must be a string'),
  body('status')
    .optional()
    .isIn(['active', 'expired', 'cancelled', 'pending'])
    .withMessage('Invalid status'),
];

/**
 * GET /api/admin/subscriptions
 * List subscriptions with filters.
 */
const getSubscriptions = async (req, res) => {
  try {
    const { plan, status } = req.query;
    const query = {};
    if (plan) query.plan = plan;
    if (status) query.status = status;

    const items = await Subscription.find(query).populate(
      'userId',
      'firstName lastName email role'
    );

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/admin/revenue
 * Aggregate revenue and active subscription stats.
 */
const getRevenueAnalytics = async (req, res) => {
  try {
    const [byPlan, activeCount] = await Promise.all([
      Subscription.aggregate([
        {
          $unwind: {
            path: '$paymentHistory',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            'paymentHistory.status': 'success',
          },
        },
        {
          $group: {
            _id: '$plan',
            totalRevenue: { $sum: '$paymentHistory.amount' },
            currency: { $first: '$paymentHistory.currency' },
          },
        },
      ]),
      Subscription.countDocuments({ status: 'active' }),
    ]);

    res.json({
      success: true,
      data: {
        byPlan,
        activeSubscriptions: activeCount,
      },
    });
  } catch (error) {
    console.error('Get revenue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * PUT /api/admin/subscription/update
 * Upsert/modify a user subscription record.
 */
const updateSubscription = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { userId, plan, startDate, endDate, status, payment } = req.body;

    const update = {};
    if (plan) update.plan = plan;
    if (startDate) update.startDate = startDate;
    if (endDate) update.endDate = endDate;
    if (status) update.status = status;

    if (payment) {
      update.$push = { paymentHistory: payment };
    }

    const subscription = await Subscription.findOneAndUpdate(
      { userId },
      update,
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: subscription,
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * PUT /api/admin/subscription/update/:userId
 * Update subscription for a specific user (upgrade/downgrade).
 */
const updateSubscriptionForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { plan, status } = req.body;

    const update = {};
    if (plan) update.plan = plan;
    if (status) update.status = status;

    const subscription = await Subscription.findOneAndUpdate(
      { userId },
      update,
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: subscription,
    });
  } catch (error) {
    console.error('Update subscription for user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * PUT /api/admin/subscription/cancel/:userId
 * Cancel a user subscription.
 */
const cancelSubscriptionForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const subscription = await Subscription.findOneAndUpdate(
      { userId },
      { status: 'cancelled' },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    res.json({
      success: true,
      message: 'Subscription cancelled',
      data: subscription,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * POST /api/admin/plans
 * Create a subscription plan.
 */
const createPlan = async (req, res) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: plan,
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * PUT /api/admin/plans/:id
 * Update a subscription plan.
 */
const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    res.json({
      success: true,
      message: 'Plan updated successfully',
      data: plan,
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * DELETE /api/admin/plans/:id
 * Disable a plan.
 */
const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    res.json({
      success: true,
      message: 'Plan disabled',
      data: plan,
    });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/admin/revenue/export
 * Export revenue report (simplified JSON; CSV generation can be added).
 */
const exportRevenue = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'success' }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error('Export revenue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export revenue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/admin/payments
 * List payments.
 */
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * POST /api/admin/payments/refund/:id
 * Mark a payment as refunded.
 */
const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'refunded' },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({
      success: true,
      message: 'Payment refunded',
      data: payment,
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refund payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
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
};



