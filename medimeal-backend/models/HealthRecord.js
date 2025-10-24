const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'Health record type is required'],
    enum: ['blood-pressure', 'blood-sugar', 'weight', 'heart-rate', 'temperature', 'bmi'],
    index: true
  },
  // For blood pressure: { systolic: 120, diastolic: 80 }
  // For other metrics: { value: 95 }
  values: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Health record values are required'],
    validate: {
      validator: function(values) {
        if (this.type === 'blood-pressure') {
          return values.systolic && values.diastolic && 
                 typeof values.systolic === 'number' && 
                 typeof values.diastolic === 'number' &&
                 values.systolic > 0 && values.diastolic > 0 &&
                 values.systolic <= 300 && values.diastolic <= 200;
        }
        return values.value !== undefined && 
               typeof values.value === 'number' && 
               values.value > 0;
      },
      message: 'Invalid health record values'
    }
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['mmHg', 'mg/dL', 'kg', 'bpm', '°C', '°F', 'kg/m²']
  },
  recordedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  // For tracking the source of the data
  source: {
    type: String,
    enum: ['manual', 'device', 'import'],
    default: 'manual'
  },
  // Device information if recorded from a device
  deviceInfo: {
    name: String,
    model: String,
    manufacturer: String
  },
  // Flag for user verification of the reading
  isVerified: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
healthRecordSchema.index({ userId: 1, type: 1, recordedAt: -1 });
healthRecordSchema.index({ userId: 1, recordedAt: -1 });
healthRecordSchema.index({ type: 1, recordedAt: -1 });

// Virtual for formatted blood pressure
healthRecordSchema.virtual('formattedValue').get(function() {
  if (this.type === 'blood-pressure' && this.values.systolic && this.values.diastolic) {
    return `${this.values.systolic}/${this.values.diastolic}`;
  }
  return this.values.value;
});

// Method to check if value is within normal range
healthRecordSchema.methods.isWithinNormalRange = function() {
  const normalRanges = {
    'blood-pressure': {
      min: { systolic: 90, diastolic: 60 },
      max: { systolic: 130, diastolic: 85 }
    },
    'blood-sugar': {
      min: { value: 80 },
      max: { value: 120 }
    },
    'heart-rate': {
      min: { value: 60 },
      max: { value: 80 }
    },
    'weight': {
      // This would need to be calculated based on user's height and BMI
      min: { value: 0 },
      max: { value: 500 }
    }
  };

  const range = normalRanges[this.type];
  if (!range) return null;

  if (this.type === 'blood-pressure') {
    return this.values.systolic >= range.min.systolic && 
           this.values.systolic <= range.max.systolic &&
           this.values.diastolic >= range.min.diastolic && 
           this.values.diastolic <= range.max.diastolic;
  }

  return this.values.value >= range.min.value && this.values.value <= range.max.value;
};

// Method to get status based on normal ranges
healthRecordSchema.methods.getStatus = function() {
  const isNormal = this.isWithinNormalRange();
  if (isNormal === null) return 'unknown';
  return isNormal ? 'normal' : 'abnormal';
};

// Static method to get latest records by type for a user
healthRecordSchema.statics.getLatestByType = function(userId, type, limit = 1) {
  return this.find({ userId, type })
    .sort({ recordedAt: -1 })
    .limit(limit);
};

// Static method to get records within date range
healthRecordSchema.statics.getRecordsInRange = function(userId, startDate, endDate, type = null) {
  const query = {
    userId,
    recordedAt: { $gte: startDate, $lte: endDate }
  };
  
  if (type) {
    query.type = type;
  }

  return this.find(query).sort({ recordedAt: -1 });
};

// Method to get target ranges (could be customized per user)
healthRecordSchema.methods.getTargetRange = function() {
  const defaultTargets = {
    'blood-pressure': '< 130/85',
    'blood-sugar': '80-120',
    'heart-rate': '60-80',
    'weight': '65-70' // This should be calculated based on user profile
  };

  return defaultTargets[this.type] || 'Consult doctor';
};

module.exports = mongoose.model('HealthRecord', healthRecordSchema);