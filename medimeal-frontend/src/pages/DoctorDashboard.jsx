import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { 
  Bell, 
  Settings, 
  User, 
  Search,
  Calendar,
  Clock,
  Bed,
  Stethoscope,
  Truck,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  MoreVertical,
  Filter,
  Eye
} from 'lucide-react'

const DoctorDashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/doctor/dashboard')
      setDashboardData(response.data.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
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

  const getActivityColor = (activity) => {
    switch (activity) {
      case 'surgery':
        return 'bg-blue-500'
      case 'checkup':
        return 'bg-green-500'
      case 'lunch':
        return 'bg-red-500'
      case 'evaluation':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const doctorName = user?.firstName ? `Dr. ${user.firstName}` : 'Dr. Andreas'
  const patientCount = dashboardData?.stats?.totalPatients || 56

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Mediczen™</span>
            <ChevronLeft className="w-4 h-4 text-gray-400 ml-2" />
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">MAIN</div>
            
            <a href="#" className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg">
              <div className="w-5 h-5 mr-3">📊</div>
              Dashboard
            </a>
            
            <a href="#" className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <div className="w-5 h-5 mr-3">📅</div>
              Schedules
            </a>
            
            <a href="#" className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <div className="w-5 h-5 mr-3">👥</div>
              Patients
            </a>
            
            <a href="#" className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <div className="w-5 h-5 mr-3">📋</div>
              Appointments
            </a>
            
            <a href="#" className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <div className="w-5 h-5 mr-3">💰</div>
              Billing
            </a>

            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 mt-8">DATA VISUALIZATION</div>
            
            <a href="#" className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <div className="w-5 h-5 mr-3">📈</div>
              Echarts
            </a>
            
            <a href="#" className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <div className="w-5 h-5 mr-3">📊</div>
              Morris Charts
            </a>

            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 mt-8">SUPPORT</div>
            
            <a href="#" className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <div className="w-5 h-5 mr-3">❓</div>
              Help Center
            </a>
            
            <a href="#" className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <div className="w-5 h-5 mr-3">⚙️</div>
              Settings
            </a>
          </nav>

          {/* Working Track */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Working Track</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{getCurrentDateString()}</div>
                  <div className="text-xs text-gray-500">{getCurrentTime()}</div>
                </div>
                <button className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Good Morning, {doctorName}!</h1>
            <p className="text-gray-600 mt-1">I hope you're in a good mood because there are {patientCount} patients waiting for you.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Beds Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Bed className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">86</div>
                <div className="text-sm text-gray-600">Available hospital beds</div>
              </div>
            </div>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded ${
                    i === 7 ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Doctors Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">126</div>
                <div className="text-sm text-gray-600">Available doctors</div>
              </div>
            </div>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded ${
                    i === 7 ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Ambulance Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">32</div>
                <div className="text-sm text-gray-600">Available ambulance</div>
              </div>
            </div>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded ${
                    i === 7 ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Patient</h2>
                  <p className="text-sm text-gray-600">This is your several latest patient list</p>
                </div>
                <div className="flex items-center space-x-4">
                  <select className="text-sm text-gray-600 border-0 bg-transparent">
                    <option>Sort: A-Z</option>
                  </select>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-800">See All</a>
                </div>
              </div>

              <div className="space-y-4">
                {dashboardData?.assignedPatients?.slice(0, 4).map((patient, index) => (
                  <div key={patient.id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{patient.name}</h3>
                        <span className="text-sm text-gray-500">
                          {patient.gender === 'male' ? 'Male' : 'Female'}, {patient.age} Years
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">Ward No: #{patient.wardNumber}</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(patient.priority)}`}>
                        {patient.priority.charAt(0).toUpperCase() + patient.priority.slice(1)}
                      </span>
                      <div className="text-sm text-gray-600">
                        <div>Start Date: {new Date(patient.startDate).toLocaleDateString()}</div>
                        {patient.endDate && (
                          <div>End Date: {new Date(patient.endDate).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )) || (
                  // Sample data when no real data is available
                  <>
                    <div className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">Adam Messy</h3>
                          <span className="text-sm text-gray-500">Male, 26 Years</span>
                        </div>
                        <div className="text-sm text-gray-600">Ward No: #123456</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Medium
                        </span>
                        <div className="text-sm text-gray-600">
                          <div>Start Date: June 3, 2023</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">Celine Aluista</h3>
                          <span className="text-sm text-gray-500">Female, 22 Years</span>
                        </div>
                        <div className="text-sm text-gray-600">Ward No: #985746</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Low
                        </span>
                        <div className="text-sm text-gray-600">
                          <div>Start Date: May 31, 2023</div>
                          <div>End Date: June 4, 2023</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">Malachi Ardo</h3>
                          <span className="text-sm text-gray-500">Male, 19 Years</span>
                        </div>
                        <div className="text-sm text-gray-600">Ward No: #047638</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          High
                        </span>
                        <div className="text-sm text-gray-600">
                          <div>Start Date: June 7, 2023</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">Mathias Olivera</h3>
                          <span className="text-sm text-gray-500">Male, 24 Years</span>
                        </div>
                        <div className="text-sm text-gray-600">Ward No: #248957</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Medium
                        </span>
                        <div className="text-sm text-gray-600">
                          <div>Start Date: June 1, 2023</div>
                          <div>End Date: June 5, 2023</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">June 2023</h2>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600">
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
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Poynton</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Evaluation</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-xs">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                <div key={day} className="text-center py-2 text-gray-500 font-medium">
                  {day}
                </div>
              ))}
              
              {generateCalendarDays().map((day, index) => (
                <div
                  key={index}
                  className={`text-center py-2 ${
                    day === 8 ? 'bg-blue-500 text-white rounded-full' : 'text-gray-700'
                  }`}
                >
                  {day}
                  {day && [9, 12, 16, 19, 22, 25].includes(day) && (
                    <div className="flex justify-center mt-1">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        <div className="mt-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>
                <p className="text-sm text-gray-600">Take a look to your schedule for this month</p>
              </div>
              <select className="text-sm text-gray-600 border-0 bg-transparent">
                <option>January - February 2023</option>
              </select>
            </div>

            {/* Time Grid */}
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Time Header */}
                <div className="grid grid-cols-8 gap-4 mb-4">
                  <div className="text-sm font-medium text-gray-500">Time</div>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-sm font-medium text-gray-500 text-center">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                {[
                  { time: '09:00', activities: [
                    { day: 'Mon', title: 'Check up patient', type: 'checkup', start: '09:00', end: '11:00' },
                    { day: 'Tue', title: 'Check up patient', type: 'checkup', start: '09:00', end: '11:00' }
                  ]},
                  { time: '11:00', activities: [
                    { day: 'Mon', title: 'Lunch Break', type: 'lunch', start: '11:00', end: '12:00' },
                    { day: 'Tue', title: 'Lunch Break', type: 'lunch', start: '11:00', end: '12:00' }
                  ]},
                  { time: '12:00', activities: [
                    { day: 'Mon', title: 'Heart Surgery', type: 'surgery', start: '12:00', end: '16:00' },
                    { day: 'Tue', title: 'Evaluation', type: 'evaluation', start: '12:00', end: '14:00' }
                  ]}
                ].map((slot, index) => (
                  <div key={index} className="grid grid-cols-8 gap-4 mb-2">
                    <div className="text-sm text-gray-600 py-2">{slot.time}</div>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                      const activity = slot.activities.find(a => a.day === day)
                      return (
                        <div key={day} className="relative">
                          {activity && (
                            <div className={`${getActivityColor(activity.type)} text-white text-xs p-2 rounded`}>
                              {activity.title}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard


