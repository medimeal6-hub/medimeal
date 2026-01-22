const nodemailer = require('nodemailer')

let transporter

function getTransporter() {
  if (transporter) return transporter
  
  // Use live Gmail SMTP configuration
  const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com'
  const EMAIL_PORT = process.env.EMAIL_PORT || 587
  const EMAIL_SECURE = process.env.EMAIL_SECURE || 'false'
  const EMAIL_USER = process.env.EMAIL_USER || 'medimeal6@gmail.com'
  const EMAIL_PASS = process.env.EMAIL_PASS || 'dnqn nkxy rqrm hrhc'
  const EMAIL_FROM = process.env.EMAIL_FROM || 'MediMeal <noreply@medimeal.com>'
  
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS || !EMAIL_FROM) {
    console.warn('Email disabled: missing email envs (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM)')
    return null
  }
  
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: String(EMAIL_SECURE) === 'true',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
  })
  
  console.log('📧 Gmail SMTP configured:', EMAIL_USER)
  return transporter
}

async function sendMail({ to, subject, html }) {
  const tx = getTransporter()
  if (!tx) return { ok: false, skipped: true }
  const from = process.env.EMAIL_FROM
  await tx.sendMail({ from, to, subject, html })
  return { ok: true }
}

async function sendPasswordResetEmail(email, firstName, resetUrl) {
  const subject = 'Password Reset Request - MediMeal'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - MediMeal</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
          <p>MediMeal - Personalized Health Nutrition</p>
        </div>
        <div class="content">
          <h2>Hello ${firstName}!</h2>
          <p>We received a request to reset your password for your MediMeal account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset My Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">${resetUrl}</p>
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your password will remain unchanged until you create a new one</li>
            </ul>
          </div>
          <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
        </div>
        <div class="footer">
          <p>This email was sent from MediMeal. If you have any questions, please contact our support team.</p>
          <p>© 2024 MediMeal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  return await sendMail({ to: email, subject, html })
}

