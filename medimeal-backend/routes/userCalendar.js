const express = require('express');
const { auth } = require('../middleware/auth');
const CalendarEvent = require('../models/CalendarEvent');
const Appointment = require('../models/Appointment');
const FoodPlan = require('../models/FoodPlan');
const FoodDiary = require('../models/FoodDiary');
const ComplianceLog = require('../models/ComplianceLog');

const router = express.Router();

// GET /api/user/calendar - Get unified health calendar events
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();
    end.setMonth(end.getMonth() + 1); // Default to next month
    
    const events = [];
    
    // Get calendar events
    const calendarEvents = await CalendarEvent.find({
      userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1, time: 1 });
    
    // Get approved appointments (blue)
    const appointments = await Appointment.find({
      userId,
      status: { $in: ['approved', 'paid', 'confirmed'] },
      appointmentDate: { $gte: start, $lte: end }
    }).sort({ appointmentDate: 1 });
    
    // Get active diet plan for recommended meals (green)
    const activePlan = await FoodPlan.findOne({
      patientId: userId,
      isActive: true
    });
    
    // Get food diary entries to check for missed meals
    const foodDiaryEntries = await FoodDiary.find({
      userId,
      date: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] }
    });
    
    // Get compliance logs for warnings (red)
    const complianceLogs = await ComplianceLog.find({
      userId,
      resolved: false,
      createdAt: { $gte: start, $lte: end }
    });
    
    // Process calendar events
    calendarEvents.forEach(event => {
      let color = event.color || 'bg-blue-100 text-blue-700 border-blue-200';
      
      // Recommended meals (green)
      if (event.type === 'meal' && event.completed) {
        color = 'bg-green-100 text-green-700 border-green-200';
      }
      
      // Missed meals/warnings (red)
      if (event.type === 'meal' && !event.completed && new Date(event.date) < new Date()) {
        color = 'bg-red-100 text-red-700 border-red-200';
      }
      
      events.push({
        id: event._id,
        title: event.title,
        type: event.type,
        date: event.date,
        time: event.time,
        description: event.description,
        color,
        completed: event.completed,
        priority: event.priority
      });
    });
    
    // Process appointments (blue)
    appointments.forEach(apt => {
      events.push({
        id: apt._id,
        title: `Appointment: ${apt.provider.name}`,
        type: 'appointment',
        date: apt.appointmentDate,
        time: apt.appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        description: apt.reasonForVisit,
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        completed: apt.status === 'completed',
        priority: 'high',
        appointmentId: apt._id,
        status: apt.status
      });
    });
    
    // Add recommended meals from diet plan (green)
    if (activePlan) {
      const mealTimes = {
        breakfast: '08:00',
        lunch: '12:30',
        dinner: '19:00'
      };
      
      ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        const plannedMeals = activePlan[mealType] || [];
        if (plannedMeals.length > 0) {
          // Check if logged
          const isLogged = foodDiaryEntries.some(
            fd => fd.mealType === mealType && 
                  fd.date === new Date().toISOString().split('T')[0]
          );
          
          events.push({
            id: `plan-${mealType}-${new Date().toISOString().split('T')[0]}`,
            title: `Recommended ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`,
            type: 'meal',
            date: new Date(),
            time: mealTimes[mealType],
            description: plannedMeals.map(f => f.foodName).join(', '),
            color: isLogged ? 'bg-green-100 text-green-700 border-green-200' : 'bg-green-100 text-green-700 border-green-200',
            completed: isLogged,
            priority: 'medium',
            recommended: true
          });
        }
      });
    }
    
    // Add compliance warnings (red)
    complianceLogs.forEach(log => {
      events.push({
        id: log._id,
        title: `Health Alert: ${log.category}`,
        type: 'alert',
        date: log.createdAt,
        time: log.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        description: log.message,
        color: 'bg-red-100 text-red-700 border-red-200',
        completed: false,
        priority: log.severity === 'high' ? 'high' : 'medium',
        alert: true
      });
    });
    
    // Sort events by date and time
    events.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });
    
    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar events'
    });
  }
});

module.exports = router;
