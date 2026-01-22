const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { auth, authorize } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const EmailLog = require('../models/EmailLog');
const CalendarEvent = require('../models/CalendarEvent');
const { sendBookingConfirmationEmail, sendAppointmentApprovalEmail, sendAppointmentRejectionEmail, sendPaymentSuccessEmail, sendDoctorAppointmentRequestEmail } = require('../utils/mailer');
const { generateInvoicePdf } = require('../utils/invoicePdf');

const router = express.Router();

function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    const err = new Error('Razorpay is not configured (missing env vars)');
    err.status = 500;
    throw err;
  }
  return new Razorpay({ key_id, key_secret });
}

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

  // Try to hydrate from doctor profile for legacy appointments / missing fee
  let doctor = null;
  if (appointment.doctorId) {
    doctor = await User.findOne({ _id: appointment.doctorId, role: 'doctor' }).select(
      'doctorInfo.consultationFee email firstName lastName'
    );
  }
  if (!doctor && appointment.provider?.email) {
    doctor = await User.findOne({ email: appointment.provider.email, role: 'doctor' }).select(
      'doctorInfo.consultationFee email firstName lastName'
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

// ========================================
// 1. USER SIDE – BOOK APPOINTMENT
// POST /appointments/book
// ========================================
router.post('/book', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { doctorId, date, time, type, reasonForVisit, mode } = req.body;

    // Validate required fields - doctorId is REQUIRED
    if (!doctorId || !date || !time || !reasonForVisit) {
      return res.status(400).json({
        success: false,
        message: 'doctorId, date, time, and reasonForVisit are required'
      });
    }

    // Validate doctorId format
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctorId format'
      });
    }

    // Find doctor from database - MUST exist and be active
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isActive: true });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or inactive'
      });
    }

    // Validate slot (basic validation - check if date is in future)
    const appointmentDate = new Date(`${date}T${time}`);
    if (appointmentDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date and time must be in the future'
      });
    }

    // Get consultation fee from doctor profile
    const consultationFee = doctor.doctorInfo?.consultationFee || 0;

    // Normalize specialization to match enum values
    const validSpecializations = [
      'general-physician', 'cardiologist', 'endocrinologist', 'neurologist',
      'dermatologist', 'orthopedist', 'psychiatrist', 'gynecologist',
      'urologist', 'ophthalmologist', 'ent', 'oncologist', 'pediatrician',
      'dentist', 'physiotherapist', 'nutritionist', 'other'
    ];
    
    let normalizedSpecialization = 'general-physician';
    if (doctor.specialization) {
      const specLower = doctor.specialization.toLowerCase().trim();
      // Try to find exact match
      if (validSpecializations.includes(specLower)) {
        normalizedSpecialization = specLower;
      } else {
        // Try partial matching
        if (specLower.includes('nutrition') || specLower.includes('diet')) {
          normalizedSpecialization = 'nutritionist';
        } else if (specLower.includes('cardio')) {
          normalizedSpecialization = 'cardiologist';
        } else if (specLower.includes('derma')) {
          normalizedSpecialization = 'dermatologist';
        } else if (specLower.includes('ortho')) {
          normalizedSpecialization = 'orthopedist';
        } else if (specLower.includes('psych')) {
          normalizedSpecialization = 'psychiatrist';
        } else if (specLower.includes('gyne') || specLower.includes('obgyn')) {
          normalizedSpecialization = 'gynecologist';
        } else if (specLower.includes('pediatric')) {
          normalizedSpecialization = 'pediatrician';
        } else if (specLower.includes('physio') || specLower.includes('therapy')) {
          normalizedSpecialization = 'physiotherapist';
        } else {
          normalizedSpecialization = 'other';
        }
      }
    }

    // Create appointment with REQUESTED status
    // CRITICAL: doctorId MUST be saved exactly as doctor._id (ObjectId)
    const appointment = new Appointment({
      userId,
      doctorId: doctor._id, // Save doctor._id exactly as ObjectId
      appointmentDate,
      status: 'REQUESTED', // Initial status - REQUIRED
      consultationFee,
      provider: {
        name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        specialization: normalizedSpecialization,
        clinic: doctor.doctorInfo?.hospitalAffiliation || '',
        email: doctor.email,
        phone: doctor.phone || doctor.doctorInfo?.phoneNumber || ''
      },
      title: `${type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Consultation'} Appointment`,
      description: reasonForVisit,
      type: type || 'consultation',
      mode: mode || 'in-person',
      reasonForVisit
    });

    await appointment.save();
    
    // ========================================
    // DEBUG LOGGING - Appointment Booking
    // ========================================
    console.log('========================================');
    console.log('📅 APPOINTMENT BOOKING SUCCESS');
    console.log('========================================');
    console.log(`✅ Appointment ID: ${appointment._id}`);
    console.log(`✅ User ID: ${userId}`);
    console.log(`✅ Doctor ID: ${appointment.doctorId}`);
    console.log(`✅ Status: ${appointment.status}`);
    console.log(`✅ Date: ${appointment.appointmentDate}`);
    console.log(`✅ Created At: ${appointment.createdAt}`);
    console.log('========================================');

    // Send booking confirmation email to USER (non-blocking)
    try {
      const user = await User.findById(userId);
      if (user) {
        await sendBookingConfirmationEmail(user.email, user.firstName, {
          doctorName: appointment.provider.name,
          date: appointment.appointmentDate.toLocaleDateString(),
          time: appointment.appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          type: appointment.type
        });
        // Log email (don't fail if logging fails)
        try {
          await EmailLog.create({
            userId,
            email: user.email,
            subject: 'Appointment Request Sent - MediMeal',
            type: 'appointment_booking',
            status: 'sent',
            metadata: { appointmentId: appointment._id }
          });
        } catch (logError) {
          console.error('Failed to log user email:', logError);
        }
      }
    } catch (emailError) {
      console.error('Failed to send booking confirmation email to user:', emailError);
      // Don't fail the appointment creation if email fails
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
        // Log email (don't fail if logging fails)
        try {
          await EmailLog.create({
            userId: doctor._id,
            email: doctor.email,
            subject: 'New Appointment Request - MediMeal',
            type: 'appointment_booking',
            status: 'sent',
            metadata: { appointmentId: appointment._id, recipientType: 'doctor' }
          });
          console.log(`✅ Doctor notification email sent to: ${doctor.email}`);
        } catch (logError) {
          console.error('Failed to log doctor email:', logError);
        }
      } else {
        console.warn('⚠️ Doctor email not found, skipping doctor notification');
      }
    } catch (emailError) {
      console.error('Failed to send appointment request email to doctor:', emailError);
      // Don't fail the appointment creation if email fails
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

// ========================================
// 2. USER DASHBOARD – VIEW APPOINTMENTS
// GET /appointments/user/:userId
// ========================================
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const currentUserId = req.user._id;

    // Security: User can only see their own appointments
    if (requestedUserId !== currentUserId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own appointments.'
      });
    }

    const appointments = await Appointment.find({ userId: requestedUserId })
      .populate('doctorId', 'firstName lastName specialization')
      .sort({ appointmentDate: 1 });

    // Format appointments for frontend
    const formattedAppointments = appointments.map(apt => ({
      _id: apt._id,
      doctor: {
        name: apt.provider.name,
        specialization: apt.provider.specialization
      },
      date: apt.appointmentDate.toISOString().split('T')[0],
      time: apt.appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: apt.status,
      type: apt.type,
      consultationFee: apt.consultationFee,
      reasonForVisit: apt.reasonForVisit
    }));

    res.status(200).json({
      success: true,
      data: formattedAppointments
    });
  } catch (error) {
    console.error('Get user appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
});

