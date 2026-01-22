const { validationResult, body } = require('express-validator');
const Food = require('../models/Food');

const foodValidators = [
  body('name').notEmpty().withMessage('Food name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('calories').isNumeric().withMessage('Calories must be numeric'),
  body('protein').isNumeric().withMessage('Protein must be numeric'),
  body('carbs').isNumeric().withMessage('Carbs must be numeric'),
  body('fat').isNumeric().withMessage('Fat must be numeric'),
];

/**
 * POST /api/admin/food
 * Create a new food item with full nutrient + interaction metadata.
 */
const createFood = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    // Detect duplicates by name (case‑insensitive)
    const existing = await Food.findOne({
      name: { $regex: `^${req.body.name}$`, $options: 'i' },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Food with this name already exists',
      });
    }

    const food = await Food.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Food created successfully',
      data: food,
    });
  } catch (error) {
    console.error('Create food error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create food',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/admin/food
 * List / search foods with filters.
 */
const listFood = async (req, res) => {
  try {
    const { search, category, isActive } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (category) query.category = category;
    if (typeof isActive !== 'undefined') {
      query.isActive = isActive === 'true';
    }

    const foods = await Food.find(query).sort({ name: 1 });

    res.json({
      success: true,
      data: foods,
    });
  } catch (error) {
    console.error('List food error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch food items',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * PUT /api/admin/food/:id
 * Update an existing food item.
 */
const updateFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }

    res.json({
      success: true,
      message: 'Food updated successfully',
      data: food,
    });
  } catch (error) {
    console.error('Update food error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update food',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * DELETE /api/admin/food/:id
 * Soft delete a food item (mark as inactive).
 */
const deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }

    res.json({
      success: true,
      message: 'Food deactivated successfully',
      data: food,
    });
  } catch (error) {
    console.error('Delete food error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete food',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  foodValidators,
  createFood,
  listFood,
  updateFood,
  deleteFood,
};



