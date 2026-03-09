import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { 
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Check,
  X,
  Eye,
  Stethoscope
} from 'lucide-react'

const Appointments = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (user?._id) {
      fetchAppointments()
      
      // REAL-TIME: Auto-refresh appointments every 15 seconds
      const intervalId = setInterval(() => {
        fetchAppointments()
      }, 15000) // 15 seconds = fast real-time updates
      
      return () => clearInterval(intervalId)
    }
  }, [user])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const doctorId = user?._id
      if (!doctorId) return

      // Use the new unified appointments endpoint
      const response = await axios.get(`/appointments/doctor/${doctorId}`)
      if (response.data.success) {
        const newAppointments = response.data.data || []
        console.log(`✅ Fetched ${newAppointments.length} total appointments`)
        
        // Log all appointments for debugging
        newAppointments.forEach((apt, index) => {
          console.log(`   Appointment ${index + 1}: ${apt.user?.name || 'Unknown'} - Status: ${apt.status}`)
        })
        
        setAppointments(newAppointments)
        
        // Log for debugging
        const requestedCount = newAppointments.filter(apt => apt.status?.toUpperCase() === 'REQUESTED').length
        const approvedCount = newAppointments.filter(apt => apt.status?.toUpperCase() === 'APPROVED').length
        const paidCount = newAppointments.filter(apt => apt.status?.toUpperCase() === 'PAID').length
        
        console.log(`📊 Status Summary: ${requestedCount} REQUESTED, ${approvedCount} APPROVED, ${paidCount} PAID`)
        
        if (requestedCount > 0) {
          console.log(`✅ Found ${requestedCount} REQUESTED appointment(s) - they should be visible!`)
        }
      } else {
        console.error('❌ API response not successful:', response.data)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      // Fallback to old endpoint
      try {
        const fallbackResponse = await axios.get('/doctor/appointments')
        if (fallbackResponse.data.success) {
          setAppointments(fallbackResponse.data.data || [])
        }
      } catch (fallbackError) {
        console.error('Fallback endpoint also failed:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailsModal(true)
  }

  const getStatusColor = (status) => {
    const statusUpper = status?.toUpperCase()
    switch (statusUpper) {
      case 'REQUESTED': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-blue-100 text-blue-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'PAID': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    const statusUpper = status?.toUpperCase()
    switch (statusUpper) {
      case 'REQUESTED': return 'Waiting for Approval'
      case 'APPROVED': return 'Approved'
      case 'REJECTED': return 'Rejected'
      case 'PAID': return 'Paid & Confirmed'
      default: return status || 'Unknown'
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = filterStatus === 'all' || apt.status?.toUpperCase() === filterStatus.toUpperCase()
    const matchesSearch = !searchTerm || 
      apt.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.type?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Requests</h1>
          <p className="text-gray-600 mt-1">
            Manage appointment requests from patients
            <span className="ml-2 text-xs text-blue-600">(Auto-refreshing every 15s)</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Total: <span className="font-semibold">{appointments.length}</span> appointment{appointments.length !== 1 ? 's' : ''} • 
            REQUESTED: <span className="font-semibold text-yellow-600">{appointments.filter(a => a.status?.toUpperCase() === 'REQUESTED').length}</span> • 
            APPROVED: <span className="font-semibold text-blue-600">{appointments.filter(a => a.status?.toUpperCase() === 'APPROVED').length}</span> • 
            PAID: <span className="font-semibold text-green-600">{appointments.filter(a => a.status?.toUpperCase() === 'PAID').length}</span>
          </p>
        </div>
        <button
          onClick={fetchAppointments}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Clock className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError('')}>
            <XCircle className="h-5 w-5 text-red-500 cursor-pointer" />
          </span>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> {successMessage}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setSuccessMessage('')}>
            <CheckCircle className="h-5 w-5 text-green-500 cursor-pointer" />
          </span>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by patient name, email, or appointment type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            {['all', 'REQUESTED', 'APPROVED'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="grid gap-4">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointment requests found</h3>
            <p className="text-gray-600">Appointment requests from patients will appear here</p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{appointment.user?.name || 'Unknown Patient'}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{appointment.user?.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{appointment.user?.phone || 'N/A'}</span>
                    </div>
                    {appointment.user?.age && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Age: {typeof appointment.user.age === 'number' ? appointment.user.age : parseInt(appointment.user.age)} years</span>
                      </div>
                    )}
                    {appointment.user?.gender && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span>Gender: {appointment.user.gender}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{appointment.date || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{appointment.time || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <AlertCircle className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{appointment.type || 'N/A'}</span>
                    </div>
                    {appointment.consultationFee && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Fee: ₹{appointment.consultationFee}</span>
                      </div>
                    )}
                    {/* Payment Status Badge - Read-only for doctors */}
                    <div className="flex items-center text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status?.toUpperCase() === 'PAID' 
                          ? 'bg-green-100 text-green-800' 
                          : appointment.status?.toUpperCase() === 'APPROVED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status?.toUpperCase() === 'PAID' ? '💳 PAID' : 
                         appointment.status?.toUpperCase() === 'APPROVED' ? '⏳ Payment Pending' :
                         '📋 Payment Status'}
                      </span>
                    </div>
                  </div>
                  
                  {appointment.reasonForVisit && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Reason:</span> {appointment.reasonForVisit}
                      </p>
                    </div>
                  )}
                  {appointment.assignedDoctor && (
                    <div className="mt-3 flex items-center text-sm text-gray-600">
                      <Stethoscope className="h-4 w-4 mr-2 text-blue-500" />
                      <span>
                        <span className="font-medium">Assigned Doctor:</span> {appointment.assignedDoctor.name}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => handleViewDetails(appointment)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Appointment Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Patient Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedAppointment.user?.name || 'N/A'}</p>
                    <p><span className="font-medium">Email:</span> {selectedAppointment.user?.email || 'N/A'}</p>
                    <p><span className="font-medium">Phone:</span> {selectedAppointment.user?.phone || 'N/A'}</p>
                    {selectedAppointment.user?.age && (
                      <p><span className="font-medium">Age:</span> {typeof selectedAppointment.user.age === 'number' ? selectedAppointment.user.age : parseInt(selectedAppointment.user.age)} years</p>
                    )}
                    {selectedAppointment.user?.gender && (
                      <p><span className="font-medium">Gender:</span> {selectedAppointment.user.gender}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Appointment Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Date:</span> {selectedAppointment.date || 'N/A'}</p>
                    <p><span className="font-medium">Time:</span> {selectedAppointment.time || 'N/A'}</p>
                    <p><span className="font-medium">Type:</span> {selectedAppointment.type || 'N/A'}</p>
                    <p><span className="font-medium">Status:</span> <span className={getStatusColor(selectedAppointment.status)}>{getStatusLabel(selectedAppointment.status)}</span></p>
                    {selectedAppointment.consultationFee && (
                      <p><span className="font-medium">Consultation Fee:</span> ₹{selectedAppointment.consultationFee}</p>
                    )}
                  </div>
                </div>
                
                {selectedAppointment.reasonForVisit && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Reason for Visit</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p>{selectedAppointment.reasonForVisit}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Appointments