// ========================================
// 3. DOCTOR DASHBOARD – VIEW BOOKINGS
// GET /appointments/doctor/:doctorId
// ========================================
router.get('/doctor/:doctorId', auth, async (req, res) => {
  try {
    const requestedDoctorId = req.params.doctorId;
    const currentUserId = req.user._id;

    // Verify doctor exists (any logged-in doctor can view all appointments)
    const doctor = await User.findById(currentUserId);
    if (!doctor || (doctor.role !== 'doctor' && doctor.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can view appointments.'
      });
    }

    // ========================================
    // UPDATED: Show ALL appointments to ALL doctors
    // ========================================
    console.log('========================================');
    console.log('👨‍⚕️ DOCTOR DASHBOARD QUERY - ALL APPOINTMENTS');
    console.log('========================================');
    console.log(`✅ Doctor ID (logged-in): ${currentUserId}`);
    console.log(`✅ Doctor Name: ${doctor.firstName} ${doctor.lastName}`);
    console.log(`✅ Query Filter: ALL appointments (any doctor)`);
    console.log('========================================');

    // Query ALL appointments - any doctor can see all appointment requests
    // Include ALL statuses to see everything
    // Sort by createdAt DESC (latest first) to show newest requests at top
    let appointments = await Appointment.find({})
      .populate('userId', 'firstName lastName email phone dateOfBirth gender')
      .populate('doctorId', 'firstName lastName email specialization')
      .sort({ createdAt: -1 }); // Latest first

    // ========================================
    // DEBUG LOGGING - Query Results
    // ========================================
    console.log(`✅ Total appointments found: ${appointments.length}`);
    
    // Show detailed info for each appointment
    appointments.forEach((apt, index) => {
      console.log(`   Appointment ${index + 1}:`);
      console.log(`      ID: ${apt._id}`);
      console.log(`      Status: ${apt.status}`);
      console.log(`      DoctorId: ${apt.doctorId}`);
      console.log(`      Patient: ${apt.userId ? apt.userId.firstName : 'NO USER'}`);
      console.log(`      Date: ${apt.appointmentDate}`);
    });
    
    const statusCounts = appointments.reduce((acc, apt) => {
      const status = apt.status?.toUpperCase() || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    console.log(`✅ Status breakdown:`, statusCounts);
    console.log('========================================');

    // Format appointments for frontend with null safety
    // Include ALL appointments, not just REQUESTED/APPROVED/PAID
    // Frontend can filter if needed, but backend should return everything
    const formattedAppointments = appointments
      .filter(apt => apt.userId) // Filter out appointments with null userId
      .map(apt => {
        // Calculate patient age
        let patientAge = null;
        if (apt.userId?.dateOfBirth) {
          try {
            const birthDate = new Date(apt.userId.dateOfBirth);
            if (!isNaN(birthDate.getTime())) {
              const today = new Date();
              let age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
              }
              patientAge = age > 0 ? age : null;
            }
          } catch (e) {
            // Age calculation failed, keep as null
          }
        }

        return {
          _id: apt._id,
          user: {
            name: apt.userId ? `${apt.userId.firstName || ''} ${apt.userId.lastName || ''}`.trim() : 'Unknown Patient',
            email: apt.userId?.email || '',
            phone: apt.userId?.phone || '',
            age: patientAge,
            gender: apt.userId?.gender || null,
            dateOfBirth: apt.userId?.dateOfBirth || null
          },
          date: apt.appointmentDate ? apt.appointmentDate.toISOString().split('T')[0] : '',
          time: apt.appointmentDate ? apt.appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
          status: apt.status,
          type: apt.type || 'consultation',
          reasonForVisit: apt.reasonForVisit || '',
          consultationFee: apt.consultationFee || 0,
          assignedDoctor: apt.doctorId ? {
            id: apt.doctorId._id || apt.doctorId,
            name: apt.doctorId.firstName && apt.doctorId.lastName ? `Dr. ${apt.doctorId.firstName} ${apt.doctorId.lastName}` : apt.provider?.name || 'Unknown Doctor'
          } : {
            id: null,
            name: apt.provider?.name || 'Unknown Doctor'
          }
        };
      });

    res.status(200).json({
      success: true,
      data: formattedAppointments
    });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
});

// ========================================
// 4. DOCTOR ACTION – APPROVE
// PATCH /appointments/:appointmentId/approve
// ========================================
router.patch('/:appointmentId/approve', auth, authorize('doctor'), async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const doctorId = req.user._id;

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Allow ANY doctor to approve any appointment request
    // Removed doctorId check - all doctors can manage all appointments

    // Status flow validation
    if (appointment.status !== 'REQUESTED') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve appointment with status: ${appointment.status}. Only REQUESTED appointments can be approved.`
      });
    }

    // Update status to APPROVED
    appointment.status = 'APPROVED';
    await appointment.save();

    // Create calendar event
    try {
      const appointmentTime = appointment.appointmentDate.toTimeString().slice(0, 5); // HH:mm format
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

    // Send approval email
    try {
      const user = await User.findById(appointment.userId);
      await sendAppointmentApprovalEmail(user.email, user.firstName, {
        doctorName: appointment.provider.name,
        date: appointment.appointmentDate.toLocaleDateString(),
        time: appointment.appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        type: appointment.type
      });
      await EmailLog.create({
        userId: appointment.userId,
        email: user.email,
        subject: 'Appointment Approved - MediMeal',
        type: 'appointment_approval',
        status: 'sent',
        metadata: { appointmentId: appointment._id }
      });
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Appointment approved successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Approve appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve appointment'
    });
  }
});

// ========================================
// 5. DOCTOR ACTION – REJECT
// PATCH /appointments/:appointmentId/reject
// ========================================
router.patch('/:appointmentId/reject', auth, authorize('doctor'), async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const doctorId = req.user._id;
    const { reason } = req.body;

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Allow ANY doctor to reject any appointment request
    // Removed doctorId check - all doctors can manage all appointments

    // Status flow validation
    if (appointment.status !== 'REQUESTED') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject appointment with status: ${appointment.status}. Only REQUESTED appointments can be rejected.`
      });
    }

    // Update status to REJECTED
    appointment.status = 'REJECTED';
    if (reason) {
      appointment.cancellationReason = reason;
      appointment.cancelledBy = 'provider';
    }
    await appointment.save();

    // Do NOT create calendar event on rejection

    // Send rejection email
    try {
      const user = await User.findById(appointment.userId);
      if (user) {
        await sendAppointmentRejectionEmail(user.email, user.firstName, {
          doctorName: appointment.provider.name,
          date: appointment.appointmentDate.toLocaleDateString(),
          time: appointment.appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          type: appointment.type
        }, reason);
        // Log email (don't fail if logging fails)
        try {
          await EmailLog.create({
            userId: appointment.userId,
            email: user.email,
            subject: 'Appointment Rejected - MediMeal',
            type: 'appointment_rejection',
            status: 'sent',
            metadata: { appointmentId: appointment._id, reason }
          });
        } catch (logError) {
          console.error('Failed to log rejection email:', logError);
        }
      }
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Appointment rejected successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Reject appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject appointment'
    });
  }
});

