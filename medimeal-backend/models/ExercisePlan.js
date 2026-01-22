const mongoose = require('mongoose');

const exercisePlanSchema = new mongoose.Schema({
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
  morning: {
    exercise: {
      type: String,
      trim: true,
      maxlength: [200, 'Exercise name cannot exceed 200 characters']
    },
    duration: {
      type: String,
      trim: true,
      maxlength: [50, 'Duration cannot exceed 50 characters']
    },
    intensity: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Notes cannot exceed 200 characters']
    }
  },
  afternoon: {
    exercise: {
      type: String,
      trim: true,
      maxlength: [200, 'Exercise name cannot exceed 200 characters']
    },
    duration: {
      type: String,
      trim: true,
      maxlength: [50, 'Duration cannot exceed 50 characters']
    },
    intensity: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Notes cannot exceed 200 characters']
    }
  },
  evening: {
    exercise: {
      type: String,
      trim: true,
      maxlength: [200, 'Exercise name cannot exceed 200 characters']
    },
    duration: {
      type: String,
      trim: true,
      maxlength: [50, 'Duration cannot exceed 50 characters']
    },
    intensity: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Notes cannot exceed 200 characters']
    }
  },
  generalInstructions: {
    type: String,
    trim: true,
    maxlength: [1000, 'General instructions cannot exceed 1000 characters']
  },
  restrictions: [{
    type: String,
    trim: true,
    maxlength: [100, 'Restriction cannot exceed 100 characters']
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
exercisePlanSchema.index({ doctorId: 1 });
exercisePlanSchema.index({ patientId: 1 });
exercisePlanSchema.index({ isActive: 1 });
exercisePlanSchema.index({ isCompleted: 1 });

// Method to mark as completed
exercisePlanSchema.methods.markCompleted = function() {
  this.isCompleted = true;
  this.completionDate = new Date();
  return this.save();
};

// Static method to find active plans for patient
exercisePlanSchema.statics.findActiveForPatient = function(patientId) {
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
exercisePlanSchema.statics.findByDoctor = function(doctorId) {
  return this.find({ doctorId, isActive: true })
    .populate('patientId', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('ExercisePlan', exercisePlanSchema);


