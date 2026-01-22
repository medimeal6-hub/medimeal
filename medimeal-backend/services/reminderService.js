const cron = require('node-cron')
const User = require('../models/User')
const Meal = require('../models/Meal')
const CalendarEvent = require('../models/CalendarEvent')
const ReminderLog = require('../models/ReminderLog')
const { sendMail, sendMedicationReminderEmail, sendAppointmentReminderEmail } = require('../utils/mailer')

// Helper
const toDateKey = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10)
const pad = (n) => (n < 10 ? '0' + n : '' + n)
const nowLocalHM = () => { const n = new Date(); return pad(n.getHours()) + ':' + pad(n.getMinutes()) }

function buildReminderKey(dateKey, hm) { return `${dateKey}|${hm}` }

function computeRelativeTime(mealTime, relativeWhen, offsetMinutes) {
  // mealTime HH:mm
  const [hh, mm] = mealTime.split(':').map(Number)
  let ms = (hh*60 + mm) * 60000
  if (relativeWhen === 'before') ms -= offsetMinutes * 60000
  else if (relativeWhen === 'after') ms += offsetMinutes * 60000
  // with = same time
  let minutes = Math.max(0, Math.min(23*60+59, Math.round(ms/60000)))
  const H = Math.floor(minutes/60), M = minutes % 60
  return pad(H) + ':' + pad(M)
}

async function findMealTimesByType(userId, dateKey) {
  // Get meal entries for the date; fallback to defaults if none
  const meals = await Meal.find({ userId, date: dateKey })
  const times = { breakfast: '08:00', lunch: '13:00', dinner: '19:00' }
  for (const m of meals) {
    if (m.type === 'breakfast') times.breakfast = m.time
    if (m.type === 'lunch') times.lunch = m.time
    if (m.type === 'dinner') times.dinner = m.time
  }
  return times
}

async function collectDueReminders() {
  const dateKey = toDateKey()
  const currentHM = nowLocalHM()

  // Only consider users with medications
  const users = await User.find({ 'medications.0': { $exists: true }, isActive: true }).select('email firstName medications')

  const due = []
  for (const u of users) {
    const mealTimes = await findMealTimesByType(u._id, dateKey)

    for (const med of u.medications) {
      // Date window check
      const start = med.startDate ? new Date(med.startDate) : null
      const end = med.endDate ? new Date(med.endDate) : null
      const today = new Date(dateKey)
      if (start && today < new Date(start.toDateString())) continue
      if (end && today > new Date(end.toDateString())) continue

      let candidateTimes = []
      if (med.timingMode === 'relativeToMeal') {
        const targets = med.relativeMealType === 'any' ? ['breakfast','lunch','dinner'] : [med.relativeMealType]
        for (const t of targets) {
          const hm = computeRelativeTime(mealTimes[t], med.relativeWhen, med.offsetMinutes || 0)
          candidateTimes.push(hm)
        }
      } else {
        candidateTimes = (med.times || [])
      }

      for (const hm of candidateTimes) {
        if (hm !== currentHM) continue
        const key = buildReminderKey(dateKey, hm)
        const already = (med.sentReminders || []).includes(key)
        if (already) continue
        due.push({ user: u, med, key, hm })
      }
    }
  }
  return due
}

async function collectDueAppointmentReminders() {
  const dateKey = toDateKey()
  const currentHM = nowLocalHM()
  const startOfDay = new Date(dateKey)
  const endOfDay = new Date(dateKey)
  endOfDay.setDate(endOfDay.getDate() + 1)
  const events = await CalendarEvent.find({
    type: 'appointment',
    completed: false,
    date: { $gte: startOfDay, $lt: endOfDay },
    reminder: { $ne: 'none' }
  }).select('userId title date time reminder appointmentDetails')
  const due = []
  for (const ev of events) {
    const offsetMinutes = parseInt(ev.reminder, 10)
    if (isNaN(offsetMinutes)) continue
    const remindHM = computeRelativeTime(ev.time, 'before', offsetMinutes)
    if (remindHM !== currentHM) continue
    due.push(ev)
  }
  return due
}

async function sendDueEmails() {
  const due = await collectDueReminders()
  console.log(`📧 Processing ${due.length} medication reminders...`)
  
  for (const item of due) {
    const { user, med, key, hm } = item
    const scheduledTime = new Date().toISOString()
    
    try {
      // Send enhanced medication reminder email
      await sendMedicationReminderEmail(
        user.email, 
        user.firstName || 'User', 
        med.name, 
        med.dosage, 
        hm
      )
      
      // Log the reminder
      const reminderLog = new ReminderLog({
        userId: user._id,
        medicationName: med.name,
        scheduledTime: new Date(),
        sentTime: new Date(),
        status: 'sent',
        emailAddress: user.email,
        subject: `💊 Medication Reminder - ${med.name}`,
        message: `Time to take your ${med.name} ${med.dosage} at ${hm}`,
        reminderType: 'medication'
      })
      
      await reminderLog.save()
      
      // Mark sent in user's medication record
      med.sentReminders = med.sentReminders || []
      med.sentReminders.push(key)
      await user.save()
      
      console.log(`✅ Sent reminder for ${med.name} to ${user.email}`)
      
    } catch (e) {
      console.error('❌ Email send failed for', user.email, med.name, e.message)
      
      // Log failed reminder
      try {
        const reminderLog = new ReminderLog({
          userId: user._id,
          medicationName: med.name,
          scheduledTime: new Date(),
          sentTime: new Date(),
          status: 'failed',
          emailAddress: user.email,
          subject: `💊 Medication Reminder - ${med.name}`,
          message: `Time to take your ${med.name} ${med.dosage} at ${hm}`,
          reminderType: 'medication',
          errorMessage: e.message
        })
        
        await reminderLog.save()
      } catch (logError) {
        console.error('Failed to log reminder error:', logError)
      }
    }
  }

  const dueAppointments = await collectDueAppointmentReminders()
  console.log(`📧 Processing ${dueAppointments.length} appointment reminders...`)
  for (const ev of dueAppointments) {
    try {
      const user = await User.findById(ev.userId).select('email firstName')
      if (!user) continue
      const eventDateTime = new Date(`${ev.date.toISOString().split('T')[0]}T${ev.time}:00`)
      const diffMs = eventDateTime.getTime() - Date.now()
      const hoursUntil = Math.max(0, Math.round(diffMs / 3600000))
      await sendAppointmentReminderEmail(
        user.email,
        user.firstName || 'User',
        {
          doctorName: ev.appointmentDetails?.doctor || 'Doctor',
          date: ev.date.toLocaleDateString(),
          time: ev.time,
          type: 'appointment'
        },
        hoursUntil
      )
      const reminderLog = new ReminderLog({
        userId: ev.userId,
        medicationName: ev.title,
        scheduledTime: eventDateTime,
        sentTime: new Date(),
        status: 'sent',
        emailAddress: user.email,
        subject: `⏰ Appointment Reminder - ${ev.title}`,
        message: `Reminder for appointment at ${ev.time} on ${ev.date.toLocaleDateString()}`,
        reminderType: 'appointment'
      })
      await reminderLog.save()
      console.log(`✅ Sent appointment reminder to ${user.email}`)
    } catch (e) {
      console.error('❌ Appointment reminder failed:', e.message)
    }
  }
}

function startReminderScheduler() {
  // Every minute
  cron.schedule('* * * * *', async () => {
    try { await sendDueEmails() } catch (e) { console.error('Reminder tick error', e) }
  })
}

module.exports = { startReminderScheduler }
