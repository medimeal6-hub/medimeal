const nodemailer = require('nodemailer')

let transporter

function getTransporter() {
  if (transporter) return transporter
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    console.warn('Email disabled: missing SMTP envs (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM)')
    return null
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE || 'false') === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  })
  return transporter
}

async function sendMail({ to, subject, html }) {
  const tx = getTransporter()
  if (!tx) return { ok: false, skipped: true }
  const from = process.env.SMTP_FROM
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

module.exports = { sendMail, sendPasswordResetEmail }