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

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/doctor/dashboard')
      setDashboardData(response.data.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set mock data for demo
      setDashboardData({
        stats: {
          totalPatients: 56,
          availableBeds: 86,
          availableDoctors: 126,
          availableAmbulances: 32,
          todayAppointments: 12,
          completedAppointments: 8,
          pendingAppointments: 4
        },
        assignedPatients: [
          {
            id: 1,
            name: 'Adam Messy',
            age: 26,
            gender: 'male',
            wardNumber: '123456',
            priority: 'medium',
            startDate: '2023-06-03',
            diagnosis: 'Routine checkup'
          },
          {
            id: 2,
            name: 'Celine Aluista',
            age: 22,
            gender: 'female',
            wardNumber: '985746',
            priority: 'low',
            startDate: '2023-05-31',
            endDate: '2023-06-04',
            diagnosis: 'Post-surgery follow-up'
          },
          {
            id: 3,
            name: 'Malachi Ardo',
            age: 19,
            gender: 'male',
            wardNumber: '047638',
            priority: 'high',
            startDate: '2023-06-07',
            diagnosis: 'Emergency case'
          },
          {
            id: 4,
            name: 'Mathias Olivera',
            age: 24,
            gender: 'male',
            wardNumber: '248957',
            priority: 'medium',
            startDate: '2023-06-01',
            endDate: '2023-06-05',
            diagnosis: 'Treatment monitoring'
          }
        ]
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Beds Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Bed className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats?.availableBeds || 86}</div>
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
              <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats?.availableDoctors || 126}</div>
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
              <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats?.availableAmbulances || 32}</div>
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

        {/* Today's Appointments Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats?.todayAppointments || 12}</div>
              <div className="text-sm text-gray-600">Today's appointments</div>
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
              {dashboardData?.assignedPatients?.slice(0, 4).map((patient) => (
                <div key={patient.id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
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
                    <div className="text-sm text-gray-500">{patient.diagnosis}</div>
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
              ))}
            </div>
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
