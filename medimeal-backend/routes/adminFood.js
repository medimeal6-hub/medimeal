const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { createAuditLogger } = require('../middleware/audit');
const {
  foodValidators,
  createFood,
  listFood,
  updateFood,
  deleteFood,
} = require('../controllers/foodAdminController');

const router = express.Router();

router.use(auth, authorize('admin'));

router.post(
  '/food',
  foodValidators,
  createAuditLogger('admin.food', 'CREATE', 'medium'),
  createFood
);

router.get(
  '/food',
  createAuditLogger('admin.food', 'LIST'),
  listFood
);

router.put(
  '/food/:id',
  createAuditLogger('admin.food', 'UPDATE', 'medium'),
  updateFood
);

router.delete(
  '/food/:id',
  createAuditLogger('admin.food', 'DELETE', 'high'),
  deleteFood
);

module.exports = router;