// ========================================
// 6. USER SIDE – PAYMENT
// POST /appointments/:appointmentId/pay
// ========================================
// Razorpay (real payment) - create order
// POST /appointments/:appointmentId/pay/razorpay/order
router.post('/:appointmentId/pay/razorpay/order', auth, async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const userId = req.user._id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only pay for your own appointments.',
      });
    }

    const statusUpper = appointment.status?.toUpperCase();
    if (!['APPROVED', 'PAYMENT_PENDING'].includes(statusUpper)) {
      return res.status(400).json({
        success: false,
        message: `Cannot pay for appointment with status: ${appointment.status}. Appointment must be APPROVED before payment.`,
      });
    }

    await ensureConsultationFee(appointment);
    const { consultationFee, tax, taxRate, totalAmount } = computeAppointmentTotals(appointment);
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message:
          'Consultation fee is not set for this appointment/doctor. Please ask the doctor/admin to set a consultation fee and try again.',
      });
    }

    const amountPaise = Math.round(totalAmount * 100);
    // Razorpay receipt max length is 40 chars
    const receipt = `apt_${String(appointment._id).slice(-10)}_${Date.now().toString(36)}`;

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes: {
        appointmentId: String(appointment._id),
        userId: String(userId),
        doctorName: appointment.provider?.name || '',
      },
    });

    // Mark as payment pending once an order is created (helps UI + avoids confusion)
    if (appointment.status?.toUpperCase() === 'APPROVED') {
      appointment.status = 'PAYMENT_PENDING';
      await appointment.save();
    }

    return res.json({
      success: true,
      data: {
        keyId: process.env.RAZORPAY_KEY_ID,
        order,
        pricing: {
          consultationFee,
          tax,
          taxRate,
          totalAmount,
          currency: 'INR',
        },
      },
    });
  } catch (error) {
    console.error('Create appointment Razorpay order error:', error);
    const message =
      error?.error?.description ||
      error?.description ||
      error?.message ||
      'Failed to create Razorpay order';
    const status = error?.status || error?.statusCode || 500;
    return res.status(status).json({
      success: false,
      message,
    });
  }
});

