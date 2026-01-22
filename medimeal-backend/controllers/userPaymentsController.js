const crypto = require('crypto');
const Razorpay = require('razorpay');

const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');

function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    const err = new Error('Razorpay is not configured (missing env vars)');
    err.status = 500;
    throw err;
  }

  return new Razorpay({ key_id, key_secret });
}

function computeEndDate(startDate, billingPeriod) {
  if (!billingPeriod || billingPeriod === 'lifetime') return undefined;
  const end = new Date(startDate);
  if (billingPeriod === 'yearly') end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1); // monthly default
  return end;
}

/**
 * POST /api/user/payments/razorpay/order
 * Body: { planId } OR { planName }
 */
async function createRazorpayOrder(req, res) {
  try {
    const { planId, planName } = req.body || {};

    if (!planId && !planName) {
      return res.status(400).json({
        success: false,
        message: 'planId or planName is required',
      });
    }

    const plan = planId
      ? await Plan.findById(planId)
      : await Plan.findOne({ name: planName });

    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found or inactive',
      });
    }

    const currency = String(plan.currency || 'INR').toUpperCase();
    if (currency !== 'INR') {
      return res.status(400).json({
        success: false,
        message: `Razorpay currently supports only INR in this integration (got ${currency})`,
      });
    }

    const amountRupees = Number(plan.price);
    if (!Number.isFinite(amountRupees) || amountRupees <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan price',
      });
    }

    const amountPaise = Math.round(amountRupees * 100);
    // Razorpay receipt max length is 40 chars
    const receipt = `sub_${String(req.user._id).slice(-8)}_${String(plan._id).slice(-8)}_${Date.now().toString(36)}`;

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency,
      receipt,
      notes: {
        userId: String(req.user._id),
        planId: String(plan._id),
        planName: String(plan.name),
      },
    });

    return res.json({
      success: true,
      data: {
        keyId: process.env.RAZORPAY_KEY_ID, // safe to expose (public)
        order,
        plan: {
          id: plan._id,
          name: plan.name,
          price: plan.price,
          currency,
          billingPeriod: plan.billingPeriod,
          features: plan.features,
        },
      },
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to create Razorpay order',
    });
  }
}

/**
 * POST /api/user/payments/razorpay/verify
 * Body: { planId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
async function verifyRazorpayPayment(req, res) {
  try {
    const { planId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body || {};

    if (!planId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message:
          'planId, razorpay_order_id, razorpay_payment_id, and razorpay_signature are required',
      });
    }

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found or inactive',
      });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay is not configured (missing secret)',
      });
    }

    const expected = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    // Idempotency: if already recorded, return existing payment
    const existing = await Payment.findOne({
      provider: 'razorpay',
      transactionId: razorpay_payment_id,
      userId: req.user._id,
    });

    if (existing) {
      return res.json({
        success: true,
        message: 'Payment already verified',
        data: { payment: existing },
      });
    }

    const currency = String(plan.currency || 'INR').toUpperCase();
    const amount = Number(plan.price);
    const now = new Date();

    const payment = await Payment.create({
      userId: req.user._id,
      subscriptionId: undefined,
      amount,
      currency,
      provider: 'razorpay',
      transactionId: razorpay_payment_id,
      status: 'success',
      meta: {
        razorpay: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        },
        plan: {
          id: String(plan._id),
          name: String(plan.name),
          billingPeriod: plan.billingPeriod,
        },
      },
    });

    const endDate = computeEndDate(now, plan.billingPeriod);

    const subscriptionUpdate = {
      plan: plan.name,
      status: 'active',
      startDate: now,
      ...(endDate ? { endDate } : {}),
      features: Array.isArray(plan.features) ? plan.features : [],
      $push: {
        paymentHistory: {
          amount,
          currency,
          paidAt: now,
          provider: 'razorpay',
          transactionId: razorpay_payment_id,
          status: 'success',
          meta: {
            orderId: razorpay_order_id,
            planId: String(plan._id),
          },
        },
      },
    };

    const subscription = await Subscription.findOneAndUpdate(
      { userId: req.user._id },
      subscriptionUpdate,
      { new: true, upsert: true }
    );

    // Backlink payment -> subscription (best effort)
    payment.subscriptionId = subscription._id;
    await payment.save();

    return res.json({
      success: true,
      message: 'Payment verified and subscription activated',
      data: { payment, subscription },
    });
  } catch (error) {
    console.error('Verify Razorpay payment error:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to verify payment',
    });
  }
}

/**
 * GET /api/user/payments
 * List payments for current user
 */
async function listMyPayments(req, res) {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);
    return res.json({ success: true, data: payments });
  } catch (error) {
    console.error('List payments error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
}

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  listMyPayments,
};

