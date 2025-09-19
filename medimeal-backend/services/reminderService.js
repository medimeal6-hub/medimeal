const cron = require('node-cron')
const User = require('../models/User')
const Meal = require('../models/Meal')
const { sendMail } = require('../utils/mailer')

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

async function sendDueEmails() {
  const due = await collectDueReminders()
  for (const item of due) {
    const { user, med, key, hm } = item
    const subject = `Medication Reminder: ${med.name} at ${hm}`
    const html = `<div>
      <p>Hi ${user.firstName || ''},</p>
      <p>This is a reminder to take your medication:</p>
      <ul>
        <li><strong>Name</strong>: ${med.name}</li>
        <li><strong>Dosage</strong>: ${med.dosage}</li>
        <li><strong>When</strong>: ${hm}${med.timingMode === 'relativeToMeal' ? ` (${med.relativeWhen} ${med.offsetMinutes} min ${med.relativeMealType})` : ''}</li>
      </ul>
      <p>Stay healthy!</p>
    </div>`
    try {
      await sendMail({ to: user.email, subject, html })
      // Mark sent
      med.sentReminders = med.sentReminders || []
      med.sentReminders.push(key)
      await user.save()
    } catch (e) {
      console.error('Email send failed', e)
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