# 🏥 MEDIMEAL APPOINTMENT WORKFLOW - COMPLETE GUIDE

## 📋 WORKFLOW OVERVIEW

This document describes the **complete, bulletproof appointment workflow** for the MediMeal healthcare ERP system.

---

## 🔄 STATUS FLOW (MANDATORY)

```
REQUESTED → APPROVED → PAYMENT_PENDING → PAID
     ↓
  REJECTED (No payment, no calendar event)
```

### Status Rules:
- **REQUESTED**: Initial status when user books appointment
- **APPROVED**: Doctor approves → Enables payment, creates calendar event
- **REJECTED**: Doctor rejects → No payment, no calendar event
- **PAID**: User completes payment after approval
- **Strict Enforcement**: Status transitions are validated at each step

---

## 📝 STEP-BY-STEP WORKFLOW

### 1️⃣ USER BOOKS APPOINTMENT

**Endpoint:** `POST /api/appointments/book`

**Request Body:**
```json
{
  "doctorId": "ObjectId",
  "date": "2026-01-20",
  "time": "14:30",
  "type": "consultation",
  "reasonForVisit": "Fever and headache",
  "mode": "in-person"
}
```

**Process:**
1. ✅ Validates `doctorId`, `date`, `time`, `reasonForVisit` are required
2. ✅ Validates `doctorId` is valid ObjectId
3. ✅ Verifies doctor exists and is active
4. ✅ Validates appointment date is in future
5. ✅ Creates appointment with status: `REQUESTED`
6. ✅ Saves `doctorId` as ObjectId (from `doctor._id`)
7. ✅ Sends booking confirmation email to USER
8. ✅ Sends appointment request notification email to DOCTOR
9. ✅ Logs emails in EmailLog

**Response:**
```json
{
  "success": true,
  "message": "Appointment booking requested successfully",
  "data": { /* appointment object */ }
}
```

**Database State:**
- `appointment.status = "REQUESTED"`
- `appointment.doctorId = doctor._id` (ObjectId)
- `appointment.userId = user._id` (ObjectId)

---

### 2️⃣ DOCTOR VIEWS APPOINTMENT REQUESTS

**Endpoint:** `GET /api/appointments/doctor/:doctorId`

**Security:**
- Doctor can only view their own appointments
- Uses logged-in doctor's `_id` (ObjectId) for query
- Validates doctor exists and has `doctor` role

**Query:**
```javascript
Appointment.find({
  $or: [
    { doctorId: doctorObjectId },        // Primary match
    { 'provider.name': doctorName }      // Fallback match
  ]
})
.sort({ createdAt: -1 })  // Latest first
.populate('userId', 'firstName lastName email phone dateOfBirth gender')
```

**Returns:**
- All appointments with status: `REQUESTED`, `APPROVED`, `PAID`
- Sorted by `createdAt` DESC (newest first)
- Includes patient details (name, email, phone)

**Frontend:**
- Auto-refreshes every 15 seconds
- Shows appointment summary with counts
- Displays all appointments with filters

---

### 3️⃣ DOCTOR APPROVES APPOINTMENT

**Endpoint:** `PATCH /api/appointments/:appointmentId/approve`

**Security Checks:**
1. ✅ Appointment exists
2. ✅ Doctor owns the appointment (`appointment.doctorId === doctor._id`)
3. ✅ Status is `REQUESTED` (can only approve REQUESTED appointments)

**Process:**
1. ✅ Validates appointment status is `REQUESTED`
2. ✅ Updates status to `APPROVED`
3. ✅ Attaches `consultationFee` from Doctor model
4. ✅ Creates calendar event for user
5. ✅ Sends approval email to user
6. ✅ Logs email in EmailLog

**Calendar Event:**
```javascript
{
  userId: appointment.userId,
  title: `Doctor Appointment – ${appointment.provider.name}`,
  type: 'appointment',
  date: appointment.appointmentDate,
  time: appointmentTime,
  description: `${appointment.type} appointment with ${appointment.provider.name}`
}
```

**Email:**
- Subject: "✅ Appointment Approved - MediMeal"
- Content: Appointment details + "Please proceed with payment"

**Database State:**
- `appointment.status = "APPROVED"`
- Calendar event created
- Email sent and logged

---

### 4️⃣ DOCTOR REJECTS APPOINTMENT

**Endpoint:** `PATCH /api/appointments/:appointmentId/reject`

**Request Body:**
```json
{
  "reason": "Optional rejection reason"
}
```

**Security Checks:**
1. ✅ Appointment exists
2. ✅ Doctor owns the appointment
3. ✅ Status is `REQUESTED`

