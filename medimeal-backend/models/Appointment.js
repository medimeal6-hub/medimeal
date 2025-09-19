const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  // Healthcare provider information
  provider: {
    name: {
      type: String,
      required: [true, 'Provider name is required'],
      trim: true,
      maxlength: [100, 'Provider name cannot exceed 100 characters']
    },
    specialization: {
      type: String,
      required: [true, 'Provider specialization is required'],
      trim: true,
      enum: [
        'general-physician', 'cardiologist', 'endocrinologist', 'neurologist',
        'dermatologist', 'orthopedist', 'psychiatrist', 'gynecologist',
        'urologist', 'ophthalmologist', 'ent', 'oncologist', 'pediatrician',
        'dentist', 'physiotherapist', 'nutritionist', 'other'
      ]
    },
    clinic: {
      type: String,
      trim: true,
      maxlength: [200, 'Clinic name cannot exceed 200 characters']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^\+?[\d\s\-\(\)]+$/.test(v);
        },
        message: 'Please provide a valid phone number'
      }
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email'
      }
    }
  },
  // Appointment details
  title: {
    type: String,
    required: [true, 'Appointment title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required'],
    index: true,
    validate: {
      validator: function(date) {
        // Allow past dates for completed appointments
        return date instanceof Date && !isNaN(date);
      },
      message: 'Please provide a valid appointment date'
    }
  },
  duration: {
    type: Number, // Duration in minutes
    default: 30,
    min: [5, 'Appointment duration must be at least 5 minutes'],
    max: [480, 'Appointment duration cannot exceed 8 hours']
  },
  type: {
    type: String,
    required: [true, 'Appointment type is required'],
    enum: ['consultation', 'follow-up', 'check-up', 'procedure', 'test', 'vaccination', 'therapy', 'emergency'],
    default: 'consultation'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'scheduled',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Appointment mode
  mode: {
    type: String,
    enum: ['in-person', 'telemedicine', 'phone'],
    default: 'in-person'
  },
  // For telemedicine appointments
  meetingLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Meeting link must be a valid URL'
    }
  },
  meetingId: {
    type: String,
    trim: true
  },
  meetingPassword: {
    type: String,
    trim: true
  },
  // Reason for visit
  reasonForVisit: {
    type: String,
    required: [true, 'Reason for visit is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  // Symptoms to discuss
  symptomsToDiscuss: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Symptom'
  }],
  // Preparation instructions
  preparationInstructions: [{
    instruction: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  // Questions to ask the doctor
  questionsToAsk: [{
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: [300, 'Question cannot exceed 300 characters']
    },
    asked: {
      type: Boolean,
      default: false
    },
    answer: {
      type: String,
      trim: true
    }
  }],
  // Reminder settings
  reminderSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    reminderTimes: [{
      type: Number, // Hours before appointment
      default: [24, 2] // 24 hours and 2 hours before
    }],
    sentReminders: [{
      sentAt: Date,
      type: String // 'email', 'sms', 'notification'
    }]
  },
  // Post-appointment information
  appointmentNotes: {
    userNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'User notes cannot exceed 2000 characters']
    },
    diagnosis: {
      type: String,
      trim: true,
      maxlength: [1000, 'Diagnosis cannot exceed 1000 characters']
    },
    prescriptions: [{
      medication: {
        type: String,
        required: true,
        trim: true
      },
      dosage: {
        type: String,
        required: true,
        trim: true
      },
      frequency: {
        type: String,
        required: true,
        trim: true
      },
      duration: {
        type: String,
        trim: true
      },
      instructions: {
        type: String,
        trim: true
      }
    }],
    testResults: [{
      testName: {
        type: String,
        required: true,
        trim: true
      },
      result: {
        type: String,
        trim: true
      },
      normalRange: {
        type: String,
        trim: true
      },
      notes: {
        type: String,
        trim: true
      },
      datePerformed: Date
    }],
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: Date,
    followUpInstructions: {
      type: String,
      trim: true
    }
  },
  // Cost information
  cost: {
    consultation: {
      type: Number,
      min: 0
    },
    procedures: [{
      name: String,
      cost: Number
    }],
    total: {
      type: Number,
      min: 0
    },
    insurance: {
      provider: String,
      claimNumber: String,
      covered: Boolean,
      copay: Number
    }
  },
  // Attachments (reports, prescriptions, etc.)
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['prescription', 'report', 'image', 'document', 'other'],
      default: 'document'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Cancellation information
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledAt: Date,
  cancelledBy: {
    type: String,
    enum: ['user', 'provider', 'system']
  },
  // Rescheduling information
  rescheduledFrom: Date,
  rescheduledTo: Date,
  rescheduledAt: Date,
  rescheduledBy: {
    type: String,
    enum: ['user', 'provider']
  },
  rescheduledReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
