const mongoose = require('mongoose');

const healthGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'Goal type is required'],
    enum: ['blood-pressure', 'blood-sugar', 'weight', 'heart-rate', 'exercise', 'medication-adherence', 'custom'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: [100, 'Goal title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Goal description cannot exceed 500 characters']
  },
  // Target values - structure depends on goal type
  targetValue: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Target value is required']
  },
  // Current progress towards the goal
  currentValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  unit: {
    type: String,
    required: [true, 'Unit is required']
  },
  // Goal timeline
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(endDate) {
        return endDate > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  // Goal status
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active',
    index: true
  },
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  // Reminder settings
  reminderSettings: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    reminderTime: {
      type: String,
      validate: {
        validator: (v) => !v || /^([01]\d|2[0-3]):[0-5]\d$/.test(v),
        message: 'Reminder time must be in HH:mm (24h) format'
      }
    }
  },
  // Progress tracking
  progressHistory: [{
    value: mongoose.Schema.Types.Mixed,
    recordedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  // Achievement tracking
  completedAt: Date,
  achievementPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});

// Compound indexes
healthGoalSchema.index({ userId: 1, status: 1, endDate: 1 });
healthGoalSchema.index({ userId: 1, type: 1 });

// Virtual for checking if goal is overdue
healthGoalSchema.virtual('isOverdue').get(function() {
  return this.status === 'active' && new Date() > this.endDate;
});

// Virtual for days remaining
healthGoalSchema.virtual('daysRemaining').get(function() {
  if (this.status !== 'active') return 0;
  const now = new Date();
  const timeDiff = this.endDate.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Method to update progress
healthGoalSchema.methods.updateProgress = function(value, notes = '') {
  this.currentValue = value;
  this.progressHistory.push({
    value,
    recordedAt: new Date(),
    notes
  });

  // Calculate achievement percentage based on goal type
  this.achievementPercentage = this.calculateAchievementPercentage();

  // Check if goal is completed
  if (this.achievementPercentage >= 100) {
    this.status = 'completed';
    this.completedAt = new Date();
  }

  return this.save();
};

// Method to calculate achievement percentage
healthGoalSchema.methods.calculateAchievementPercentage = function() {
  if (!this.currentValue || !this.targetValue) return 0;

  switch (this.type) {
    case 'weight':
      // For weight loss goals, calculate based on progress towards target
      if (typeof this.targetValue === 'number' && typeof this.currentValue === 'number') {
        const initialWeight = this.progressHistory.length > 0 ? this.progressHistory[0].value : this.currentValue;
        const totalToLose = Math.abs(initialWeight - this.targetValue);
        const lostSoFar = Math.abs(initialWeight - this.currentValue);
        return Math.min((lostSoFar / totalToLose) * 100, 100);
      }
      break;
    case 'blood-pressure':
    case 'blood-sugar':
    case 'heart-rate':
      // For vital signs, calculate based on how close current value is to target range
      if (this.isWithinTargetRange()) {
        return 100;
      }
      return 50; // Partial progress if not within range
    case 'exercise':
      // For exercise goals, calculate based on frequency or duration
      if (typeof this.targetValue === 'number' && typeof this.currentValue === 'number') {
        return Math.min((this.currentValue / this.targetValue) * 100, 100);
      }
      break;
    default:
      return 0;
  }

  return 0;
};

// Method to check if current value is within target range
healthGoalSchema.methods.isWithinTargetRange = function() {
  if (!this.currentValue || !this.targetValue) return false;

  switch (this.type) {
    case 'blood-pressure':
      if (this.targetValue.systolic && this.targetValue.diastolic && 
          this.currentValue.systolic && this.currentValue.diastolic) {
        return this.currentValue.systolic <= this.targetValue.systolic &&
               this.currentValue.diastolic <= this.targetValue.diastolic;
      }
      break;
    case 'blood-sugar':
    case 'heart-rate':
      if (this.targetValue.min && this.targetValue.max && 
          typeof this.currentValue === 'number') {
        return this.currentValue >= this.targetValue.min &&
               this.currentValue <= this.targetValue.max;
      }
      break;
    case 'weight':
      if (typeof this.targetValue === 'number' && typeof this.currentValue === 'number') {
        return Math.abs(this.currentValue - this.targetValue) <= 1; // Within 1kg tolerance
      }
      break;
  }

  return false;
};

// Static method to get active goals for a user
healthGoalSchema.statics.getActiveGoals = function(userId) {
  return this.find({ 
    userId, 
    status: 'active',
    endDate: { $gte: new Date() }
  }).sort({ priority: -1, createdAt: -1 });
};

// Static method to get goals by type
healthGoalSchema.statics.getGoalsByType = function(userId, type) {
  return this.find({ userId, type }).sort({ createdAt: -1 });
};

// Method to pause goal
healthGoalSchema.methods.pauseGoal = function() {
  this.status = 'paused';
  return this.save();
};

// Method to resume goal
healthGoalSchema.methods.resumeGoal = function() {
  if (this.status === 'paused') {
    this.status = 'active';
  }
  return this.save();
};

// Method to cancel goal
healthGoalSchema.methods.cancelGoal = function() {
  this.status = 'cancelled';
  return this.save();
};

module.exports = mongoose.model('HealthGoal', healthGoalSchema);