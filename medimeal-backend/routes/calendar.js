const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const CalendarEvent = require('../models/CalendarEvent');

// Mock data for calendar events
const mockEvents = [
  {
    _id: '1',
    title: 'Breakfast',
    type: 'meal',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00.000Z', // Tomorrow
    time: '08:00',
    duration: 30,
    description: 'Healthy breakfast with oatmeal and fruits',
    location: 'Home',
    priority: 'medium',
    completed: false,
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  {
    _id: '2',
    title: 'Morning Medication',
    type: 'medication',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00.000Z', // Tomorrow
    time: '09:00',
    duration: 15,
    description: 'Take prescribed medication with water',
    location: 'Home',
    priority: 'high',
    completed: false,
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    _id: '3',
    title: 'Lunch',
    type: 'meal',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00.000Z', // Tomorrow
    time: '12:30',
    duration: 45,
    description: 'Balanced lunch with protein and vegetables',
    location: 'Office',
    priority: 'medium',
    completed: false,
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  {
    _id: '4',
    title: 'Doctor Appointment',
    type: 'appointment',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00.000Z', // Day after tomorrow
    time: '14:00',
    duration: 60,
    description: 'Regular checkup with Dr. Smith',
    location: 'Medical Center',
    priority: 'high',
    completed: false,
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  {
    _id: '5',
    title: 'Evening Exercise',
    type: 'exercise',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00.000Z', // Day after tomorrow
    time: '18:00',
    duration: 45,
    description: '30-minute cardio workout',
    location: 'Gym',
    priority: 'medium',
    completed: false,
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  {
    _id: '6',
    title: 'Dinner',
    type: 'meal',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00.000Z', // Day after tomorrow
    time: '19:30',
    duration: 30,
    description: 'Light dinner with salad',
    location: 'Home',
    priority: 'medium',
    completed: false,
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  {
    _id: '7',
    title: 'Evening Medication',
    type: 'medication',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00.000Z', // Day after tomorrow
    time: '21:00',
    duration: 15,
    description: 'Take evening medication',
    location: 'Home',
    priority: 'high',
    completed: false,
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    _id: '8',
    title: 'Weekly Checkup',
    type: 'appointment',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00.000Z', // Next week
    time: '10:00',
    duration: 30,
    description: 'Weekly health checkup',
    location: 'Clinic',
    priority: 'medium',
    completed: false,
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  }
];

// Helper function to build DB query by date range
function filterEventsByDateRangeQuery(userId, startDate, endDate, extra = {}) {
  const query = { userId, ...extra };
  if (startDate && endDate) {
    query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  return query;
}

// Helper function to get upcoming events
async function getUpcomingEventsDb(userId, limit = 10) {
  const now = new Date();
  const today = new Date(now.toISOString().split('T')[0]);
  const events = await CalendarEvent.find({
    userId,
    date: { $gte: today },
    completed: false
  }).sort({ date: 1, time: 1 }).limit(limit);
  return events;
}

// Helper function to get calendar statistics
async function getCalendarStatsDb(userId) {
  const now = new Date();
  const today = new Date(now.toISOString().split('T')[0]);
  const events = await CalendarEvent.find({ userId });
  const totalEvents = events.length;
  const completedEvents = events.filter(event => event.completed).length;
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const eventDay = new Date(eventDate.toISOString().split('T')[0]);
    return eventDay >= today && !event.completed;
  }).length;
  const overdueEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const eventDay = new Date(eventDate.toISOString().split('T')[0]);
    return eventDay < today && !event.completed;
  }).length;
  const eventsByTypeMap = {};
  events.forEach(e => { eventsByTypeMap[e.type] = (eventsByTypeMap[e.type] || 0) + 1; });
  const eventsByPriorityMap = {};
  events.forEach(e => { eventsByPriorityMap[e.priority] = (eventsByPriorityMap[e.priority] || 0) + 1; });
  return {
    totalEvents,
    completedEvents,
    upcomingEvents,
    overdueEvents,
    eventsThisMonth: totalEvents,
    eventsByType: Object.entries(eventsByTypeMap).map(([type, count]) => ({ _id: type, count })),
    eventsByPriority: Object.entries(eventsByPriorityMap).map(([priority, count]) => ({ _id: priority, count })),
    completionRate: totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0
  };
}

// @route   GET /calendar/events
// @desc    Get all calendar events for a user
// @access  Public (temporary)
router.get('/events', auth, async (req, res) => {
  try {
    const { startDate, endDate, type, priority, completed } = req.query;
    const extra = {};
    if (type) extra.type = type;
    if (priority) extra.priority = priority;
    if (completed !== undefined) extra.completed = completed === 'true';
    const query = filterEventsByDateRangeQuery(req.user._id, startDate, endDate, extra);
    const events = await CalendarEvent.find(query).sort({ date: 1, time: 1 });
    res.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching calendar events',
      error: error.message
    });
  }
});

// Helper function to get overdue events
async function getOverdueEventsDb(userId) {
  const now = new Date();
  const today = new Date(now.toISOString().split('T')[0]);
  const events = await CalendarEvent.find({ userId, completed: false, date: { $lt: today } }).sort({ date: 1, time: 1 });
  return events;
}

