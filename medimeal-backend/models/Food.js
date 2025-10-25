const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Food name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Food category is required'],
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Beverage'],
    default: 'Lunch'
  },
  calories: {
    type: Number,
    required: [true, 'Calories are required'],
    min: [0, 'Calories cannot be negative']
  },
  protein: {
    type: Number,
    required: [true, 'Protein content is required'],
    min: [0, 'Protein cannot be negative']
  },
  carbs: {
    type: Number,
    required: [true, 'Carbohydrates are required'],
    min: [0, 'Carbohydrates cannot be negative']
  },
  fat: {
    type: Number,
    required: [true, 'Fat content is required'],
    min: [0, 'Fat cannot be negative']
  },
  fiber: {
    type: Number,
    default: 0,
    min: [0, 'Fiber cannot be negative']
  },
  sugar: {
    type: Number,
    default: 0,
    min: [0, 'Sugar cannot be negative']
  },
  sodium: {
    type: Number,
    default: 0,
    min: [0, 'Sodium cannot be negative']
  },
  image: {
    type: String,
    default: '',
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Image must be a valid URL ending with jpg, jpeg, png, gif, or webp'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isHealthy: {
    type: Boolean,
    default: true
  },
  isVegetarian: {
    type: Boolean,
    default: true
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  isGlutenFree: {
    type: Boolean,
    default: true
  },
  isDiabeticFriendly: {
    type: Boolean,
    default: true
  },
  servingSize: {
    type: String,
    default: '1 serving',
    trim: true
  },
  preparationTime: {
    type: Number,
    default: 0,
    min: [0, 'Preparation time cannot be negative']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  instructions: [{
    type: String,
    trim: true
  }],
  nutritionalBenefits: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
foodSchema.index({ name: 1 });
foodSchema.index({ category: 1 });
foodSchema.index({ isHealthy: 1 });
foodSchema.index({ tags: 1 });
foodSchema.index({ isActive: 1 });

// Virtual for full nutritional info
foodSchema.virtual('nutritionalInfo').get(function() {
  return {
    calories: this.calories,
    protein: this.protein,
    carbs: this.carbs,
    fat: this.fat,
    fiber: this.fiber,
    sugar: this.sugar,
    sodium: this.sodium
  };
});

// Method to check if food is compatible with dietary restrictions
foodSchema.methods.isCompatibleWith = function(restrictions = []) {
  if (restrictions.includes('vegetarian') && !this.isVegetarian) return false;
  if (restrictions.includes('vegan') && !this.isVegan) return false;
  if (restrictions.includes('gluten-free') && !this.isGlutenFree) return false;
  if (restrictions.includes('diabetic-friendly') && !this.isDiabeticFriendly) return false;
  return true;
};

// Static method to find foods by category
foodSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ name: 1 });
};

// Static method to find healthy foods
foodSchema.statics.findHealthy = function() {
  return this.find({ isHealthy: true, isActive: true }).sort({ calories: 1 });
};

// Static method to search foods
foodSchema.statics.search = function(query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  }).sort({ name: 1 });
};

module.exports = mongoose.model('Food', foodSchema);