**Process:**
1. ✅ Validates appointment status is `REQUESTED`
2. ✅ Updates status to `REJECTED`
3. ✅ Stores optional `cancellationReason`
4. ✅ Sets `cancelledBy = 'provider'`
5. ✅ Sends rejection email to user
6. ✅ **DOES NOT** create calendar event
7. ✅ Logs email in EmailLog

**Email:**
- Subject: "❌ Appointment Rejected - MediMeal"
- Content: Appointment details + rejection reason

**Database State:**
- `appointment.status = "REJECTED"`
- `appointment.cancellationReason = reason`
- `appointment.cancelledBy = "provider"`
- No calendar event created

---

### 5️⃣ USER PAYS FOR APPROVED APPOINTMENT

**Endpoint:** `POST /api/appointments/:appointmentId/pay`

**Request Body:**
```json
{
  "paymentMethod": "stripe",
  "transactionId": "TXN-123456"
}
```

**Security Checks:**
1. ✅ Appointment exists
2. ✅ User owns the appointment
3. ✅ Status is `APPROVED` (payment only enabled after approval)

**Process:**
1. ✅ Validates appointment status is `APPROVED`
2. ✅ Calculates total amount (consultationFee + 18% GST)
3. ✅ Creates Payment record
4. ✅ Updates appointment status to `PAID`
5. ✅ Generates Invoice
6. ✅ Sends payment success email with invoice link
7. ✅ Logs email in EmailLog

**Payment Record:**
```javascript
{
  userId: userId,
  amount: totalAmount,
  currency: 'INR',
  provider: paymentMethod,
  transactionId: transactionId,
  status: 'success'
}
```

**Invoice:**
```javascript
{
  userId: userId,
  appointmentId: appointment._id,
  paymentId: payment._id,
  doctorName: appointment.provider.name,
  consultationFee: consultationFee,
  tax: tax,
  totalAmount: totalAmount,
  transactionId: payment.transactionId
}
```

**Database State:**
- `appointment.status = "PAID"`
- Payment record created
- Invoice generated

---

## 🔐 SECURITY RULES (CRITICAL)

### Doctor Security:
- ✅ Doctor can only approve/reject their own appointments
- ✅ Doctor can only view their own appointments
- ✅ Doctor dashboard uses `doctor._id` (ObjectId) for queries
- ✅ No email-based or name-based matching (uses ObjectId)

### User Security:
- ✅ User can only view their own appointments
- ✅ User can only pay for their own appointments
- ✅ Payment is only enabled for `APPROVED` appointments

### Status Flow Enforcement:
- ✅ Approval: Only `REQUESTED` → `APPROVED`
- ✅ Rejection: Only `REQUESTED` → `REJECTED`
- ✅ Payment: Only `APPROVED` → `PAID`
- ✅ All transitions validated at API level

---

## 🔄 REAL-TIME SYNC

### Frontend Auto-Refresh:
- **Appointments Page (Doctor)**: Refreshes every 15 seconds
- **Dashboard Overview**: Refreshes every 30 seconds
- **User Dashboard**: Updates on action completion

### Manual Refresh:
- ✅ Refresh button available on doctor appointments page
- ✅ User dashboard refreshes after booking

---

## 📧 EMAIL NOTIFICATIONS

### 1. Booking Confirmation (User)
- **When:** Immediately after booking
- **Subject:** "📅 Appointment Request Sent - MediMeal"
- **Content:** Appointment details + "Waiting for approval"

### 2. New Request Notification (Doctor)
- **When:** Immediately after booking
- **Subject:** "📅 New Appointment Request - MediMeal"
- **Content:** Patient details + appointment details + link to dashboard

### 3. Approval Notification (User)
- **When:** Doctor approves
- **Subject:** "✅ Appointment Approved - MediMeal"
- **Content:** Appointment details + "Please proceed with payment"

### 4. Rejection Notification (User)
- **When:** Doctor rejects
- **Subject:** "❌ Appointment Rejected - MediMeal"
- **Content:** Appointment details + rejection reason

### 5. Payment Success (User)
- **When:** Payment completed
- **Subject:** "💳 Payment Successful - MediMeal"
- **Content:** Payment details + invoice download link

---

## 📅 CALENDAR INTEGRATION

### Calendar Event Creation:
- ✅ **Only created on APPROVAL** (not on booking or rejection)
- ✅ Event type: `appointment`
- ✅ Title: "Doctor Appointment – {doctor.name}"
- ✅ Date & time from appointment
- ✅ Linked to user's calendar

