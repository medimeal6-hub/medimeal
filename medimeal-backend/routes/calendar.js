const express = require('express');
const router = express.Router();

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

// Helper function to filter events by date range
function filterEventsByDateRange(events, startDate, endDate) {
  if (!startDate || !endDate) return events;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= start && eventDate <= end;
  });
}

// Helper function to get upcoming events
function getUpcomingEvents(events, limit = 10) {
  const now = new Date();
  
  return events
    .filter(event => {
      // Parse the date part (without time) and compare with today
      const eventDate = new Date(event.date.split('T')[0]);
      const today = new Date(now.toISOString().split('T')[0]);
      
      // Event is upcoming if it's today or in the future and not completed
      return eventDate >= today && !event.completed;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.time);
      const dateB = new Date(b.date + 'T' + b.time);
      return dateA - dateB;
    })
    .slice(0, limit);
}

// Helper function to get calendar statistics
function getCalendarStats(events) {
  const now = new Date();
  const today = new Date(now.toISOString().split('T')[0]);
  const totalEvents = events.length;
  const completedEvents = events.filter(event => event.completed).length;
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date.split('T')[0]);
    return eventDate >= today && !event.completed;
  }).length;
  const overdueEvents = events.filter(event => {
    const eventDate = new Date(event.date.split('T')[0]);
    return eventDate < today && !event.completed;
  }).length;
  
  // Group by type
  const eventsByType = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {});
  
  // Group by priority
  const eventsByPriority = events.reduce((acc, event) => {
    acc[event.priority] = (acc[event.priority] || 0) + 1;
    return acc;
  }, {});
  
  return {
    totalEvents,
    completedEvents,
    upcomingEvents,
    overdueEvents,
    eventsThisMonth: totalEvents,
    eventsByType: Object.entries(eventsByType).map(([type, count]) => ({ _id: type, count })),
    eventsByPriority: Object.entries(eventsByPriority).map(([priority, count]) => ({ _id: priority, count })),
    completionRate: totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0
  };
}

// @route   GET /calendar/events
// @desc    Get all calendar events for a user
// @access  Public (temporary)
router.get('/events', async (req, res) => {
  try {
    const { startDate, endDate, type, priority, completed } = req.query;
    
    let filteredEvents = [...mockEvents];
    
    // Filter by date range
    if (startDate && endDate) {
      filteredEvents = filterEventsByDateRange(filteredEvents, startDate, endDate);
    }
    
    // Filter by type
    if (type) {
      filteredEvents = filteredEvents.filter(event => event.type === type);
    }
    
    // Filter by priority
    if (priority) {
      filteredEvents = filteredEvents.filter(event => event.priority === priority);
    }
    
    // Filter by completion status
    if (completed !== undefined) {
      const isCompleted = completed === 'true';
      filteredEvents = filteredEvents.filter(event => event.completed === isCompleted);
    }
    
    res.json({
      success: true,
      data: filteredEvents,
      count: filteredEvents.length
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

// @route   GET /calendar/events/upcoming
// @desc    Get upcoming calendar events
// @access  Public (temporary)
router.get('/events/upcoming', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit);
    
    const upcomingEvents = getUpcomingEvents(mockEvents, limitNum);
    
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

// @route   GET /calendar/stats
// @desc    Get calendar statistics
// @access  Public (temporary)
router.get('/stats', async (req, res) => {
  try {
    const stats = getCalendarStats(mockEvents);
    
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
router.get('/events/:id', async (req, res) => {
  try {
    const event = mockEvents.find(e => e._id === req.params.id);
    
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
router.post('/events', async (req, res) => {
  try {
    const {
      title,
      type,
      date,
      time,
      duration,
      description,
      location,
      priority
    } = req.body;
    
    // Validate required fields
    if (!title || !type || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Title, type, date, and time are required fields'
      });
    }
    
    // Create new event
    const newEvent = {
      _id: (mockEvents.length + 1).toString(),
      title,
      type,
      date: new Date(date).toISOString(),
      time,
      duration: duration || 30,
      description: description || '',
      location: location || '',
      priority: priority || 'medium',
      completed: false,
      color: getEventColor(type, priority || 'medium')
    };
    
    mockEvents.push(newEvent);
    
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
router.put('/events/:id', async (req, res) => {
  try {
    const eventIndex = mockEvents.findIndex(e => e._id === req.params.id);
    
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }
    
    const event = mockEvents[eventIndex];
    const {
      title,
      type,
      date,
      time,
      duration,
      description,
      location,
      priority
    } = req.body;
    
    // Update fields
    if (title) event.title = title;
    if (type) event.type = type;
    if (date) event.date = new Date(date).toISOString();
    if (time) event.time = time;
    if (duration) event.duration = duration;
    if (description !== undefined) event.description = description;
    if (location !== undefined) event.location = location;
    if (priority) {
      event.priority = priority;
      event.color = getEventColor(type || event.type, priority);
    }
    
    mockEvents[eventIndex] = event;
    
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
router.delete('/events/:id', async (req, res) => {
  try {
    const eventIndex = mockEvents.findIndex(e => e._id === req.params.id);
    
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }
    
    mockEvents.splice(eventIndex, 1);
    
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
router.patch('/events/:id/toggle-complete', async (req, res) => {
  try {
    const event = mockEvents.find(e => e._id === req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }
    
    event.completed = !event.completed;
    
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