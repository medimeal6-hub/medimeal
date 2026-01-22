const express = require('express');
const { auth } = require('../middleware/auth');

const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  listMyPayments,
} = require('../controllers/userPaymentsController');

const router = express.Router();

// GET /api/user/payments
router.get('/', auth, listMyPayments);

// Razorpay Checkout flow
// POST /api/user/payments/razorpay/order
router.post('/razorpay/order', auth, createRazorpayOrder);

// POST /api/user/payments/razorpay/verify
router.post('/razorpay/verify', auth, verifyRazorpayPayment);

module.exports = router;

