const mongoose = require('mongoose');

const patientAssignmentSchema = new mongoose.Schema({
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
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned by user ID is required']
  },
  assignmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'transferred', 'discharged'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
patientAssignmentSchema.index({ doctorId: 1 });
patientAssignmentSchema.index({ patientId: 1 });
patientAssignmentSchema.index({ status: 1 });
patientAssignmentSchema.index({ isActive: 1 });

// Ensure unique doctor-patient assignment
patientAssignmentSchema.index({ doctorId: 1, patientId: 1 }, { unique: true });

// Static method to find patients for a doctor
patientAssignmentSchema.statics.findPatientsForDoctor = function(doctorId) {
  return this.find({ 
    doctorId, 
    status: 'active',
    isActive: true 
  })
  .populate('patientId', 'firstName lastName email phoneNumber dateOfBirth gender medicalConditions allergies')
  .sort({ assignmentDate: -1 });
};

// Static method to find doctors for a patient
patientAssignmentSchema.statics.findDoctorsForPatient = function(patientId) {
  return this.find({ 
    patientId, 
    status: 'active',
    isActive: true 
  })
  .populate('doctorId', 'firstName lastName email specialization phoneNumber')
  .sort({ assignmentDate: -1 });
};

// Static method to check if assignment exists
patientAssignmentSchema.statics.checkAssignment = function(doctorId, patientId) {
  return this.findOne({ 
    doctorId, 
    patientId, 
    status: 'active',
    isActive: true 
  });
};

// Static method to transfer patient
patientAssignmentSchema.statics.transferPatient = function(currentDoctorId, newDoctorId, patientId, transferredBy) {
  return this.findOneAndUpdate(
    { doctorId: currentDoctorId, patientId, status: 'active' },
    { 
      status: 'transferred',
      isActive: false,
      notes: `Transferred to new doctor on ${new Date().toISOString()}`
    },
    { new: true }
  ).then(() => {
    // Create new assignment
    return this.create({
      doctorId: newDoctorId,
      patientId,
      assignedBy: transferredBy,
      notes: `Transferred from previous doctor on ${new Date().toISOString()}`
    });
  });
};

// Method to deactivate assignment
patientAssignmentSchema.methods.deactivate = function() {
  this.status = 'inactive';
  this.isActive = false;
  return this.save();
};

// Method to discharge patient
patientAssignmentSchema.methods.discharge = function() {
  this.status = 'discharged';
  this.isActive = false;
  return this.save();
};

module.exports = mongoose.model('PatientAssignment', patientAssignmentSchema);