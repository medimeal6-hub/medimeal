const mongoose = require('mongoose');

const reminderLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  medicationName: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true
  },
  scheduledTime: {
    type: Date,
    required: [true, 'Scheduled time is required']
  },
  sentTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'delivered', 'opened'],
    default: 'sent'
  },
  emailAddress: {
    type: String,
    required: [true, 'Email address is required'],
    trim: true,
    lowercase: true
  },
  subject: {
    type: String,
    required: [true, 'Email subject is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Email message is required'],
    trim: true
  },
  errorMessage: {
    type: String,
    trim: true
  },
  reminderType: {
    type: String,
    enum: ['medication', 'appointment', 'meal', 'exercise'],
    default: 'medication'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readTime: {
    type: Date
  },
  responseTime: {
    type: Date
  },
  userResponse: {
    type: String,
    enum: ['taken', 'skipped', 'delayed', 'no_response'],
    default: 'no_response'
  }
}, {
  timestamps: true
});

// Indexes for better performance
reminderLogSchema.index({ userId: 1 });
reminderLogSchema.index({ sentTime: 1 });
reminderLogSchema.index({ status: 1 });
reminderLogSchema.index({ reminderType: 1 });

// Method to mark as read
reminderLogSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readTime = new Date();
  return this.save();
};

// Method to record user response
reminderLogSchema.methods.recordResponse = function(response) {
  this.userResponse = response;
  this.responseTime = new Date();
  return this.save();
};

// Static method to get reminder statistics for user
reminderLogSchema.statics.getUserStats = function(userId, startDate, endDate) {
  const matchStage = {
    userId: new mongoose.Types.ObjectId(userId)
  };
  
  if (startDate && endDate) {
    matchStage.sentTime = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalReminders: { $sum: 1 },
        sentReminders: {
          $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
        },
        failedReminders: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        readReminders: {
          $sum: { $cond: ['$isRead', 1, 0] }
        },
        takenMedications: {
          $sum: { $cond: [{ $eq: ['$userResponse', 'taken'] }, 1, 0] }
        },
        skippedMedications: {
          $sum: { $cond: [{ $eq: ['$userResponse', 'skipped'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Static method to get recent reminders
reminderLogSchema.statics.getRecentReminders = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ sentTime: -1 })
    .limit(limit)
    .select('medicationName scheduledTime sentTime status userResponse');
};

module.exports = mongoose.model('ReminderLog', reminderLogSchema);
