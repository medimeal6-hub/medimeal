const FoodDrugConflict = require('../models/FoodDrugConflict');
const Food = require('../models/Food');
const Medicine = require('../models/Medicine');

// @desc    Check food-drug conflicts for user's medications
// @route   POST /api/conflicts/check
// @access  Private
const checkConflicts = async (req, res) => {
  try {
    const { medications, foods } = req.body;

    if (!medications || !Array.isArray(medications)) {
      return res.status(400).json({
        success: false,
        message: 'Medications array is required'
      });
    }

    const conflicts = [];
    const safeFoods = [];
    const unsafeFoods = [];

    // Check each medication for conflicts
    for (const medication of medications) {
      const medicineConflicts = await FoodDrugConflict.findByMedicine(medication.name);
      
      for (const conflict of medicineConflicts) {
        for (const avoidFood of conflict.avoid) {
          // Check if any of the provided foods match the avoided foods
          const matchingFoods = foods ? foods.filter(food => 
            food.toLowerCase().includes(avoidFood.toLowerCase()) ||
            avoidFood.toLowerCase().includes(food.toLowerCase())
          ) : [];

          if (matchingFoods.length > 0) {
            conflicts.push({
              medicine: medication.name,
              avoidFood,
              severity: conflict.severity,
              description: conflict.description,
              effects: conflict.effects,
              recommendations: conflict.recommendations,
              timeGap: conflict.timeGap,
              timeGapUnit: conflict.timeGapUnit,
              matchingFoods
            });
          }
        }
      }
    }

    // Categorize foods as safe or unsafe
    if (foods) {
      for (const food of foods) {
        let isUnsafe = false;
        for (const conflict of conflicts) {
          if (conflict.matchingFoods.includes(food)) {
            isUnsafe = true;
            break;
          }
        }
        
        if (isUnsafe) {
          unsafeFoods.push(food);
        } else {
          safeFoods.push(food);
        }
      }
    }

    res.json({
      success: true,
      data: {
        conflicts,
        safeFoods,
        unsafeFoods,
        totalConflicts: conflicts.length,
        conflictSummary: {
          critical: conflicts.filter(c => c.severity === 'Critical').length,
          high: conflicts.filter(c => c.severity === 'High').length,
          medium: conflicts.filter(c => c.severity === 'Medium').length,
          low: conflicts.filter(c => c.severity === 'Low').length
        }
      }
    });

  } catch (error) {
    console.error('Check conflicts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check conflicts',
      error: error.message
    });
  }
};

// @desc    Get all food-drug conflicts
// @route   GET /api/conflicts
// @access  Private
const getAllConflicts = async (req, res) => {
  try {
    const { medicine, severity, limit = 50, page = 1 } = req.query;

    let query = { isActive: true };

    if (medicine) {
      query.medicine = { $regex: medicine, $options: 'i' };
    }

    if (severity) {
      query.severity = severity;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [conflicts, totalCount] = await Promise.all([
      FoodDrugConflict.find(query)
        .sort({ medicine: 1, severity: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      FoodDrugConflict.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        conflicts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasNext: skip + conflicts.length < totalCount,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all conflicts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conflicts',
      error: error.message
    });
  }
};

// @desc    Get conflicts for specific medicine
// @route   GET /api/conflicts/medicine/:medicineName
// @access  Private
const getConflictsForMedicine = async (req, res) => {
  try {
    const { medicineName } = req.params;

    const conflicts = await FoodDrugConflict.getConflictsForMedicine(medicineName);

    res.json({
      success: true,
      data: { conflicts }
    });

  } catch (error) {
    console.error('Get conflicts for medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conflicts for medicine',
      error: error.message
    });
  }
};

// @desc    Check if specific food conflicts with medicine
// @route   POST /api/conflicts/check-specific
// @access  Private
const checkSpecificConflict = async (req, res) => {
  try {
    const { medicineName, foodName } = req.body;

    if (!medicineName || !foodName) {
      return res.status(400).json({
        success: false,
        message: 'Medicine name and food name are required'
      });
    }

    const conflict = await FoodDrugConflict.checkConflict(medicineName, foodName);

    if (conflict) {
      res.json({
        success: true,
        data: {
          hasConflict: true,
          conflict: {
            medicine: conflict.medicine,
            avoid: conflict.avoid,
            severity: conflict.severity,
            description: conflict.description,
            effects: conflict.effects,
            recommendations: conflict.recommendations,
            timeGap: conflict.timeGap,
            timeGapUnit: conflict.timeGapUnit
          }
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          hasConflict: false,
          message: 'No conflict found between this medicine and food'
        }
      });
    }

  } catch (error) {
    console.error('Check specific conflict error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check specific conflict',
      error: error.message
    });
  }
};

// @desc    Get safe foods for user's medications
// @route   POST /api/conflicts/safe-foods
// @access  Private
const getSafeFoods = async (req, res) => {
  try {
    const { medications } = req.body;

    if (!medications || !Array.isArray(medications)) {
      return res.status(400).json({
        success: false,
        message: 'Medications array is required'
      });
    }

    // Get all foods
    const allFoods = await Food.find({ isActive: true }).select('name category isHealthy');
    
    // Get all conflicts for user's medications
    const allConflicts = [];
    for (const medication of medications) {
      const conflicts = await FoodDrugConflict.findByMedicine(medication.name);
      allConflicts.push(...conflicts);
    }

    // Filter out foods that conflict with medications
    const safeFoods = allFoods.filter(food => {
      return !allConflicts.some(conflict => 
        conflict.avoid.some(avoidFood => 
          food.name.toLowerCase().includes(avoidFood.toLowerCase()) ||
          avoidFood.toLowerCase().includes(food.name.toLowerCase())
        )
      );
    });

    // Categorize safe foods
    const categorizedFoods = {
      breakfast: safeFoods.filter(food => food.category === 'Breakfast'),
      lunch: safeFoods.filter(food => food.category === 'Lunch'),
      dinner: safeFoods.filter(food => food.category === 'Dinner'),
      snack: safeFoods.filter(food => food.category === 'Snack'),
      healthy: safeFoods.filter(food => food.isHealthy)
    };

    res.json({
      success: true,
      data: {
        safeFoods,
        categorizedFoods,
        totalSafeFoods: safeFoods.length,
        summary: {
          breakfast: categorizedFoods.breakfast.length,
          lunch: categorizedFoods.lunch.length,
          dinner: categorizedFoods.dinner.length,
          snack: categorizedFoods.snack.length,
          healthy: categorizedFoods.healthy.length
        }
      }
    });

  } catch (error) {
    console.error('Get safe foods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get safe foods',
      error: error.message
    });
  }
};

module.exports = {
  checkConflicts,
  getAllConflicts,
  getConflictsForMedicine,
  checkSpecificConflict,
  getSafeFoods
};
