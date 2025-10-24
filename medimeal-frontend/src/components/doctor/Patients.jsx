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
  Download
} from 'lucide-react'

const Patients = () => {
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPatientModal, setShowPatientModal] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/doctor/patients')
      setPatients(response.data.data)
    } catch (error) {
      console.error('Error fetching patients:', error)
      // Mock data
      setPatients([
        {
          id: 1,
          name: 'Adam Messy',
          age: 26,
          gender: 'male',
          email: 'adam.messy@email.com',
          phone: '+1234567890',
          wardNumber: '123456',
          priority: 'medium',
          status: 'active',
          diagnosis: 'Routine checkup',
          startDate: '2023-06-03',
          endDate: null,
          medicalHistory: ['Hypertension', 'Diabetes'],
          allergies: ['Penicillin'],
          assignedBy: 'Admin User'
        },
        {
          id: 2,
          name: 'Celine Aluista',
          age: 22,
          gender: 'female',
          email: 'celine.aluista@email.com',
          phone: '+1234567891',
          wardNumber: '985746',
          priority: 'low',
          status: 'discharged',
          diagnosis: 'Post-surgery follow-up',
          startDate: '2023-05-31',
          endDate: '2023-06-04',
          medicalHistory: ['Asthma'],
          allergies: ['Shellfish'],
          assignedBy: 'Admin User'
        },
        {
          id: 3,
          name: 'Malachi Ardo',
          age: 19,
          gender: 'male',
          email: 'malachi.ardo@email.com',
          phone: '+1234567892',
          wardNumber: '047638',
          priority: 'high',
          status: 'active',
          diagnosis: 'Emergency case',
          startDate: '2023-06-07',
          endDate: null,
          medicalHistory: ['Heart Disease'],
          allergies: [],
          assignedBy: 'Admin User'
        },
        {
          id: 4,
          name: 'Mathias Olivera',
          age: 24,
          gender: 'male',
          email: 'mathias.olivera@email.com',
          phone: '+1234567893',
          wardNumber: '248957',
          priority: 'medium',
          status: 'active',
          diagnosis: 'Treatment monitoring',
          startDate: '2023-06-01',
          endDate: null,
          medicalHistory: ['Diabetes'],
          allergies: ['Latex'],
          assignedBy: 'Admin User'
        }
      ])
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
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">Manage your assigned patients and their information</p>
        </div>
        <div className="flex items-center space-x-4">
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
              placeholder="Search patients by name, ward number, or diagnosis..."
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
            <option value="active">Active</option>
            <option value="discharged">Discharged</option>
            <option value="critical">Critical</option>
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
                    {patient.gender === 'male' ? 'Male' : 'Female'}, {patient.age} Years
                  </p>
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
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                Ward #{patient.wardNumber}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {patient.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {patient.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                Admitted: {new Date(patient.startDate).toLocaleDateString()}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Diagnosis:</strong> {patient.diagnosis}
              </p>
              {patient.medicalHistory.length > 0 && (
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Medical History:</strong> {patient.medicalHistory.join(', ')}
                </p>
              )}
              {patient.allergies.length > 0 && (
                <p className="text-sm text-red-600">
                  <strong>Allergies:</strong> {patient.allergies.join(', ')}
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
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Patient Details</h3>
                <button
                  onClick={() => setShowPatientModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
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
                      <p className="text-gray-900">{selectedPatient.gender === 'male' ? 'Male' : 'Female'}</p>
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
                      {selectedPatient.medicalHistory.length > 0 ? selectedPatient.medicalHistory.join(', ') : 'None'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Allergies:</span>
                    <p className="text-red-600 mt-1">
                      {selectedPatient.allergies.length > 0 ? selectedPatient.allergies.join(', ') : 'None'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Patients