// Razorpay (real payment) - verify and finalize
// POST /appointments/:appointmentId/pay/razorpay/verify
router.post('/:appointmentId/pay/razorpay/verify', auth, async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const userId = req.user._id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message:
          'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required',
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only pay for your own appointments.',
      });
    }

    const statusUpper = appointment.status?.toUpperCase();
    if (!['APPROVED', 'PAYMENT_PENDING'].includes(statusUpper)) {
      return res.status(400).json({
        success: false,
        message: `Cannot pay for appointment with status: ${appointment.status}. Appointment must be APPROVED before payment.`,
      });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay is not configured (missing secret)',
      });
    }

    const expected = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Idempotency: if already paid, return existing records
    const existingPayment = await Payment.findOne({
      provider: 'razorpay',
      transactionId: razorpay_payment_id,
      userId,
    });

    const existingInvoice = await Invoice.findOne({ appointmentId: appointment._id, userId });

    if (existingPayment && existingInvoice) {
      return res.json({
        success: true,
        message: 'Payment already verified',
        data: { appointment, payment: existingPayment, invoice: existingInvoice },
      });
    }

    await ensureConsultationFee(appointment);
    const { consultationFee, tax, taxRate, totalAmount } = computeAppointmentTotals(appointment);

    const payment = existingPayment
      ? existingPayment
      : await Payment.create({
          userId,
          amount: totalAmount,
          currency: 'INR',
          provider: 'razorpay',
          transactionId: razorpay_payment_id,
          status: 'success',
          meta: {
            razorpay: {
              orderId: razorpay_order_id,
              paymentId: razorpay_payment_id,
              signature: razorpay_signature,
            },
            appointmentId: String(appointment._id),
          },
        });

    // Update appointment status to PAID
    appointment.status = 'PAID';
    await appointment.save();

    const invoice =
      existingInvoice ||
      (await Invoice.create({
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
      }));

    // Generate and store PDF (best effort; don't fail payment if PDF generation fails)
    try {
      if (!invoice.pdfData || !invoice.pdfData.length) {
        const user = await User.findById(userId);
        const pdfBuffer = await generateInvoicePdf({ invoice, user, appointment });
        invoice.pdfData = pdfBuffer;
        await invoice.save();
      }
    } catch (pdfError) {
      console.error('Invoice PDF generation failed:', pdfError?.message || pdfError);
    }

    // Email (best effort)
    try {
      const user = await User.findById(userId);
      if (user) {
        await sendPaymentSuccessEmail(user.email, user.firstName, {
          amount: totalAmount.toFixed(2),
          transactionId: payment.transactionId,
          invoiceNumber: invoice.invoiceNumber,
          date: new Date().toLocaleDateString(),
        }, `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/appointments`);

        await EmailLog.create({
          userId,
          email: user.email,
          subject: 'Payment Successful - MediMeal',
          type: 'payment_success',
          status: 'sent',
          metadata: { appointmentId: appointment._id, paymentId: payment._id, invoiceId: invoice._id },
        });
      }
    } catch (emailError) {
      console.error('Failed to send payment success email:', emailError);
    }

    return res.json({
      success: true,
      message: 'Payment verified and appointment confirmed',
      data: { appointment, payment, invoice },
    });
  } catch (error) {
    console.error('Verify appointment Razorpay payment error:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to verify payment',
    });
  }
});

