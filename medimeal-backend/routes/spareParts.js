const express = require('express');

const router = express.Router();

// Minimal placeholder endpoint used by some admin UI modules
// GET /api/spare-parts
router.get('/', async (req, res) => {
  return res.json({
    success: true,
    data: [],
  });
});

module.exports = router;

