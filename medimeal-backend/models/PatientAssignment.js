const mongoose = require('mongoose');

const patientAssignmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wardNumber: {
    type: String,
    required: true,
    unique: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'discharged', 'transferred', 'cancelled'],
    default: 'active'
  },
  notes: {
    type: String,
    default: ''
  },
  diagnosis: {
    type: String,
    default: ''
  },
  treatmentPlan: {
    type: String,
    default: ''
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
patientAssignmentSchema.index({ patient: 1, doctor: 1 });
patientAssignmentSchema.index({ doctor: 1, status: 1 });
patientAssignmentSchema.index({ wardNumber: 1 });
patientAssignmentSchema.index({ priority: 1 });

// Virtual for patient name
patientAssignmentSchema.virtual('patientName').get(function() {
  return this.populated('patient') ? `${this.patient.firstName} ${this.patient.lastName}` : '';
});

// Virtual for doctor name
patientAssignmentSchema.virtual('doctorName').get(function() {
  return this.populated('doctor') ? `Dr. ${this.doctor.firstName} ${this.doctor.lastName}` : '';
});

// Method to get assignment summary
patientAssignmentSchema.methods.getSummary = function() {
  return {
    id: this._id,
    patientId: this.patient,
    patientName: this.patientName,
    doctorId: this.doctor,
    doctorName: this.doctorName,
    wardNumber: this.wardNumber,
    priority: this.priority,
    status: this.status,
    startDate: this.startDate,
    endDate: this.endDate,
    diagnosis: this.diagnosis,
    assignedAt: this.assignedAt
  };
};

module.exports = mongoose.model('PatientAssignment', patientAssignmentSchema);