router.post('/:appointmentId/pay', auth, async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const userId = req.user._id;
    const { paymentMethod, transactionId } = req.body;

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Security: User can only pay for their own appointments
    if (appointment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only pay for your own appointments.'
      });
    }

    // Status flow validation - Payment can ONLY happen after APPROVAL
    // Support both uppercase and lowercase status values
    const statusUpper = appointment.status?.toUpperCase();
    if (statusUpper !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: `Cannot pay for appointment with status: ${appointment.status}. Appointment must be APPROVED before payment.`
      });
    }

    // Get consultation fee from appointment (already set from doctor profile)
    const consultationFee = appointment.consultationFee || 0;
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

    // Update appointment status to PAID (payment has been processed)
    appointment.status = 'PAID';
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

    // Send payment success email with invoice
    try {
      const user = await User.findById(userId);
      await sendPaymentSuccessEmail(user.email, user.firstName, {
        totalAmount: totalAmount.toFixed(2),
        currency: 'INR',
        transactionId: payment.transactionId,
        date: payment.createdAt.toLocaleDateString(),
        doctorName: appointment.provider.name,
        invoiceNumber: invoice.invoiceNumber
      }, `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/invoices/${invoice._id}`);
      
      await EmailLog.create({
        userId,
        email: user.email,
        subject: 'Payment Successful & Invoice - MediMeal',
        type: 'payment_success',
        status: 'sent',
        metadata: { appointmentId: appointment._id, paymentId: payment._id, invoiceId: invoice._id }
      });
    } catch (emailError) {
      console.error('Failed to send payment success email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Payment successful and appointment confirmed',
      data: {
        appointment,
        payment,
        invoice
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

module.exports = router;
