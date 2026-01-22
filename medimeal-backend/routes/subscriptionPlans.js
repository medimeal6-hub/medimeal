const express = require('express');
const Plan = require('../models/Plan');

const router = express.Router();

// GET /api/subscription-plans
// Public: returns active subscription plans (no secrets)
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ price: 1, createdAt: -1 });
    res.json({
      success: true,
      data: plans.map((p) => ({
        id: p._id,
        name: p.name,
        description: p.description,
        price: p.price,
        currency: p.currency,
        billingPeriod: p.billingPeriod,
        features: p.features,
      })),
    });
  } catch (error) {
    console.error('List subscription plans error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subscription plans' });
  }
});

module.exports = router;

