const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  // Basic event information
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  type: {
    type: String,
    required: [true, 'Event type is required'],
    enum: ['meal', 'medication', 'appointment', 'exercise'],
    index: true
  },
  
  // Date and time
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    index: true
  },
  
  time: {
    type: String,
    required: [true, 'Event time is required'],
    validate: {
      validator: function(v) {
        return /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
      },
      message: 'Time must be in HH:mm format'
    }
  },
  
  duration: {
    type: Number,
    default: 30,
    min: [1, 'Duration must be at least 1 minute'],
    max: [1440, 'Duration cannot exceed 24 hours']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
    index: true
  },
  
  // Recurring event settings
  recurring: {
    type: Boolean,
    default: false
  },
  
  recurringType: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'none'
  },
  
  recurringEnd: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v > this.date;
      },
      message: 'Recurring end date must be after the event date'
    }
  },
  
  // Reminder settings
  reminder: {
    type: String,
    enum: ['none', '5', '10', '15', '30', '60', '120', '1440'],
    default: '15'
  },
  
  attendees: [{
    type: String,
    trim: true
  }],
  
  // Event completion tracking
  completed: {
    type: Boolean,
    default: false,
    index: true
  },
  
  completedAt: {
    type: Date
  },
  
  // Type-specific fields
  mealDetails: {
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack']
    },
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative']
    }
  },
  
  medicationDetails: {
    dosage: {
      type: String,
      trim: true,
      maxlength: [100, 'Dosage cannot exceed 100 characters']
    }
  },
  
  appointmentDetails: {
    doctor: {
      type: String,
      trim: true,
      maxlength: [100, 'Doctor name cannot exceed 100 characters']
    }
  },
  
  exerciseDetails: {
    exerciseType: {
      type: String,
      enum: ['Cardio', 'Strength', 'Yoga', 'Swimming', 'Walking', 'Running']
    },
    intensity: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  },
  
  // Color coding for UI
  color: {
    type: String,
    default: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  
  // Metadata
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

// Compound indexes for efficient queries
calendarEventSchema.index({ userId: 1, date: 1 });
calendarEventSchema.index({ userId: 1, type: 1, date: 1 });
calendarEventSchema.index({ userId: 1, completed: 1, date: 1 });
calendarEventSchema.index({ userId: 1, priority: 1, date: 1 });

// Virtual for checking if event is upcoming
calendarEventSchema.virtual('isUpcoming').get(function() {
  const eventDateTime = new Date(this.date);
  const [hours, minutes] = this.time.split(':');
  eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return eventDateTime > new Date();
});

// Virtual for checking if event is overdue
calendarEventSchema.virtual('isOverdue').get(function() {
  const eventDateTime = new Date(this.date);
  const [hours, minutes] = this.time.split(':');
  eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return eventDateTime < new Date() && !this.completed;
});

// Virtual for formatted date
calendarEventSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Virtual for formatted time
calendarEventSchema.virtual('formattedTime').get(function() {
  return this.time;
});

// Method to mark event as completed
calendarEventSchema.methods.markCompleted = function() {
  this.completed = true;
  this.completedAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

// Method to mark event as incomplete
calendarEventSchema.methods.markIncomplete = function() {
  this.completed = false;
  this.completedAt = undefined;
  this.updatedAt = new Date();
  return this.save();
};

// Method to duplicate event
calendarEventSchema.methods.duplicate = function(newDate) {
  const duplicatedEvent = this.toObject();
  delete duplicatedEvent._id;
  delete duplicatedEvent.__v;
  duplicatedEvent.date = newDate;
  duplicatedEvent.title = `${this.title} (Copy)`;
  duplicatedEvent.completed = false;
  duplicatedEvent.completedAt = undefined;
  duplicatedEvent.createdAt = new Date();
  duplicatedEvent.updatedAt = new Date();
  
  return new this.constructor(duplicatedEvent);
};

// Static method to get events by date range
calendarEventSchema.statics.getEventsInRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1, time: 1 });
};

// Static method to get events by type
calendarEventSchema.statics.getEventsByType = function(userId, type) {
  return this.find({
    userId,
    type
  }).sort({ date: 1, time: 1 });
};

// Static method to get upcoming events
calendarEventSchema.statics.getUpcomingEvents = function(userId, limit = 10) {
  const now = new Date();
  return this.find({
    userId,
    date: { $gte: now },
    completed: false
  })
  .sort({ date: 1, time: 1 })
  .limit(limit);
};

// Static method to get overdue events
calendarEventSchema.statics.getOverdueEvents = function(userId) {
  const now = new Date();
  return this.find({
    userId,
    date: { $lt: now },
    completed: false
  }).sort({ date: 1, time: 1 });
};

// Static method to get events by priority
calendarEventSchema.statics.getEventsByPriority = function(userId, priority) {
  return this.find({
    userId,
    priority,
    completed: false
  }).sort({ date: 1, time: 1 });
};

// Static method to get recurring events
calendarEventSchema.statics.getRecurringEvents = function(userId) {
  return this.find({
    userId,
    recurring: true
  }).sort({ date: 1, time: 1 });
};

// Pre-save middleware to update updatedAt
calendarEventSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
