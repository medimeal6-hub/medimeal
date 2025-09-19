const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Symptom name is required'],
    trim: true,
    maxlength: [100, 'Symptom name cannot exceed 100 characters'],
    index: true
  },
  category: {
    type: String,
    required: [true, 'Symptom category is required'],
    enum: [
      'pain', 'digestive', 'respiratory', 'cardiovascular', 
      'neurological', 'skin', 'mental-health', 'fatigue',
      'fever', 'other'
    ],
    index: true
  },
  severity: {
    type: Number,
    required: [true, 'Severity level is required'],
    min: [1, 'Severity must be at least 1'],
    max: [10, 'Severity cannot exceed 10']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  // When the symptom was first noticed
  onsetDate: {
    type: Date,
    required: [true, 'Onset date is required']
  },
  // Duration in minutes
  duration: {
    type: Number,
    min: [0, 'Duration cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Duration must be a whole number of minutes'
    }
  },
  // Frequency of occurrence
  frequency: {
    type: String,
    enum: ['once', 'occasional', 'frequent', 'constant'],
    default: 'once'
  },
  // Triggering factors
  triggers: [{
    type: String,
    trim: true,
    maxlength: [100, 'Trigger cannot exceed 100 characters']
  }],
  // What makes it better
  relievingFactors: [{
    type: String,
    trim: true,
    maxlength: [100, 'Relieving factor cannot exceed 100 characters']
  }],
  // What makes it worse
  aggravatingFactors: [{
    type: String,
    trim: true,
    maxlength: [100, 'Aggravating factor cannot exceed 100 characters']
  }],
  // Associated symptoms
  associatedSymptoms: [{
    type: String,
    trim: true,
    maxlength: [100, 'Associated symptom cannot exceed 100 characters']
  }],
  // Body location for pain or physical symptoms
  bodyLocation: {
    type: String,
    trim: true,
    maxlength: [100, 'Body location cannot exceed 100 characters']
  },
  // Medication taken for this symptom
  medicationTaken: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      required: true,
      trim: true
    },
    takenAt: {
      type: Date,
      default: Date.now
    },
    effectiveness: {
      type: Number,
      min: 1,
      max: 10
    }
  }],
  // Current status of the symptom
  status: {
    type: String,
    enum: ['active', 'improving', 'resolved', 'worsening'],
    default: 'active',
    index: true
  },
  // Resolution date if resolved
  resolvedAt: Date,
  // Healthcare provider consulted
  healthcareProviderNotes: {
    provider: String,
    consultationDate: Date,
    notes: String,
    diagnosis: String,
    treatment: String
  },
  // User notes and observations
  userNotes: [{
    note: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters']
    },
    recordedAt: {
      type: Date,
      default: Date.now
    },
    severity: {
      type: Number,
      min: 1,
      max: 10
    }
  }],
  // Flag for urgent symptoms requiring medical attention
  isUrgent: {
    type: Boolean,
    default: false
  },
  // Attachments (photos, documents)
  attachments: [{
    filename: String,
    url: String,
    type: {
      type: String,
      enum: ['image', 'document']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Compound indexes for efficient queries
symptomSchema.index({ userId: 1, status: 1, onsetDate: -1 });
symptomSchema.index({ userId: 1, category: 1 });
symptomSchema.index({ userId: 1, name: 1 });
symptomSchema.index({ severity: -1, isUrgent: -1 });

// Virtual for symptom duration in human-readable format
symptomSchema.virtual('durationFormatted').get(function() {
  if (!this.duration) return 'Unknown';
  
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Virtual for days since onset
symptomSchema.virtual('daysSinceOnset').get(function() {
  const now = new Date();
  const timeDiff = now.getTime() - this.onsetDate.getTime();
  return Math.floor(timeDiff / (1000 * 3600 * 24));
});

// Method to update symptom status
symptomSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.status = newStatus;
  
  if (newStatus === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  
  if (notes) {
    this.userNotes.push({
      note: notes,
      recordedAt: new Date(),
      severity: this.severity
    });
  }
  
  return this.save();
};

// Method to add user note
symptomSchema.methods.addUserNote = function(note, severity = null) {
  this.userNotes.push({
    note,
    recordedAt: new Date(),
    severity: severity || this.severity
  });
  
  // Update severity if provided
  if (severity) {
    this.severity = severity;
  }
  
  return this.save();
};

// Method to record medication taken
symptomSchema.methods.recordMedication = function(name, dosage, effectiveness = null) {
  this.medicationTaken.push({
    name,
    dosage,
    takenAt: new Date(),
    effectiveness
  });
  
  return this.save();
};

// Method to check if symptom needs urgent attention
symptomSchema.methods.needsUrgentAttention = function() {
  // High severity symptoms (8-10) or explicitly marked as urgent
  return this.severity >= 8 || this.isUrgent || this.status === 'worsening';
};

// Static method to get active symptoms for a user
symptomSchema.statics.getActiveSymptoms = function(userId) {
  return this.find({ 
    userId, 
    status: { $in: ['active', 'worsening'] }
  }).sort({ severity: -1, onsetDate: -1 });
};

// Static method to get symptoms by category
symptomSchema.statics.getSymptomsByCategory = function(userId, category) {
  return this.find({ userId, category }).sort({ onsetDate: -1 });
};

// Static method to get urgent symptoms
symptomSchema.statics.getUrgentSymptoms = function(userId) {
  return this.find({ 
    userId, 
    $or: [
      { severity: { $gte: 8 } },
      { isUrgent: true },
      { status: 'worsening' }
    ]
  }).sort({ severity: -1, onsetDate: -1 });
};

// Static method to get symptoms within date range
symptomSchema.statics.getSymptomsInRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    onsetDate: { $gte: startDate, $lte: endDate }
  }).sort({ onsetDate: -1 });
};

// Method to get severity trend
symptomSchema.methods.getSeverityTrend = function() {
  if (this.userNotes.length < 2) return 'stable';
  
  const recentNotes = this.userNotes
    .filter(note => note.severity)
    .slice(-5) // Last 5 notes with severity
    .sort((a, b) => a.recordedAt - b.recordedAt);
  
  if (recentNotes.length < 2) return 'stable';
  
  const firstSeverity = recentNotes[0].severity;
  const lastSeverity = recentNotes[recentNotes.length - 1].severity;
  
  if (lastSeverity > firstSeverity) return 'worsening';
  if (lastSeverity < firstSeverity) return 'improving';
  return 'stable';
};

module.exports = mongoose.model('Symptom', symptomSchema);