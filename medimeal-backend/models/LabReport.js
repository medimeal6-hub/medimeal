const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150,
  },
  type: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  laboratoryName: {
    type: String,
    trim: true,
    maxlength: 150,
  },
  reportDate: {
    type: Date,
    default: Date.now,
    index: true,
  },
  // Optional link to an appointment where this report was discussed/ordered
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  // Structured result values for basic analytics
  results: [
    {
      name: { type: String, required: true, trim: true },
      value: { type: String, required: true, trim: true },
      unit: { type: String, trim: true },
      referenceRange: { type: String, trim: true },
      interpretation: {
        type: String,
        enum: ['low', 'normal', 'high', 'borderline', 'unknown'],
        default: 'unknown',
      },
    },
  ],
  // File attachment (e.g. PDF, image)
  file: {
    filename: String,
    url: String,
    contentType: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
}, {
  timestamps: true,
});

labReportSchema.index({ userId: 1, reportDate: -1 });
labReportSchema.index({ doctorId: 1, reportDate: -1 });

labReportSchema.statics.findForPatient = function (userId, { limit = 50 } = {}) {
  return this.find({ userId })
    .sort({ reportDate: -1 })
    .limit(limit);
};

labReportSchema.statics.findForDoctor = function (doctorId, { limit = 100 } = {}) {
  return this.find({ doctorId })
    .sort({ reportDate: -1 })
    .limit(limit);
};

module.exports = mongoose.model('LabReport', labReportSchema);