// @route   GET /calendar/events/upcoming
// @desc    Get upcoming calendar events
// @access  Public (temporary)
router.get('/events/upcoming', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit);
    const upcomingEvents = await getUpcomingEventsDb(req.user._id, limitNum);
    res.json({
      success: true,
      data: upcomingEvents,
      count: upcomingEvents.length
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching upcoming events',
      error: error.message
    });
  }
});

// @route   GET /calendar/events/overdue
// @desc    Get overdue calendar events
// @access  Public (temporary)
router.get('/events/overdue', auth, async (req, res) => {
  try {
    const overdueEvents = await getOverdueEventsDb(req.user._id);
    res.json({
      success: true,
      data: overdueEvents,
      count: overdueEvents.length
    });
  } catch (error) {
    console.error('Error fetching overdue events:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching overdue events',
      error: error.message
    });
  }
});

// @route   GET /calendar/stats
// @desc    Get calendar statistics
// @access  Public (temporary)
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await getCalendarStatsDb(req.user._id);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching calendar stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching calendar statistics',
      error: error.message
    });
  }
});

// @route   GET /calendar/events/:id
// @desc    Get a specific calendar event
// @access  Public (temporary)
router.get('/events/:id', auth, async (req, res) => {
  try {
    const event = await CalendarEvent.findOne({ _id: req.params.id, userId: req.user._id });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching calendar event',
      error: error.message
    });
  }
});

// @route   POST /calendar/events
// @desc    Create a new calendar event
// @access  Public (temporary)
router.post('/events', auth, async (req, res) => {
  try {
    const {
      title,
      type,
      date,
      time,
      duration,
      description,
      location,
      priority,
      reminder
    } = req.body;
    
    // Validate required fields
    if (!title || !type || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Title, type, date, and time are required fields'
      });
    }
    
    const newEvent = await CalendarEvent.create({
      userId: req.user._id,
      title,
      type,
      date: new Date(date),
      time,
      duration: duration || 30,
      description: description || '',
      location: location || '',
      priority: priority || 'medium',
      reminder: reminder || '15',
      completed: false,
      color: getEventColor(type, priority || 'medium')
    });
    
    res.status(201).json({
      success: true,
      message: 'Calendar event created successfully',
      data: newEvent
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating calendar event',
      error: error.message
    });
  }
});

// @route   PUT /calendar/events/:id
// @desc    Update a calendar event
// @access  Public (temporary)
router.put('/events/:id', auth, async (req, res) => {
  try {
    const event = await CalendarEvent.findOne({ _id: req.params.id, userId: req.user._id });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }
    const {
      title,
      type,
      date,
      time,
      duration,
      description,
      location,
      priority,
      reminder,
      completed
    } = req.body;
    
    // Update fields
    if (title !== undefined) event.title = title;
    if (type !== undefined) event.type = type;
    if (date !== undefined) event.date = new Date(date);
    if (time) event.time = time;
    if (duration !== undefined) event.duration = duration;
    if (description !== undefined) event.description = description;
    if (location !== undefined) event.location = location;
    if (priority !== undefined) {
      event.priority = priority;
      event.color = getEventColor(event.type, priority);
    }
    if (reminder !== undefined) event.reminder = reminder;
    if (completed !== undefined) event.completed = completed;
    await event.save();
    
    res.json({
      success: true,
      message: 'Calendar event updated successfully',
      data: event
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating calendar event',
      error: error.message
    });
  }
});

// @route   DELETE /calendar/events/:id
// @desc    Delete a calendar event
// @access  Public (temporary)
router.delete('/events/:id', auth, async (req, res) => {
  try {
    const event = await CalendarEvent.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Calendar event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting calendar event',
      error: error.message
    });
  }
});

// @route   PATCH /calendar/events/:id/toggle-complete
// @desc    Toggle completion status of a calendar event
// @access  Public (temporary)
router.patch('/events/:id/toggle-complete', auth, async (req, res) => {
  try {
    const event = await CalendarEvent.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }
    
    event.completed = !event.completed;
    await event.save();
    
    res.json({
      success: true,
      message: `Event marked as ${event.completed ? 'completed' : 'incomplete'}`,
      data: event
    });
  } catch (error) {
    console.error('Error toggling event completion:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling event completion',
      error: error.message
    });
  }
});

// Helper function to get event color based on type and priority
function getEventColor(type, priority) {
  const colors = {
    meal: {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-orange-100 text-orange-700 border-orange-200',
      low: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    },
    medication: {
      high: 'bg-blue-100 text-blue-700 border-blue-200',
      medium: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      low: 'bg-purple-100 text-purple-700 border-purple-200'
    },
    appointment: {
      high: 'bg-purple-100 text-purple-700 border-purple-200',
      medium: 'bg-pink-100 text-pink-700 border-pink-200',
      low: 'bg-rose-100 text-rose-700 border-rose-200'
    },
    exercise: {
      high: 'bg-green-100 text-green-700 border-green-200',
      medium: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      low: 'bg-teal-100 text-teal-700 border-teal-200'
    }
  };
  
  return colors[type]?.[priority] || 'bg-gray-100 text-gray-700 border-gray-200';
}

module.exports = router;
