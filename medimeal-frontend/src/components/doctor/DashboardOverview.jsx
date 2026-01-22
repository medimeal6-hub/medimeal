import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
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
  Eye,
  TrendingUp,
  Activity,
  Users,
  Calendar as CalendarIcon,
  DollarSign
} from 'lucide-react'

const DashboardOverview = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alertsSummary, setAlertsSummary] = useState(null)

  useEffect(() => {
    fetchDashboardData()
    fetchAlertsSummary()
    
    // REAL-TIME: Auto-refresh dashboard every 30 seconds to show new appointments
    const intervalId = setInterval(() => {
      fetchDashboardData()
      fetchAlertsSummary()
    }, 30000) // 30 seconds = fast real-time updates
    
    return () => clearInterval(intervalId)
  }, [])

  const fetchAlertsSummary = async () => {
    try {
      const response = await axios.get('/doctor/alerts')
      setAlertsSummary(response.data.data.summary)
    } catch (error) {
      // Silently fail - alerts are optional
      console.error('Error fetching alerts summary:', error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/doctor/dashboard')
      if (response.data.success) {
        setDashboardData(response.data.data)
        console.log('✅ Dashboard data loaded:', {
          totalPatients: response.data.data?.stats?.totalPatients,
          assignedPatients: response.data.data?.assignedPatients?.length || 0
        })
      } else {
        throw new Error('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set fallback data structure
      setDashboardData({
        stats: {
          totalPatients: 0,
          todayAppointments: 0,
          completedAppointments: 0,
          pendingAppointments: 0
        },
        assignedPatients: []
      })
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const doctorName = user?.firstName ? `Dr. ${user.firstName}` : 'Dr. Andreas'
  const patientCount = dashboardData?.stats?.totalPatients || 56

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good Morning, {doctorName}!</h1>
          <p className="text-gray-600 mt-1">I hope you're in a good mood because there are {patientCount} patients waiting for you.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-600">
            <Bell className="w-5 h-5" />
            {alertsSummary && alertsSummary.high > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
            )}
            {alertsSummary && alertsSummary.total > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {alertsSummary.total > 9 ? '9+' : alertsSummary.total}
              </span>
            )}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Appointments Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats?.allAppointments || dashboardData?.stats?.todayAppointments || 12}</div>
              <div className="text-sm text-gray-600">Total Appointments</div>
              <div className="text-xs text-gray-500 mt-1">
                ({dashboardData?.stats?.todayAppointments || 0} today)
              </div>
            </div>
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded ${
                  i <= 5 ? 'bg-purple-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Alerts Summary Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">{alertsSummary?.high || 0}</div>
              <div className="text-sm text-gray-600">High Priority Alerts</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {alertsSummary?.total || 0} total alerts • {alertsSummary?.medium || 0} medium
          </div>
        </div>

        {/* Total Patients Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats?.totalPatients || 56}</div>
              <div className="text-sm text-gray-600">Total Patients</div>
            </div>
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
                <h2 className="text-lg font-semibold text-gray-900">Patient List</h2>
                <p className="text-sm text-gray-600">
                  {dashboardData?.assignedPatients?.length > 0 
                    ? `${dashboardData.assignedPatients.length} assigned patients`
                    : 'No patients assigned yet'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select className="text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Sort: Priority</option>
                  <option>Sort: A-Z</option>
                  <option>Sort: Date</option>
                </select>
                <button 
                  onClick={() => window.location.hash = '#patients'}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All
                </button>
              </div>
            </div>

            {dashboardData?.assignedPatients && dashboardData.assignedPatients.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dashboardData.assignedPatients.map((patient) => (
                  <div 
                    key={patient.id || patient.patientId} 
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                  >
                    {/* Patient Avatar */}
                    <div className="relative">
                      {patient.profilePicture ? (
                        <img 
                          src={patient.profilePicture} 
                          alt={patient.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {patient.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'PT'}
                          </span>
                        </div>
                      )}
                      {patient.priority === 'high' || patient.priority === 'critical' ? (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                      ) : null}
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-gray-900 text-base">{patient.name || 'Unknown Patient'}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPriorityColor(patient.priority)}`}>
                          {patient.priority ? patient.priority.charAt(0).toUpperCase() + patient.priority.slice(1) : 'Medium'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          <span className="font-medium">Age:</span> {patient.age || 'N/A'} {patient.gender ? `• ${(() => {
                            const g = patient.gender.toLowerCase()
                            if (g === 'male' || g === 'm') return 'Male'
                            if (g === 'female' || g === 'f') return 'Female'
                            if (g === 'other' || g === 'o') return 'Other'
                            if (g.includes('prefer') || g.includes('not') || g.includes('say')) return 'Prefer not to say'
                            return patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1).toLowerCase()
                          })()}` : ''}
                        </span>
                        {patient.wardNumber && (
                          <span>
                            <span className="font-medium">Ward:</span> #{patient.wardNumber}
                          </span>
                        )}
                      </div>
                      {patient.diagnosis && (
                        <div className="mt-1 text-sm text-gray-700">
                          <span className="font-medium">Reason:</span> <span className="text-gray-600">{patient.diagnosis}</span>
                        </div>
                      )}
                      {patient.appointmentStatus && (
                        <div className="mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            patient.appointmentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                            patient.appointmentStatus === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                            patient.appointmentStatus === 'REQUESTED' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {patient.appointmentStatus === 'PAID' ? '✓ Paid' :
                             patient.appointmentStatus === 'APPROVED' ? '⏳ Approved' :
                             patient.appointmentStatus === 'REQUESTED' ? '📋 Pending' :
                             patient.appointmentStatus}
                          </span>
                          {patient.appointmentType && (
                            <span className="ml-2 text-xs text-gray-500">• {patient.appointmentType}</span>
                          )}
                        </div>
                      )}
                      {patient.source === 'appointment' && patient.appointmentDate && (
                        <div className="mt-1 text-xs text-gray-500">
                          Appointment: {new Date(patient.appointmentDate).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      )}
                      {patient.startDate && (
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Start: {new Date(patient.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {patient.endDate && (
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              End: {new Date(patient.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Assigned</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Patients assigned to you will appear here
                </p>
                <button 
                  onClick={() => window.location.hash = '#patients'}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Patients →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Today's Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-medium text-green-600">{dashboardData?.stats?.completedAppointments || 8}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-medium text-yellow-600">{dashboardData?.stats?.pendingAppointments || 4}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-sm font-medium text-blue-600">{dashboardData?.stats?.todayAppointments || 12}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Completed patient checkup</span>
                <span className="text-xs text-gray-400">2 min ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">New patient assigned</span>
                <span className="text-xs text-gray-400">15 min ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Appointment scheduled</span>
                <span className="text-xs text-gray-400">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
