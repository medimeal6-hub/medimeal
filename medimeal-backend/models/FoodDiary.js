const mongoose = require('mongoose');

/**
 * FoodDiary
 * ---------
 * User meal logging with detailed food items and quantities.
 * Enhanced version of Meal model with more detailed tracking.
 */
const foodDiarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true,
    index: true // YYYY-MM-DD format
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  time: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v),
      message: 'Time must be in HH:mm format'
    }
  },
  foodItems: [{
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food'
    },
    foodName: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      default: 'serving',
      trim: true
    },
    calories: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  totalCalories: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  aiProcessed: {
    type: Boolean,
    default: false
  },
  complianceChecked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

foodDiarySchema.index({ userId: 1, date: 1 });
foodDiarySchema.index({ userId: 1, date: 1, mealType: 1 });

// Calculate total calories before save
foodDiarySchema.pre('save', function(next) {
  if (this.foodItems && this.foodItems.length > 0) {
    this.totalCalories = this.foodItems.reduce((sum, item) => sum + (item.calories || 0), 0);
  }
  next();
});

module.exports = mongoose.model('FoodDiary', foodDiarySchema);
