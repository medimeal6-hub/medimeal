const mongoose = require('mongoose');

/**
 * Invoice
 * -------
 * Invoice records for appointment payments.
 * Auto-generated after successful payment.
 */
const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    index: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
    index: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  doctorName: {
    type: String,
    required: true,
    trim: true
  },
  doctorSpecialization: {
    type: String,
    trim: true
  },
  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0.18, // 18% GST
    min: 0,
    max: 1
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  transactionId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  invoiceDate: {
    type: Date,
    default: Date.now
  },
  pdfUrl: {
    type: String,
    trim: true
  },
  pdfData: {
    type: Buffer
  }
}, {
  timestamps: true
});

invoiceSchema.index({ userId: 1, invoiceDate: -1 });
invoiceSchema.index({ appointmentId: 1 });

// Generate invoice number early so it passes validation.
// (Mongoose validates required fields before `pre('save')` runs.)
invoiceSchema.pre('validate', function (next) {
  if (!this.invoiceNumber) {
    const ts = Date.now().toString(36).toUpperCase();
    const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
    this.invoiceNumber = `INV-${ts}-${rnd}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
