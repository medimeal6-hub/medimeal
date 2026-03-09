const express = require('express');
const { auth } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const EmailLog = require('../models/EmailLog');
const CalendarEvent = require('../models/CalendarEvent');
const { sendAppointmentApprovalEmail, sendPaymentSuccessEmail, sendAppointmentReminderEmail, sendDoctorAppointmentRequestEmail } = require('../utils/mailer');
const { generateInvoicePdf } = require('../utils/invoicePdf');

const router = express.Router();

function computeAppointmentTotals(appointment) {
  const consultationFee = Number(appointment.consultationFee || 0);
  const taxRate = 0.18; // 18% GST
  const tax = consultationFee * taxRate;
  const totalAmount = consultationFee + tax;
  return { consultationFee, taxRate, tax, totalAmount };
}

async function ensureConsultationFee(appointment) {
  const current = Number(appointment.consultationFee || 0);
  if (Number.isFinite(current) && current > 0) return current;

  let doctor = null;
  if (appointment.doctorId) {
    doctor = await User.findOne({ _id: appointment.doctorId, role: 'doctor' }).select(
      'doctorInfo.consultationFee email'
    );
  }
  if (!doctor && appointment.provider?.email) {
    doctor = await User.findOne({ email: appointment.provider.email, role: 'doctor' }).select(
      'doctorInfo.consultationFee email'
    );
  }

  const fee = Number(doctor?.doctorInfo?.consultationFee || 0);
  if (Number.isFinite(fee) && fee > 0) {
    appointment.consultationFee = fee;
    await appointment.save();
    return fee;
  }
  return 0;
}

async function findOrCreatePaymentForAppointment({ userId, appointment, totalAmount }) {
  const appointmentIdStr = String(appointment._id);

  // Try to find an existing payment linked via meta
  let payment = await Payment.findOne({
    userId,
    $or: [{ 'meta.appointmentId': appointmentIdStr }, { 'meta.appointmentId': appointment._id }],
  }).sort({ createdAt: -1 });

  if (payment) return payment;

  // Fallback: create a payment record so invoice can be generated (legacy paid appointments)
  const transactionId = `APT-${appointmentIdStr.slice(-8)}-${Date.now().toString(36)}`;
  payment = await Payment.create({
    userId,
    amount: totalAmount,
    currency: 'INR',
    provider: 'manual',
    transactionId,
    status: 'success',
    meta: {
      appointmentId: appointmentIdStr,
      createdFrom: 'invoice_download',
    },
  });

  return payment;
}

async function findOrCreateInvoiceForAppointment({ userId, appointment }) {
  let invoice = await Invoice.findOne({ appointmentId: appointment._id, userId });
  if (invoice) return invoice;

  await ensureConsultationFee(appointment);
  const { consultationFee, tax, taxRate, totalAmount } = computeAppointmentTotals(appointment);

  const payment = await findOrCreatePaymentForAppointment({ userId, appointment, totalAmount });

  invoice = await Invoice.create({
    userId,
    appointmentId: appointment._id,
    paymentId: payment._id,
    doctorName: appointment.provider?.name || 'Doctor',
    doctorSpecialization: appointment.provider?.specialization || '',
    consultationFee,
    tax,
    taxRate,
    totalAmount,
    transactionId: payment.transactionId,
  });

  return invoice;
}

// GET /api/user/appointments - Get all appointments for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;
    
    let query = { userId };
    if (status) {
      query.status = status;
    }
    
    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: 1 });
    
    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Get user appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
});

// GET /api/user/appointments/:id - Get a specific appointment
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const appointmentId = req.params.id;
    
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      userId
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment'
    });
  }
});

