const mongoose = require('mongoose');

const foodDrugConflictSchema = new mongoose.Schema({
  medicine: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
    maxlength: [100, 'Medicine name cannot exceed 100 characters']
  },
  avoid: [{
    type: String,
    trim: true,
    maxlength: [100, 'Food name cannot exceed 100 characters']
  }],
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  effects: {
    type: String,
    trim: true,
    maxlength: [500, 'Effects description cannot exceed 500 characters']
  },
  recommendations: {
    type: String,
    trim: true,
    maxlength: [500, 'Recommendations cannot exceed 500 characters']
  },
  timeGap: {
    type: Number,
    default: 2,
    min: [0, 'Time gap cannot be negative']
  },
  timeGapUnit: {
    type: String,
    enum: ['minutes', 'hours', 'days'],
    default: 'hours'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
foodDrugConflictSchema.index({ medicine: 1 });
foodDrugConflictSchema.index({ severity: 1 });
foodDrugConflictSchema.index({ isActive: 1 });

// Static method to find conflicts by medicine
foodDrugConflictSchema.statics.findByMedicine = function(medicineName) {
  return this.find({ 
    medicine: { $regex: medicineName, $options: 'i' },
    isActive: true 
  });
};

// Static method to check if food conflicts with medicine
foodDrugConflictSchema.statics.checkConflict = function(medicineName, foodName) {
  return this.findOne({
    medicine: { $regex: medicineName, $options: 'i' },
    avoid: { $in: [new RegExp(foodName, 'i')] },
    isActive: true
  });
};

// Static method to get all conflicts for a medicine
foodDrugConflictSchema.statics.getConflictsForMedicine = function(medicineName) {
  return this.find({
    medicine: { $regex: medicineName, $options: 'i' },
    isActive: true
  }).select('avoid severity description effects recommendations timeGap timeGapUnit');
};

module.exports = mongoose.model('FoodDrugConflict', foodDrugConflictSchema);
