import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { 
  User,
  Search,
  Filter,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Download,
  RotateCcw,
  RefreshCw
} from 'lucide-react'
import ClinicalInsights from './ClinicalInsights'
import PatientTimeline from './PatientTimeline'

const Patients = () => {
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      // Fetch ALL patients from ALL appointment requests (sorted by request time)
      // Using very high limit to get ALL appointments
      const response = await axios.get('/doctor/patients?sort=date&limit=10000')
      if (response.data.success) {
        const allPatients = response.data.data || []
        setPatients(allPatients)
        console.log(`✅ Loaded ${allPatients.length} patients from ALL appointment requests`)
        console.log(`📊 Total appointments: ${allPatients.length}`)
        
        // Log status breakdown
        const statusCounts = allPatients.reduce((acc, p) => {
          const status = p.appointmentStatus?.toUpperCase() || 'UNKNOWN'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {})
        console.log(`📈 Status breakdown:`, statusCounts)
      } else {
        throw new Error('Failed to fetch patients')
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      // Fallback: try appointments endpoint
      try {
        const appointmentsResponse = await axios.get('/appointments/doctor/' + user?._id)
        if (appointmentsResponse.data.success) {
          // Convert appointments to patients format
          const appointments = appointmentsResponse.data.data || []
          const uniquePatients = new Map()
          appointments.forEach(apt => {
            if (apt.user && !uniquePatients.has(apt.user.email)) {
              uniquePatients.set(apt.user.email, {
                id: apt._id,
                appointmentId: apt._id,
                patientId: apt._id,
                name: apt.user.name,
                email: apt.user.email,
                phone: apt.user.phone,
                status: apt.status?.toLowerCase() || 'requested',
                appointmentStatus: apt.status,
                diagnosis: apt.reasonForVisit || 'Appointment Consultation',
                startDate: apt.date,
                appointmentDate: apt.date,
                consultationFee: apt.consultationFee || 0,
                appointmentType: apt.type || 'consultation',
                source: 'appointment'
              })
            }
          })
          setPatients(Array.from(uniquePatients.values()))
        }
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError)
        setPatients([])
      }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'discharged':
        return 'bg-blue-100 text-blue-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.wardNumber.includes(searchTerm) ||
                         patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-600 mt-1">
              All patients from appointment requests 
              <span className="ml-2 font-semibold text-blue-600">
                ({patients.length} total appointments • {filteredPatients.length} showing)
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => fetchPatients()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Reload appointments from history"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload
          </button>
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to reset? This will clear all filters and search, then reload all appointments from history.')) {
                // Clear filters and search
                setSearchTerm('')
                setFilterStatus('all')
                setSelectedPatient(null)
                setShowPatientModal(false)
                
                // Clear current list briefly, then refetch all data
                setPatients([])
                setLoading(true)
                console.log('✅ Reset: Filters cleared, reloading all appointments from history...')
                
                // Refetch all appointments data after a brief delay
                setTimeout(() => {
                  fetchPatients()
                }, 200)
              }
            }}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            title="Clear filters and reload all appointments"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            RESET
          </button>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search patients by name, email, appointment type, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="requested">REQUESTED</option>
            <option value="approved">APPROVED</option>
            <option value="paid">PAID</option>
            <option value="active">Active (Ward)</option>
          </select>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <div key={patient.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                  <p className="text-sm text-gray-600">
                    {(() => {
                      let genderText = 'N/A'
                      if (patient.gender) {
                        const g = patient.gender.toLowerCase()
                        if (g === 'male' || g === 'm') genderText = 'Male'
                        else if (g === 'female' || g === 'f') genderText = 'Female'
                        else if (g === 'other' || g === 'o') genderText = 'Other'
                        else if (g.includes('prefer') || g.includes('not') || g.includes('say')) genderText = 'Prefer not to say'
                        else genderText = patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1).toLowerCase()
                      }
                      return `${genderText}, ${patient.age}${patient.age !== 'N/A' ? ' Years' : ''}`
                    })()}
                  </p>
                  {patient.requestTime && (
                    <p className="text-xs text-gray-500 mt-1">
                      Request sent: {new Date(patient.requestTime || patient.requestDate).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(patient.priority)}`}>
                  {patient.priority.charAt(0).toUpperCase() + patient.priority.slice(1)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                  {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {patient.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {patient.email}
                </div>
              )}
              {patient.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {patient.phone}
                </div>
              )}
              {patient.appointmentDate && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Appointment: {new Date(patient.appointmentDate).toLocaleDateString()} {patient.startDate ? new Date(patient.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              )}
              {patient.requestTime && (
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-2" />
                  Request sent: {new Date(patient.requestTime || patient.requestDate).toLocaleString()}
                </div>
              )}
              {patient.appointmentStatus && (
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    patient.appointmentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                    patient.appointmentStatus === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                    patient.appointmentStatus === 'REQUESTED' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {patient.appointmentStatus}
                  </span>
                  {patient.appointmentType && (
                    <span className="ml-2 text-xs text-gray-500">• {patient.appointmentType}</span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Reason:</strong> {patient.diagnosis || patient.reasonForVisit || 'Appointment Consultation'}
              </p>
              {patient.consultationFee > 0 && (
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Fee:</strong> ₹{patient.consultationFee}
                </p>
              )}
              {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Medical History:</strong> {Array.isArray(patient.medicalHistory) ? patient.medicalHistory.join(', ') : 'N/A'}
                </p>
              )}
              {patient.allergies && patient.allergies.length > 0 && (
                <p className="text-sm text-red-600">
                  <strong>Allergies:</strong> {Array.isArray(patient.allergies) ? patient.allergies.join(', ') : 'None'}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setSelectedPatient(patient)
                  setShowPatientModal(true)
                }}
                className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </button>
              <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 text-sm">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Patient Details Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowPatientModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Patient Details - {selectedPatient.name}</h3>
                <button
                  onClick={() => {
                    setShowPatientModal(false)
                    setActiveTab('details')
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex space-x-2 mb-6 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'timeline'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setActiveTab('insights')}
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'insights'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Clinical Insights
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'details' && (
                <div>
                  <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Name:</span>
                      <p className="text-gray-900">{selectedPatient.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Age:</span>
                      <p className="text-gray-900">{selectedPatient.age} years</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Gender:</span>
                      <p className="text-gray-900">
                        {(() => {
                          if (!selectedPatient.gender) return 'N/A'
                          const g = selectedPatient.gender.toLowerCase()
                          if (g === 'male' || g === 'm') return 'Male'
                          if (g === 'female' || g === 'f') return 'Female'
                          if (g === 'other' || g === 'o') return 'Other'
                          if (g.includes('prefer') || g.includes('not') || g.includes('say')) return 'Prefer not to say'
                          return selectedPatient.gender.charAt(0).toUpperCase() + selectedPatient.gender.slice(1).toLowerCase()
                        })()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Phone:</span>
                      <p className="text-gray-900">{selectedPatient.phone}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Email:</span>
                      <p className="text-gray-900">{selectedPatient.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Medical Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Ward Number:</span>
                      <p className="text-gray-900">#{selectedPatient.wardNumber}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Diagnosis:</span>
                      <p className="text-gray-900">{selectedPatient.diagnosis}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Priority:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedPatient.priority)}`}>
                        {selectedPatient.priority.charAt(0).toUpperCase() + selectedPatient.priority.slice(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPatient.status)}`}>
                        {selectedPatient.status.charAt(0).toUpperCase() + selectedPatient.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Admitted:</span>
                      <p className="text-gray-900">{new Date(selectedPatient.startDate).toLocaleDateString()}</p>
                    </div>
                    {selectedPatient.endDate && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Discharged:</span>
                        <p className="text-gray-900">{new Date(selectedPatient.endDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Medical History & Allergies</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Medical History:</span>
                    <p className="text-gray-900 mt-1">
                          {selectedPatient.medicalHistory?.length > 0
                            ? selectedPatient.medicalHistory.join(', ')
                            : 'None'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Allergies:</span>
                    <p className="text-red-600 mt-1">
                          {selectedPatient.allergies?.length > 0
                            ? selectedPatient.allergies.join(', ')
                            : 'None'}
                    </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div>
                  <PatientTimeline patientId={selectedPatient.patientId || selectedPatient.id} />
                </div>
              )}

              {activeTab === 'insights' && (
                <div>
                  <ClinicalInsights patientId={selectedPatient.patientId || selectedPatient.id} />
              </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Patients