// POST /api/user/appointments - Book a new appointment (status = APPROVED)
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      doctorId,
      date,
      time,
      duration,
      type,
      reasonForVisit,
      mode
    } = req.body;

    // Check for existing active appointments (One appointment per account rule)
    const activeAppointment = await Appointment.findOne({
      userId,
      status: { $nin: ['COMPLETED', 'CANCELLED', 'REJECTED', 'completed', 'cancelled', 'rejected'] }
    });

    if (activeAppointment) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active appointment. Please complete or cancel it before booking a new one.'
      });
    }
    
    // Validate required fields
    if (!doctorId || !date || !time || !reasonForVisit) {
      return res.status(400).json({
        success: false,
        message: 'doctorId, date, time, and reasonForVisit are required'
      });
    }
    
    // Find doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Combine date and time
    const appointmentDate = new Date(`${date}T${time}`);

    // Limit appointments to 5 per doctor per day
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dailyAppointmentsCount = await Appointment.countDocuments({
      doctorId: doctor._id,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled', 'rejected', 'REJECTED'] }
    });

    if (dailyAppointmentsCount >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Doctor has reached the daily limit of 5 appointments.'
      });
    }
    
    // Create appointment with APPROVED status (Auto-approve)
    const appointment = new Appointment({
      userId,
      doctorId: doctor._id,
      provider: {
        name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        specialization: doctor.specialization || 'general-physician',
        clinic: doctor.doctorInfo?.hospitalAffiliation || '',
        email: doctor.email,
        phone: doctor.phone || doctor.doctorInfo?.phoneNumber || ''
      },
      title: `${type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Consultation'} Appointment`,
      description: reasonForVisit,
      appointmentDate,
      duration: duration || 30,
      type: type || 'consultation',
      status: 'APPROVED', // Auto-approved
      mode: mode || 'in-person',
      reasonForVisit
    });
    
    await appointment.save();

    // Create calendar event
    try {
      const appointmentTime = appointment.appointmentDate.toTimeString().slice(0, 5);
      await CalendarEvent.create({
        userId: appointment.userId,
        title: `Doctor Appointment – ${appointment.provider.name}`,
        type: 'appointment',
        date: appointment.appointmentDate,
        time: appointmentTime,
        description: `${appointment.type} appointment with ${appointment.provider.name}`,
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        appointmentDetails: {
          doctor: appointment.provider.name
        }
      });
    } catch (calendarError) {
      console.error('Failed to create calendar event:', calendarError);
    }
    
    // Send approval email to USER (non-blocking)
    try {
      const user = await User.findById(userId);
      if (user) {
        await sendAppointmentApprovalEmail(user.email, user.firstName, {
          doctorName: appointment.provider.name,
          date: appointment.appointmentDate.toLocaleDateString(),
          time: appointment.appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          type: appointment.type
        });
        // Log email
        try {
          await EmailLog.create({
            userId,
            email: user.email,
            subject: 'Appointment Approved - MediMeal',
            type: 'appointment_approval',
            status: 'sent',
            metadata: { appointmentId: appointment._id }
          });
        } catch (logError) {
          console.error('Failed to log user email:', logError);
        }
      }
    } catch (emailError) {
      console.error('Failed to send approval email to user:', emailError);
    }

    // Send appointment request notification email to DOCTOR (non-blocking)
    try {
      if (doctor && doctor.email) {
        const user = await User.findById(userId);
        await sendDoctorAppointmentRequestEmail(doctor.email, doctor.firstName, {
          patientName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown Patient',
          patientEmail: user?.email || '',
          date: appointment.appointmentDate.toLocaleDateString(),
          time: appointment.appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          type: appointment.type,
          reasonForVisit: appointment.reasonForVisit
        });
      }
    } catch (emailError) {
      console.error('Failed to send notification email to doctor:', emailError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Appointment booking requested successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/user/appointments/:id/payment - Pay for approved appointment
router.post('/:id/payment', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const appointmentId = req.params.id;
    const { paymentMethod, transactionId } = req.body;
    
    // Find appointment
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      userId
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if appointment is approved
    if (appointment.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Appointment must be approved before payment'
      });
    }
    
    // Find doctor to get consultation fee
    const doctor = await User.findOne({
      email: appointment.provider.email,
      role: 'doctor'
    });
    
    const consultationFee = doctor?.doctorInfo?.consultationFee || 0;
    const taxRate = 0.18; // 18% GST
    const tax = consultationFee * taxRate;
    const totalAmount = consultationFee + tax;
    
    // Create payment record
    const payment = new Payment({
      userId,
      amount: totalAmount,
      currency: 'INR',
      provider: paymentMethod || 'stripe',
      transactionId: transactionId || `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'success'
    });
    
    await payment.save();
    
    // Update appointment status to PAID
    appointment.status = 'paid';
    await appointment.save();
    
    // Generate invoice
    const invoice = new Invoice({
      userId,
      appointmentId: appointment._id,
      paymentId: payment._id,
      doctorName: appointment.provider.name,
      doctorSpecialization: appointment.provider.specialization,
      consultationFee,
      tax,
      taxRate,
      totalAmount,
      transactionId: payment.transactionId
    });
    
    await invoice.save();
    
    // Send payment success email
    try {
      const user = await User.findById(userId);
      await sendPaymentSuccessEmail(
        user.email,
        user.firstName,
        {
          amount: totalAmount,
          transactionId: payment.transactionId,
          invoiceNumber: invoice.invoiceNumber,
          date: new Date().toLocaleDateString()
        }
      );
      
      // Log email
      await EmailLog.create({
        userId,
        email: user.email,
        subject: 'Payment Successful - MediMeal',
        type: 'payment_success',
        status: 'sent',
        metadata: { appointmentId, invoiceId: invoice._id }
      });
    } catch (emailError) {
      console.error('Failed to send payment success email:', emailError);
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment successful',
      data: {
        payment,
        invoice,
        appointment
      }
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/user/appointments/:id/invoice - Get invoice for paid appointment
router.get('/:id/invoice', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const appointmentId = req.params.id;
    
    // Verify appointment belongs to user
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      userId
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    const statusUpper = appointment.status?.toUpperCase();
    if (!['PAID', 'PAID & CONFIRMED', 'CONFIRMED'].includes(statusUpper) && statusUpper !== 'PAID') {
      // Keep compatible: only allow invoice view if appointment is paid
      if (statusUpper !== 'PAID') {
        // Some legacy statuses might be lowercase 'paid'
        if (appointment.status !== 'paid') {
          return res.status(400).json({
            success: false,
            message: 'Invoice is available only after successful payment',
          });
        }
      }
    }

    // Find or create invoice (exclude pdfData buffer from JSON)
    const invoice = await findOrCreateInvoiceForAppointment({ userId, appointment });
    
    res.status(200).json({
      success: true,
      data: {
        ...invoice.toObject(),
        pdfData: undefined,
      }
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice'
    });
  }
});

// GET /api/user/appointments/:id/invoice/pdf - Download invoice PDF
router.get('/:id/invoice/pdf', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const appointmentId = req.params.id;

    // Verify appointment belongs to user
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      userId,
    });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const statusUpper = String(appointment.status || '').toUpperCase();
    const isPaid = statusUpper === 'PAID' || appointment.status === 'paid';

    // If not paid, still return a PDF (no API error) explaining status.
    // This avoids user-facing "download failed" errors.
    if (!isPaid) {
      const user = await User.findById(userId);
      const tmpInvoice = {
        invoiceNumber: 'N/A',
        invoiceDate: new Date(),
        transactionId: '',
        doctorName: appointment.provider?.name || 'Doctor',
        doctorSpecialization: appointment.provider?.specialization || '',
        consultationFee: Number(appointment.consultationFee || 0),
        taxRate: 0.18,
        tax: Number(appointment.consultationFee || 0) * 0.18,
        totalAmount: Number(appointment.consultationFee || 0) * 1.18,
      };
      const pdfBuffer = await generateInvoicePdf({ invoice: tmpInvoice, user, appointment });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${appointmentId}.pdf"`);
      return res.status(200).send(pdfBuffer);
    }

    const invoice = await findOrCreateInvoiceForAppointment({ userId, appointment });

    // Always generate a PDF buffer; try to store it, but still return it even if save fails
    const user = await User.findById(userId);
    const pdfBuffer = await generateInvoicePdf({ invoice, user, appointment });
    try {
      invoice.pdfData = pdfBuffer;
      await invoice.save();
    } catch (saveErr) {
      console.error('Saving invoice PDF failed (continuing):', saveErr?.message || saveErr);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${invoice.invoiceNumber || 'invoice'}.pdf"`
    );
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Download invoice PDF error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate invoice PDF' });
  }
});

module.exports = router;
