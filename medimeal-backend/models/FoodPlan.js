const mongoose = require('mongoose');

const foodPlanSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor ID is required']
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required']
  },
  planName: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
    maxlength: [100, 'Plan name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  breakfast: [{
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true
    },
    foodName: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: String,
      default: '1 serving',
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Notes cannot exceed 200 characters']
    }
  }],
  lunch: [{
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true
    },
    foodName: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: String,
      default: '1 serving',
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Notes cannot exceed 200 characters']
    }
  }],
  dinner: [{
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true
    },
    foodName: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: String,
      default: '1 serving',
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Notes cannot exceed 200 characters']
    }
  }],
  snacks: [{
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true
    },
    foodName: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: String,
      default: '1 serving',
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Notes cannot exceed 200 characters']
    }
  }],
  generalInstructions: {
    type: String,
    trim: true,
    maxlength: [1000, 'General instructions cannot exceed 1000 characters']
  },
  dietaryRestrictions: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-allergy', 'low-sodium', 'diabetic-friendly']
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completionDate: {
    type: Date
  },
  patientNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Patient notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for better performance
foodPlanSchema.index({ doctorId: 1 });
foodPlanSchema.index({ patientId: 1 });
foodPlanSchema.index({ isActive: 1 });
foodPlanSchema.index({ isCompleted: 1 });

// Virtual for total calories
foodPlanSchema.virtual('totalCalories').get(function() {
  let total = 0;
  const allMeals = [...this.breakfast, ...this.lunch, ...this.dinner, ...this.snacks];
  // This would need to be calculated by fetching food data
  return total;
});

// Method to mark as completed
foodPlanSchema.methods.markCompleted = function() {
  this.isCompleted = true;
  this.completionDate = new Date();
  return this.save();
};

// Static method to find active plans for patient
foodPlanSchema.statics.findActiveForPatient = function(patientId) {
  return this.find({
    patientId,
    isActive: true,
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gte: new Date() } }
    ]
  }).populate('doctorId', 'firstName lastName email').sort({ createdAt: -1 });
};

// Static method to find plans by doctor
foodPlanSchema.statics.findByDoctor = function(doctorId) {
  return this.find({ doctorId, isActive: true })
    .populate('patientId', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('FoodPlan', foodPlanSchema);