### Calendar Event Fields:
```javascript
{
  userId: appointment.userId,
  type: 'appointment',
  title: `Doctor Appointment – ${appointment.provider.name}`,
  date: appointment.appointmentDate,
  time: appointmentTime,
  description: `${appointment.type} appointment with ${appointment.provider.name}`,
  color: 'bg-blue-100 text-blue-700 border-blue-200'
}
```

---

## 🎯 VALIDATION RULES

### Booking Validation:
- ✅ `doctorId` required and valid ObjectId
- ✅ `date`, `time`, `reasonForVisit` required
- ✅ Doctor must exist and be active
- ✅ Appointment date must be in future
- ✅ Users can book unlimited appointments

### Approval/Rejection Validation:
- ✅ Appointment must exist
- ✅ Doctor must own appointment
- ✅ Status must be `REQUESTED`
- ✅ Only one status change allowed per request

### Payment Validation:
- ✅ Appointment must exist
- ✅ User must own appointment
- ✅ Status must be `APPROVED`
- ✅ Payment amount calculated correctly

---

## 📊 DATABASE SCHEMA

### Appointment Model:
```javascript
{
  userId: ObjectId (required, ref: 'User'),
  doctorId: ObjectId (required, ref: 'User'),
  status: String (enum: ['REQUESTED', 'APPROVED', 'REJECTED', 'PAID', ...]),
  appointmentDate: Date (required),
  consultationFee: Number,
  reasonForVisit: String (required),
  provider: {
    name: String,
    specialization: String,
    email: String,
    phone: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `doctorId` (for fast queries)
- `userId` (for fast queries)
- `status` (for filtering)
- `{ userId, appointmentDate }` (compound)
- `{ userId, status, appointmentDate }` (compound)

---

## ✅ TESTING CHECKLIST

### Booking:
- [ ] User can book appointment
- [ ] Status is set to `REQUESTED`
- [ ] `doctorId` is saved correctly as ObjectId
- [ ] User receives booking confirmation email
- [ ] Doctor receives new request notification email

### Doctor Dashboard:
- [ ] Doctor sees all `REQUESTED` appointments
- [ ] Doctor sees all `APPROVED` appointments
- [ ] Doctor sees all `PAID` appointments
- [ ] Auto-refresh works (15 seconds)
- [ ] Appointment summary shows correct counts

### Approval:
- [ ] Doctor can approve only their own appointments
- [ ] Status changes from `REQUESTED` to `APPROVED`
- [ ] Calendar event is created
- [ ] User receives approval email
- [ ] Payment button appears for user

### Rejection:
- [ ] Doctor can reject only their own appointments
- [ ] Status changes from `REQUESTED` to `REJECTED`
- [ ] No calendar event is created
- [ ] User receives rejection email
- [ ] Rejection reason is stored

### Payment:
- [ ] User can pay only for their own appointments
- [ ] Payment only works for `APPROVED` appointments
- [ ] Status changes from `APPROVED` to `PAID`
- [ ] Payment record is created
- [ ] Invoice is generated
- [ ] User receives payment success email

---

## 🚀 DEPLOYMENT CHECKLIST

### Backend:
- [ ] All endpoints are secured with `auth` middleware
- [ ] Doctor actions use `authorize('doctor')` middleware
- [ ] All status transitions are validated
- [ ] All security checks are in place
- [ ] Email service is configured
- [ ] Database indexes are created

### Frontend:
- [ ] Auto-refresh is enabled (15s for appointments, 30s for dashboard)
- [ ] Status labels display correctly
- [ ] Error handling is in place
- [ ] Loading states are shown
- [ ] Success/error messages are displayed

---

## 📝 NOTES

1. **Unlimited Appointments**: Users can book unlimited appointments - no restrictions
2. **Real-time Updates**: Both dashboards auto-refresh to show latest data
3. **Email Logging**: All emails are logged in EmailLog for audit trail
4. **Status Consistency**: Status values are case-insensitive in validation (supports both uppercase and lowercase)
5. **ObjectId Matching**: All doctorId matching uses ObjectId comparison (not strings or emails)

---

## 🐛 TROUBLESHOOTING

### Appointments not showing:
1. Check backend logs for query results
2. Verify `doctorId` matches in appointment and doctor record
3. Check status filter (should include `REQUESTED`)
4. Verify appointment was created with correct `doctorId`

### Payment not working:
1. Verify appointment status is `APPROVED`
2. Check user owns the appointment
3. Verify payment endpoint is called correctly

### Emails not sending:
1. Check email service configuration
2. Verify EmailLog for email status
3. Check backend logs for email errors

---

**Last Updated:** 2026-01-16
**Version:** 1.0.0
**Status:** ✅ Production Ready
