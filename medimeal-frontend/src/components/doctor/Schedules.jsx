import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { 
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Filter,
  Search,
  User,
  MapPin,
  AlertCircle
} from 'lucide-react'

const Schedules = () => {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)

  useEffect(() => {
    fetchSchedules()
  }, [selectedMonth, selectedYear])

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`/api/doctor/schedules?month=${selectedMonth}&year=${selectedYear}`)
      setSchedules(response.data.data)
    } catch (error) {
      console.error('Error fetching schedules:', error)
      // Mock data for demo
      setSchedules([
        {
          id: 1,
          date: '2023-06-08',
          timeSlots: [
            {
              id: 1,
              startTime: '09:00',
              endTime: '11:00',
              activity: 'checkup',
              title: 'Check up patient',
              patientId: '123456',
              wardNumber: '#123456',
              priority: 'high',
              status: 'scheduled',
              description: 'Regular checkup for assigned patient'
            },
            {
              id: 2,
              startTime: '11:00',
              endTime: '12:00',
              activity: 'lunch',
              title: 'Lunch Break',
              status: 'scheduled',
              description: 'Lunch break'
            },
            {
              id: 3,
              startTime: '12:00',
              endTime: '16:00',
              activity: 'surgery',
              title: 'Heart Surgery',
              patientId: '123456',
              wardNumber: '#123456',
              priority: 'critical',
              status: 'scheduled',
              description: 'Scheduled heart surgery'
            }
          ]
        },
        {
          id: 2,
          date: '2023-06-09',
          timeSlots: [
            {
              id: 4,
              startTime: '08:00',
              endTime: '10:00',
              activity: 'evaluation',
              title: 'Neurological Evaluation',
              patientId: '047638',
              wardNumber: '#047638',
              priority: 'critical',
              status: 'scheduled',
              description: 'Comprehensive neurological evaluation'
            },
            {
              id: 5,
              startTime: '10:00',
              endTime: '12:00',
              activity: 'consultation',
              title: 'Patient Consultation',
              status: 'scheduled',
              description: 'General patient consultation'
            }
          ]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getActivityColor = (activity) => {
    switch (activity) {
      case 'surgery':
        return 'bg-blue-500'
      case 'checkup':
        return 'bg-green-500'
      case 'lunch':
        return 'bg-red-500'
      case 'evaluation':
        return 'bg-purple-500'
      case 'consultation':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const generateCalendarDays = () => {
    const year = selectedYear
    const month = selectedMonth
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  const getCurrentDateString = () => {
    const now = new Date()
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`
  }

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11)
        setSelectedYear(selectedYear - 1)
      } else {
        setSelectedMonth(selectedMonth - 1)
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0)
        setSelectedYear(selectedYear + 1)
      } else {
        setSelectedMonth(selectedMonth + 1)
      }
    }
  }

  const getSchedulesForDate = (day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return schedules.find(schedule => schedule.date === dateStr)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedules</h1>
          <p className="text-gray-600 mt-1">Manage your daily schedule and appointments</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Schedule
          </button>
        </div>
      </div>

      {/* Calendar and Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">{monthNames[selectedMonth]} {selectedYear}</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigateMonth('prev')}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigateMonth('next')}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Surgery</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Checkup</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Evaluation</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Break</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
              <div key={day} className="text-center py-2 text-gray-500 font-medium">
                {day}
              </div>
            ))}
            
            {generateCalendarDays().map((day, index) => {
              const daySchedules = getSchedulesForDate(day)
              const hasSchedules = daySchedules && daySchedules.timeSlots.length > 0
              
              return (
                <div
                  key={index}
                  className={`text-center py-2 cursor-pointer ${
                    day === selectedDate.getDate() && selectedMonth === selectedDate.getMonth() && selectedYear === selectedDate.getFullYear()
                      ? 'bg-blue-500 text-white rounded-full' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => day && setSelectedDate(new Date(selectedYear, selectedMonth, day))}
                >
                  {day}
                  {hasSchedules && (
                    <div className="flex justify-center mt-1 space-x-1">
                      {daySchedules.timeSlots.slice(0, 3).map((slot, slotIndex) => (
                        <div 
                          key={slotIndex}
                          className={`w-1 h-1 rounded-full ${getActivityColor(slot.activity)}`}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Schedule Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Schedule for {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h2>
                <p className="text-sm text-gray-600">Your daily schedule and appointments</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-4">
              {(() => {
                const daySchedules = getSchedulesForDate(selectedDate.getDate())
                if (!daySchedules || daySchedules.timeSlots.length === 0) {
                  return (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No schedules for this day</p>
                      <button 
                        onClick={() => setShowAddModal(true)}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                      >
                        Add a schedule
                      </button>
                    </div>
                  )
                }

                return daySchedules.timeSlots.map((slot) => (
                  <div key={slot.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${getActivityColor(slot.activity)}`}></div>
                        <div>
                          <h3 className="font-medium text-gray-900">{slot.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {slot.startTime} - {slot.endTime}
                            </div>
                            {slot.patientId && (
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                Patient #{slot.patientId}
                              </div>
                            )}
                            {slot.wardNumber && (
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {slot.wardNumber}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{slot.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {slot.priority && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(slot.priority)}`}>
                            {slot.priority.charAt(0).toUpperCase() + slot.priority.slice(1)}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          slot.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          slot.status === 'completed' ? 'bg-green-100 text-green-800' :
                          slot.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={() => {
                              setSelectedSchedule(slot)
                              setShowEditModal(true)
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Add Schedule</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter schedule title"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="checkup">Checkup</option>
                    <option value="surgery">Surgery</option>
                    <option value="evaluation">Evaluation</option>
                    <option value="consultation">Consultation</option>
                    <option value="lunch">Break</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter description"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Add Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Schedules
