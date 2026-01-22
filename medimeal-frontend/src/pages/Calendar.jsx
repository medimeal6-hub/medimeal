import React, { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, Circle, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import calendarService from '../services/calendarService';
import TimePicker from '../components/TimePicker';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  const { checkForEventNotifications, addNotification } = useNotifications();

  // Calendar navigation
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get calendar data
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await calendarService.getEventsByDateRange(
        startOfMonth.toISOString().split('T')[0],
        endOfMonth.toISOString().split('T')[0]
      );
      
      setEvents(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  // Fetch calendar statistics
  const fetchStats = async () => {
    try {
      const response = await calendarService.getCalendarStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching calendar stats:', err);
    }
  };

  // Fetch upcoming events
  const fetchUpcomingEvents = async () => {
    try {
      const response = await calendarService.getUpcomingEvents(5);
      setUpcomingEvents(response.data || []);
    } catch (err) {
      console.error('Error fetching upcoming events:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchStats();
    fetchUpcomingEvents();
  }, [currentDate]);

  // Calendar grid generation
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    if (!date) return [];
    
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  // Event type colors
  const getEventTypeColor = (type, priority) => {
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
  };

  // Toggle event completion
  const toggleEventComplete = async (eventId) => {
    try {
      await calendarService.toggleEventComplete(eventId);
      fetchEvents(); // Refresh events
    } catch (err) {
      console.error('Error toggling event completion:', err);
      setError('Failed to update event');
    }
  };

  // Delete event
  const deleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await calendarService.deleteEvent(eventId);
        fetchEvents(); // Refresh events
      } catch (err) {
        console.error('Error deleting event:', err);
        setError('Failed to delete event');
      }
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Calendar</h1>
            <p className="text-gray-300 text-lg">Manage your appointments, medications, and health activities</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Total Events</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalEvents}</p>
                <p className="text-xs text-blue-600 mt-1">All scheduled events</p>
              </div>
              <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <CalendarIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-900">{stats.completedEvents}</p>
                <p className="text-xs text-green-600 mt-1">Finished tasks</p>
              </div>
              <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-lg p-6 border border-orange-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-orange-900">{stats.upcomingEvents}</p>
                <p className="text-xs text-orange-600 mt-1">Pending events</p>
              </div>
              <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 mb-1">Completion Rate</p>
                <p className="text-3xl font-bold text-purple-900">{stats.completionRate}%</p>
                <p className="text-xs text-purple-600 mt-1">Success rate</p>
              </div>
              <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Circle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
          {/* Calendar Navigation */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-3 hover:bg-blue-100 rounded-xl transition-colors border border-gray-200 hover:border-blue-300"
              >
                <span className="text-xl font-bold text-gray-600">←</span>
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-3 hover:bg-blue-100 rounded-xl transition-colors border border-gray-200 hover:border-blue-300"
              >
                <span className="text-xl font-bold text-gray-600">→</span>
              </button>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={goToToday}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              Today
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 text-sm"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
            >
              <option value="all">All Types</option>
              <option value="meal">Meals</option>
              <option value="medication">Medications</option>
              <option value="appointment">Appointments</option>
              <option value="exercise">Exercise</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Add Event
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-lg mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
          {dayNames.map(day => (
            <div key={day} className="p-6 text-center font-bold text-gray-800 border-r last:border-r-0 text-lg">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-7 min-h-[600px]">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isToday = day && day.toDateString() === new Date().toDateString();
            const isCurrentMonth = day && day.getMonth() === currentDate.getMonth();

            return (
              <div
                key={index}
                className={`min-h-[140px] border-r border-b last:border-r-0 p-3 hover:bg-gray-50 transition-colors ${
                  !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                } ${isToday ? 'bg-blue-100 border-blue-300' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-lg font-bold mb-3 ${isToday ? 'text-blue-700' : 'text-gray-800'} ${
                      isToday ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center' : ''
                    }`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-2">
                      {dayEvents.slice(0, 4).map(event => (
                        <div
                          key={event._id}
                          className={`text-sm p-2 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 ${getEventTypeColor(event.type, event.priority)}`}
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEditModal(true);
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium truncate text-sm">{event.title}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleEventComplete(event._id);
                              }}
                              className="ml-2 hover:scale-110 transition-transform"
                            >
                              {event.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                          <div className="text-xs opacity-80 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                            {event.location && (
                              <>
                                <span className="mx-1">•</span>
                                <span className="truncate">{event.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      {dayEvents.length > 4 && (
                        <div className="text-xs text-blue-600 text-center font-medium bg-blue-50 rounded-lg p-2 hover:bg-blue-100 cursor-pointer">
                          +{dayEvents.length - 4} more events
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events Sidebar */}
      {upcomingEvents.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Upcoming Events</h3>
            <div className="ml-auto bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {upcomingEvents.length} events
            </div>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map(event => (
              <div
                key={event._id}
                className={`p-4 rounded-xl border-l-4 cursor-pointer hover:shadow-lg transition-all duration-200 ${getEventTypeColor(event.type, event.priority)}`}
                onClick={() => {
                  setSelectedEvent(event);
                  setShowEditModal(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
                    <div className="flex items-center gap-2 text-xs opacity-80 mb-1">
                      <CalendarIcon className="w-3 h-3" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs opacity-80">
                      <Clock className="w-3 h-3" />
                      <span>{event.time}</span>
                      {event.location && (
                        <>
                          <span className="mx-1">•</span>
                          <span className="truncate">{event.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleEventComplete(event._id);
                    }}
                    className="ml-3 hover:scale-110 transition-transform"
                  >
                    {event.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <AddEventModal
          onClose={() => setShowAddModal(false)}
          onEventAdded={fetchEvents}
        />
      )}

      {/* Edit Event Modal */}
      {showEditModal && selectedEvent && (
        <EditEventModal
          event={selectedEvent}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
          }}
          onEventUpdated={fetchEvents}
          onEventDeleted={deleteEvent}
        />
      )}
    </div>
  );
};

// Add Event Modal Component
const AddEventModal = ({ onClose, onEventAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'meal',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 30,
    description: '',
    location: '',
    priority: 'medium',
    reminder: '15'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addNotification } = useNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate that the date is not in the past
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError('Cannot create events in the past. Please select today or a future date.');
      setLoading(false);
      return;
    }

    try {
      const response = await calendarService.createEvent(formData);
      const newEvent = response.data;
      
      // Add notification for the created event
      const eventDate = new Date(formData.date);
      const today = new Date();
      const isToday = eventDate.toDateString() === today.toDateString();
      const isTomorrow = eventDate.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString();
      
      if (isToday) {
        addNotification({
          type: 'calendar_event',
          title: `Event Created: ${formData.title}`,
          message: `${formData.type} scheduled for today at ${formData.time}`,
          priority: formData.priority,
          eventId: newEvent._id,
          eventData: newEvent
        });
      } else if (isTomorrow) {
        addNotification({
          type: 'upcoming_event',
          title: `Event Scheduled: ${formData.title}`,
          message: `${formData.type} scheduled for tomorrow at ${formData.time}`,
          priority: formData.priority,
          eventId: newEvent._id,
          eventData: newEvent
        });
      }
      
      onEventAdded();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Add New Event</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="meal">Meal</option>
                <option value="medication">Medication</option>
                <option value="appointment">Appointment</option>
                <option value="exercise">Exercise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <TimePicker
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Event Modal Component
const EditEventModal = ({ event, onClose, onEventUpdated, onEventDeleted }) => {
  const [formData, setFormData] = useState({
    title: event.title,
    type: event.type,
    date: new Date(event.date).toISOString().split('T')[0],
    time: event.time,
    duration: event.duration,
    description: event.description || '',
    location: event.location || '',
    priority: event.priority,
    reminder: event.reminder
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await calendarService.updateEvent(event._id, formData);
      onEventUpdated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await onEventDeleted(event._id);
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to delete event');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Edit Event</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="meal">Meal</option>
                <option value="medication">Medication</option>
                <option value="appointment">Appointment</option>
                <option value="exercise">Exercise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <TimePicker
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Updating...' : 'Update Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Calendar;