async function sendWelcomeEmail(email, firstName) {
  const subject = 'Welcome to MediMeal - Your Health Journey Starts Here!'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to MediMeal</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .tip { background: #e8f5e9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌿 Welcome to MediMeal!</h1>
          <p>Your Personalized Health & Nutrition Companion</p>
        </div>
        <div class="content">
          <h2>Hello ${firstName}!</h2>
          <p>Welcome to MediMeal! We're excited to have you join our community focused on improving health through personalized nutrition.</p>
          
          <div class="tip">
            <strong>💡 Getting Started Tips:</strong>
            <ul>
              <li>Complete your health profile to get personalized recommendations</li>
              <li>Upload your prescriptions for medication-based meal suggestions</li>
              <li>Log your meals to track your nutrition journey</li>
              <li>Set health goals and track your progress</li>
            </ul>
          </div>
          
          <p>MediMeal helps you make informed food choices that work with your medications and health conditions, ensuring you get the most out of your nutrition plan.</p>
          
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="button">Get Started</a>
          
          <p>If you have any questions or need assistance, our support team is here to help at any time.</p>
        </div>
        <div class="footer">
          <p>Thank you for choosing MediMeal!</p>
          <p>© 2024 MediMeal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  return await sendMail({ to: email, subject, html })
}

async function sendLoginNotificationEmail(email, firstName, loginTime, ipAddress) {
  const subject = 'New Login to Your MediMeal Account'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login Notification - MediMeal</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2196F3 0%, #0D47A1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .info-box { background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 New Login Detected</h1>
          <p>MediMeal - Personalized Health Nutrition</p>
        </div>
        <div class="content">
          <h2>Hello ${firstName}!</h2>
          <p>We noticed a new login to your MediMeal account.</p>
          
          <div class="info-box">
            <strong>Login Details:</strong>
            <ul>
              <li><strong>Time:</strong> ${loginTime}</li>
              <li><strong>IP Address:</strong> ${ipAddress || 'Unknown'}</li>
              <li><strong>Device:</strong> ${getDeviceType()}</li>
            </ul>
          </div>
          
          <p>If this was you, you can safely ignore this email. However, if you don't recognize this login, please take the following steps immediately:</p>
          
          <div class="warning">
            <strong>⚠️ Security Actions:</strong>
            <ul>
              <li>Change your password immediately</li>
              <li>Enable two-factor authentication if available</li>
              <li>Contact our support team if you need assistance</li>
            </ul>
          </div>
          
          <p>For your security, we recommend using a strong, unique password and enabling additional security features.</p>
        </div>
        <div class="footer">
          <p>This is an automated security notification from MediMeal.</p>
          <p>© 2024 MediMeal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  return await sendMail({ to: email, subject, html })
}

// Helper function to determine device type (simplified)
function getDeviceType() {
  // In a real implementation, this would be determined from the request headers
  return 'Computer or Mobile Device'
}

async function sendMedicationReminderEmail(email, firstName, medicationName, dosage, scheduledTime) {
  const subject = `💊 Medication Reminder - ${medicationName}`
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Medication Reminder - MediMeal</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #FF6B6B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .reminder-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .medication-info { background: #e8f5e9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💊 Medication Reminder</h1>
          <p>MediMeal - Your Health Companion</p>
        </div>
        <div class="content">
          <h2>Hello ${firstName}!</h2>
          <p>It's time to take your medication as scheduled.</p>
          
          <div class="medication-info">
            <strong>📋 Medication Details:</strong>
            <ul>
              <li><strong>Medication:</strong> ${medicationName}</li>
              <li><strong>Dosage:</strong> ${dosage}</li>
              <li><strong>Scheduled Time:</strong> ${scheduledTime}</li>
              <li><strong>Current Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          
          <div class="reminder-box">
            <strong>⚠️ Important Reminders:</strong>
            <ul>
              <li>Take your medication as prescribed by your doctor</li>
              <li>Follow the correct timing for optimal effectiveness</li>
              <li>Check for any food interactions before eating</li>
              <li>Contact your doctor if you experience any side effects</li>
            </ul>
          </div>
          
          <p>Remember to log this medication in your MediMeal app to track your adherence.</p>
          
          <p>If you have any questions about your medication, please consult with your healthcare provider.</p>
        </div>
        <div class="footer">
          <p>This is an automated reminder from MediMeal.</p>
          <p>© 2024 MediMeal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  return await sendMail({ to: email, subject, html })
}

async function sendDailyFoodAlertEmail(email, firstName, alerts) {
  const subject = '🌅 Daily Food Alert - MediMeal'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Daily Food Alert - MediMeal</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FFA500 0%, #FF6B35 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
        .warning-box { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 15px 0; }
        .info-box { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌅 Daily Food Alert</h1>
          <p>MediMeal - Your Health Companion</p>
        </div>
        <div class="content">
          <h2>Hello ${firstName}!</h2>
          <p>Here's your daily food alert for today:</p>
          ${alerts.reminders && alerts.reminders.length > 0 ? `
            <div class="alert-box">
              <strong>📝 Meal Reminders:</strong>
              <ul>
                ${alerts.reminders.map(r => `<li>${r}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${alerts.warnings && alerts.warnings.length > 0 ? `
            <div class="warning-box">
              <strong>⚠️ Warnings:</strong>
              <ul>
                ${alerts.warnings.map(w => `<li>${w}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${alerts.recommendations && alerts.recommendations.length > 0 ? `
            <div class="info-box">
              <strong>💡 Recommendations:</strong>
              <ul>
                ${alerts.recommendations.map(r => `<li>${r}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          <p>Stay on track with your health goals!</p>
        </div>
        <div class="footer">
          <p>This is an automated alert from MediMeal.</p>
          <p>© 2024 MediMeal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
  return await sendMail({ to: email, subject, html })
}

async function sendBookingConfirmationEmail(email, firstName, appointmentDetails) {
  const subject = '📅 Appointment Request Sent - MediMeal'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Request - MediMeal</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2196F3 0%, #0D47A1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Appointment Request Sent</h1>
          <p>MediMeal - Your Health Companion</p>
        </div>
        <div class="content">
          <h2>Hello ${firstName}!</h2>
          <p>Your appointment request has been successfully submitted and is waiting for doctor approval.</p>
          <div class="info-box">
            <strong>📅 Appointment Details:</strong>
            <ul>
              <li><strong>Doctor:</strong> ${appointmentDetails.doctorName}</li>
              <li><strong>Date:</strong> ${appointmentDetails.date}</li>
              <li><strong>Time:</strong> ${appointmentDetails.time}</li>
              <li><strong>Type:</strong> ${appointmentDetails.type}</li>
              <li><strong>Status:</strong> Waiting for Approval</li>
            </ul>
          </div>
          <p>You will receive an email notification once the doctor approves or rejects your appointment request.</p>
        </div>
        <div class="footer">
          <p>This is an automated notification from MediMeal.</p>
          <p>© 2024 MediMeal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
  return await sendMail({ to: email, subject, html })
}

async function sendAppointmentApprovalEmail(email, firstName, appointmentDetails) {
  const subject = '✅ Appointment Approved - MediMeal'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Approved - MediMeal</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: #e8f5e9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Appointment Approved</h1>
          <p>MediMeal - Your Health Companion</p>
        </div>
        <div class="content">
          <h2>Hello ${firstName}!</h2>
          <p>Great news! Your appointment has been approved by the doctor.</p>
          <div class="info-box">
            <strong>📅 Appointment Details:</strong>
            <ul>
              <li><strong>Doctor:</strong> ${appointmentDetails.doctorName}</li>
              <li><strong>Date:</strong> ${appointmentDetails.date}</li>
              <li><strong>Time:</strong> ${appointmentDetails.time}</li>
              <li><strong>Type:</strong> ${appointmentDetails.type}</li>
            </ul>
          </div>
          <p>Please proceed with payment to confirm your appointment.</p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/appointments" class="button">View Appointment</a>
        </div>
        <div class="footer">
          <p>This is an automated notification from MediMeal.</p>
          <p>© 2024 MediMeal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
  return await sendMail({ to: email, subject, html })
}

async function sendAppointmentRejectionEmail(email, firstName, appointmentDetails, reason) {
  const subject = '❌ Appointment Rejected - MediMeal'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Rejected - MediMeal</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f44336 0%, #c62828 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Appointment Rejected</h1>
          <p>MediMeal - Your Health Companion</p>
        </div>
        <div class="content">
          <h2>Hello ${firstName}!</h2>
          <p>Unfortunately, your appointment request has been rejected by the doctor.</p>
          <div class="info-box">
            <strong>📅 Appointment Details:</strong>
            <ul>
              <li><strong>Doctor:</strong> ${appointmentDetails.doctorName}</li>
              <li><strong>Date:</strong> ${appointmentDetails.date}</li>
              <li><strong>Time:</strong> ${appointmentDetails.time}</li>
              <li><strong>Type:</strong> ${appointmentDetails.type}</li>
              ${reason ? `<li><strong>Reason:</strong> ${reason}</li>` : ''}
            </ul>
          </div>
          <p>You can book a new appointment with another doctor or try a different time slot.</p>
        </div>
        <div class="footer">
          <p>This is an automated notification from MediMeal.</p>
          <p>© 2024 MediMeal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
  return await sendMail({ to: email, subject, html })
}

async function sendPaymentSuccessEmail(email, firstName, paymentDetails, invoiceUrl) {
  const subject = '💳 Payment Successful - MediMeal'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Successful - MediMeal</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: #e8f5e9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💳 Payment Successful</h1>
          <p>MediMeal - Your Health Companion</p>
        </div>
        <div class="content">
          <h2>Hello ${firstName}!</h2>
          <p>Your payment has been processed successfully!</p>
          <div class="info-box">
            <strong>💳 Payment Details:</strong>
            <ul>
              <li><strong>Amount:</strong> ₹${paymentDetails.amount}</li>
              <li><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</li>
              <li><strong>Invoice Number:</strong> ${paymentDetails.invoiceNumber}</li>
              <li><strong>Date:</strong> ${paymentDetails.date}</li>
            </ul>
          </div>
          <p>Your appointment is now confirmed. You can download your invoice below.</p>
          ${invoiceUrl ? `<a href="${invoiceUrl}" class="button">Download Invoice</a>` : ''}
        </div>
        <div class="footer">
          <p>This is an automated notification from MediMeal.</p>
          <p>© 2024 MediMeal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
  return await sendMail({ to: email, subject, html })
}

async function sendAppointmentReminderEmail(email, firstName, appointmentDetails, hoursUntil) {
  const subject = `⏰ Appointment Reminder - ${hoursUntil} hour${hoursUntil > 1 ? 's' : ''} until your appointment`
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Reminder - MediMeal</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2196F3 0%, #0D47A1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background: #2196F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Appointment Reminder</h1>
          <p>MediMeal - Your Health Companion</p>
        </div>
        <div class="content">
          <h2>Hello ${firstName}!</h2>
          <p>This is a reminder that you have an appointment in ${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}.</p>
          <div class="info-box">
            <strong>📅 Appointment Details:</strong>
            <ul>
              <li><strong>Doctor:</strong> ${appointmentDetails.doctorName}</li>
              <li><strong>Date:</strong> ${appointmentDetails.date}</li>
              <li><strong>Time:</strong> ${appointmentDetails.time}</li>
              <li><strong>Type:</strong> ${appointmentDetails.type}</li>
            </ul>
          </div>
          <p>Please make sure to arrive on time for your appointment.</p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/appointments" class="button">View Appointment</a>
        </div>
        <div class="footer">
          <p>This is an automated reminder from MediMeal.</p>
          <p>© 2024 MediMeal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
  return await sendMail({ to: email, subject, html })
}

async function sendDoctorAppointmentRequestEmail(email, doctorFirstName, appointmentDetails) {
  const subject = '📅 New Appointment Request - MediMeal'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Appointment Request - MediMeal</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: #fff3e0; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background: #FF9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .status-badge { display: inline-block; background: #ffc107; color: #333; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 New Appointment Request</h1>
          <p>MediMeal - Doctor Dashboard</p>
        </div>
        <div class="content">
          <h2>Hello Dr. ${doctorFirstName}!</h2>
          <p>You have received a new appointment request from a patient.</p>
          <div class="info-box">
            <strong>📋 Appointment Details:</strong>
            <ul>
              <li><strong>Patient Name:</strong> ${appointmentDetails.patientName}</li>
              <li><strong>Patient Email:</strong> ${appointmentDetails.patientEmail}</li>
              <li><strong>Date:</strong> ${appointmentDetails.date}</li>
              <li><strong>Time:</strong> ${appointmentDetails.time}</li>
              <li><strong>Type:</strong> ${appointmentDetails.type}</li>
              <li><strong>Reason for Visit:</strong> ${appointmentDetails.reasonForVisit || 'Not specified'}</li>
              <li><strong>Status:</strong> <span class="status-badge">REQUESTED</span></li>
            </ul>
          </div>
          <p>Please log in to your doctor dashboard to review and approve or reject this appointment request.</p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/doctor/dashboard/appointments" class="button">View Appointment Requests</a>
        </div>
        <div class="footer">
          <p>This is an automated notification from MediMeal.</p>
          <p>© 2024 MediMeal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
  return await sendMail({ to: email, subject, html })
}

module.exports = { 
  sendMail, 
  sendPasswordResetEmail, 
  sendWelcomeEmail, 
  sendLoginNotificationEmail,
  sendMedicationReminderEmail,
  sendDailyFoodAlertEmail,
  sendBookingConfirmationEmail,
  sendAppointmentApprovalEmail,
  sendAppointmentRejectionEmail,
  sendPaymentSuccessEmail,
  sendAppointmentReminderEmail,
  sendDoctorAppointmentRequestEmail
}