appointmentSchema.index({ userId: 1, appointmentDate: 1 });
appointmentSchema.index({ userId: 1, status: 1, appointmentDate: 1 });
appointmentSchema.index({ 'provider.specialization': 1, appointmentDate: 1 });

// Virtual for checking if appointment is upcoming
appointmentSchema.virtual('isUpcoming').get(function() {
  return this.appointmentDate > new Date() && this.status === 'scheduled';
});

// Virtual for checking if appointment is overdue
appointmentSchema.virtual('isOverdue').get(function() {
  return this.appointmentDate < new Date() && this.status === 'scheduled';
});

// Virtual for formatted appointment date
appointmentSchema.virtual('formattedDate').get(function() {
  return this.appointmentDate.toLocaleDateString();
});

// Virtual for formatted appointment time
appointmentSchema.virtual('formattedTime').get(function() {
  return this.appointmentDate.toLocaleTimeString();
});

// Method to reschedule appointment
appointmentSchema.methods.reschedule = function(newDate, reason, rescheduledBy) {
  this.rescheduledFrom = this.appointmentDate;
  this.rescheduledTo = newDate;
  this.appointmentDate = newDate;
  this.rescheduledAt = new Date();
  this.rescheduledReason = reason;
  this.rescheduledBy = rescheduledBy;
  this.status = 'rescheduled';
  
  return this.save();
};

// Method to cancel appointment
appointmentSchema.methods.cancel = function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  this.cancelledBy = cancelledBy;
  
  return this.save();
};

// Method to complete appointment
appointmentSchema.methods.complete = function(notes = {}) {
  this.status = 'completed';
  this.appointmentNotes = { ...this.appointmentNotes, ...notes };
  
  return this.save();
};

// Method to add question to ask
appointmentSchema.methods.addQuestion = function(question) {
  this.questionsToAsk.push({ question });
  return this.save();
};

// Method to mark question as asked
appointmentSchema.methods.markQuestionAsked = function(questionId, answer = '') {
  const question = this.questionsToAsk.id(questionId);
  if (question) {
    question.asked = true;
    if (answer) question.answer = answer;
  }
  return this.save();
};

// Static method to get upcoming appointments
appointmentSchema.statics.getUpcoming = function(userId, limit = 10) {
  return this.find({
    userId,
    appointmentDate: { $gt: new Date() },
    status: { $in: ['scheduled', 'confirmed'] }
  })
  .sort({ appointmentDate: 1 })
  .limit(limit);
};

// Static method to get appointments by date range
appointmentSchema.statics.getAppointmentsInRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    appointmentDate: { $gte: startDate, $lte: endDate }
  }).sort({ appointmentDate: 1 });
};

// Static method to get appointments by provider specialization
appointmentSchema.statics.getBySpecialization = function(userId, specialization) {
  return this.find({
    userId,
    'provider.specialization': specialization
  }).sort({ appointmentDate: -1 });
};

module.exports = mongoose.model('Appointment', appointmentSchema);