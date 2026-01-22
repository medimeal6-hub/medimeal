const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Medicine name cannot exceed 100 characters']
  },
  genericName: {
    type: String,
    trim: true,
    maxlength: [100, 'Generic name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Medicine category is required'],
    enum: [
      'Antibiotic', 'Pain Relief', 'Cardiovascular', 'Diabetes', 
      'Hypertension', 'Cholesterol', 'Thyroid', 'Antidepressant',
      'Antihistamine', 'Antacid', 'Vitamin', 'Other'
    ],
    default: 'Other'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  commonDosage: {
    type: String,
    trim: true,
    default: 'As prescribed by doctor'
  },
  sideEffects: [{
    type: String,
    trim: true
  }],
  contraindications: [{
    type: String,
    trim: true
  }],
  warnings: [{
    type: String,
    trim: true
  }],
  storageInstructions: {
    type: String,
    trim: true,
    default: 'Store at room temperature'
  },
  isPrescriptionRequired: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
medicineSchema.index({ name: 1 });
medicineSchema.index({ category: 1 });
medicineSchema.index({ isActive: 1 });

// Static method to find medicines by category
medicineSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ name: 1 });
};

// Static method to search medicines
medicineSchema.statics.search = function(query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { genericName: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  }).sort({ name: 1 });
};

module.exports = mongoose.model('Medicine', medicineSchema);


