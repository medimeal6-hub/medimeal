const mongoose = require('mongoose');

const doctorScheduleSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlots: [{
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
        },
        message: 'Start time must be in HH:mm format'
      }
    },
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
        },
        message: 'End time must be in HH:mm format'
      }
    },
    activity: {
      type: String,
      required: true,
      enum: ['checkup', 'surgery', 'consultation', 'evaluation', 'lunch', 'break', 'meeting', 'other']
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    wardNumber: {
      type: String
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    notes: {
      type: String,
      default: ''
    }
  }],
  isWorkingDay: {
    type: Boolean,
    default: true
  },
  totalHours: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
doctorScheduleSchema.index({ doctor: 1, date: 1 });
doctorScheduleSchema.index({ date: 1 });
doctorScheduleSchema.index({ 'timeSlots.patientId': 1 });

// Pre-save middleware to calculate total hours
doctorScheduleSchema.pre('save', function(next) {
  if (this.timeSlots && this.timeSlots.length > 0) {
    let totalMinutes = 0;
    this.timeSlots.forEach(slot => {
      const start = this.parseTime(slot.startTime);
      const end = this.parseTime(slot.endTime);
      totalMinutes += (end - start);
    });
    this.totalHours = Math.round((totalMinutes / 60) * 100) / 100;
  }
  this.updatedAt = new Date();
  next();
});

// Helper method to parse time string to minutes
doctorScheduleSchema.methods.parseTime = function(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Method to get schedule summary
doctorScheduleSchema.methods.getSummary = function() {
  return {
    id: this._id,
    doctor: this.doctor,
    date: this.date,
    totalSlots: this.timeSlots.length,
    totalHours: this.totalHours,
    isWorkingDay: this.isWorkingDay,
    activities: this.timeSlots.map(slot => ({
      id: slot._id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      activity: slot.activity,
      title: slot.title,
      patientId: slot.patientId,
      wardNumber: slot.wardNumber,
      priority: slot.priority,
      status: slot.status
    }))
  };
};

// Static method to get doctor's schedule for a date range
doctorScheduleSchema.statics.getDoctorSchedule = async function(doctorId, startDate, endDate) {
  return this.find({
    doctor: doctorId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1 });
};

// Static method to get available time slots for a doctor on a specific date
doctorScheduleSchema.statics.getAvailableSlots = async function(doctorId, date) {
  const schedule = await this.findOne({ doctor: doctorId, date });
  if (!schedule) return [];
  
  return schedule.timeSlots.filter(slot => slot.status === 'scheduled');
};

module.exports = mongoose.model('DoctorSchedule', doctorScheduleSchema);




