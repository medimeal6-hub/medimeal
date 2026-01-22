import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Calendar, 
  Activity, 
  Utensils, 
  Pill, 
  FileText, 
  AlertTriangle,
  Clock, 
  Search, 
  User,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Table,
  List,
  Grid3x3
} from 'lucide-react'

const PatientTimeline = ({ patientId: propPatientId }) => {
  const [selectedPatientId, setSelectedPatientId] = useState(propPatientId)
  const [patients, setPatients] = useState([])
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [expandedEvents, setExpandedEvents] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grouped') // 'table', 'compact', 'grouped'

  const getInitials = (name) => {
    if (!name) return 'PT'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  // Deduplicate patients by ID before filtering
  const uniquePatients = patients.reduce((acc, patient) => {
    const patientId = patient.patientId || patient.id
    if (patientId && !acc.find(p => (p.patientId || p.id) === patientId)) {
      acc.push(patient)
    }
    return acc
  }, [])

  const filteredPatients = uniquePatients.filter(patient => {
    const name = patient.name?.toLowerCase() || ''
    const email = patient.email?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()
    return name.includes(search) || email.includes(search)
  })

  useEffect(() => {
    if (!propPatientId) {
      fetchPatients()
    }
  }, [propPatientId])

  useEffect(() => {
    if (selectedPatientId) {
      fetchTimeline()
    }
  }, [selectedPatientId])

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/doctor/patients?limit=100')
      setPatients(response.data.data || [])
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const fetchTimeline = async () => {
    if (!selectedPatientId) return
    setLoading(true)
    try {
      const response = await axios.get(`/doctor/patients/${selectedPatientId}/timeline`)
      if (response.data.success && response.data.data.timeline) {
        // Transform timeline events to frontend format
        const events = response.data.data.timeline.map(event => {
          let title = '';
          let description = '';
          let createdBy = 'System';
          
          switch (event.type) {
            case 'appointment':
              title = event.title || 'Appointment';
              description = event.notes || event.description || 'Appointment event';
              createdBy = event.provider?.name || 'System';
              break;
            case 'symptom':
              title = event.name || 'Symptom Recorded';
              description = event.description || `Symptom: ${event.name}`;
              createdBy = 'Patient';
              break;
            case 'vital':
              title = `${event.metric || 'Vital'} Reading`;
              description = event.values ? JSON.stringify(event.values) : 'Vital sign recorded';
              createdBy = 'System';
              break;
            case 'diet-plan':
              title = `Diet Plan: ${event.planName || 'Food Plan'}`;
              description = event.isActive ? 'Active diet plan' : 'Diet plan assigned';
              createdBy = 'Doctor';
              break;
            case 'lab-report':
              title = event.title || 'Lab Report';
              description = `${event.typeLabel || 'Lab'} - ${event.laboratoryName || 'Laboratory'}`;
              createdBy = 'Lab';
              break;
            default:
              title = event.title || 'Event';
              description = event.description || '';
              createdBy = 'System';
          }
          
          return {
            id: event.id || event._id,
            type: event.type,
            date: event.at || event.date || event.createdAt || new Date(),
            title,
            description,
            createdBy,
            status: event.status,
            details: event
          };
        });
        
        // Sort by date (latest first)
        events.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTimeline(events);
      }
    } catch (error) {
      console.error('Error fetching timeline:', error)
      setTimeline([])
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (eventId) => {
    const newExpanded = new Set(expandedEvents)
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId)
    } else {
      newExpanded.add(eventId)
    }
    setExpandedEvents(newExpanded)
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-600" />
      case 'symptom':
        return <Activity className="w-5 h-5 text-red-600" />
      case 'vital':
        return <Activity className="w-5 h-5 text-green-600" />
      case 'diet-plan':
        return <Utensils className="w-5 h-5 text-purple-600" />
      case 'medicine':
      case 'medication':
        return <Pill className="w-5 h-5 text-orange-600" />
      case 'lab-report':
        return <FileText className="w-5 h-5 text-indigo-600" />
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-50 border-blue-300 text-blue-900'
      case 'symptom':
        return 'bg-red-50 border-red-300 text-red-900'
      case 'vital':
        return 'bg-green-50 border-green-300 text-green-900'
      case 'diet-plan':
        return 'bg-purple-50 border-purple-300 text-purple-900'
      case 'medicine':
      case 'medication':
        return 'bg-orange-50 border-orange-300 text-orange-900'
      case 'lab-report':
        return 'bg-indigo-50 border-indigo-300 text-indigo-900'
      case 'alert':
        return 'bg-yellow-50 border-yellow-300 text-yellow-900'
      default:
        return 'bg-gray-50 border-gray-300 text-gray-900'
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'appointment':
        return 'Appointment'
      case 'symptom':
        return 'Symptom'
      case 'vital':
        return 'Vital Sign'
      case 'diet-plan':
        return 'Diet Plan'
      case 'medicine':
      case 'medication':
        return 'Medicine'
      case 'lab-report':
        return 'Lab Report'
      case 'alert':
        return 'Alert'
      default:
        return 'Event'
    }
  }

  const filteredTimeline = filterType === 'all' 
    ? timeline 
    : timeline.filter(event => event.type === filterType)

  // Group timeline events by date for grouped view (ensure it's always defined)
  const groupedByDate = filteredTimeline.reduce((groups, event) => {
    if (event && event.date) {
      const date = new Date(event.date)
      if (!isNaN(date.getTime())) {
        const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD format
        if (!groups[dateKey]) {
          groups[dateKey] = []
        }
        groups[dateKey].push(event)
      }
    }
    return groups
  }, {})

  // Format date header
  const formatDateHeader = (dateKey) => {
    const date = new Date(dateKey)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const dateStr = date.toISOString().split('T')[0]
    const todayStr = today.toISOString().split('T')[0]
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    if (dateStr === todayStr) return 'Today'
    if (dateStr === yesterdayStr) return 'Yesterday'
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  // Patient Selection UI
  if (!propPatientId && !selectedPatientId) {
    return (
      <div className="space-y-6">
        {/* Structured Header Format */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-teal-200 p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            {/* Left Section - Title & Icon */}
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-1">Patient Timeline</h2>
                <p className="text-sm text-gray-600 font-medium">Complete Medical History Timeline</p>
              </div>
            </div>
            
            {/* Right Section - Stats/Badge */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Patients</p>
                <p className="text-2xl font-bold text-teal-600">{filteredPatients.length}</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center border-2 border-teal-300">
                <User className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </div>
          
          {/* Description Section */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border-l-4 border-teal-500">
            <p className="text-sm text-gray-700 font-medium leading-relaxed">
              <span className="font-semibold text-teal-700">Select a patient</span> to explore their complete medical journey with a chronological view of all appointments, treatments, medications, and health events
            </p>
          </div>
        </div>

        {/* Search Section - Different Style */}
        <div className="bg-gradient-to-br from-white to-teal-50/30 rounded-2xl shadow-md p-6 border-2 border-teal-100">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-cyan-500/5 rounded-xl"></div>
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-teal-500 w-5 h-5 z-10" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search patients by name or email..."
              className="relative w-full pl-14 pr-4 py-3.5 border-2 border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all bg-white/80 backdrop-blur-sm"
            />
          </div>

          {/* Patient Count - Different Style */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-semibold text-teal-700">
                {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'} available
              </p>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-sm text-teal-600 hover:text-teal-800 font-semibold hover:underline"
              >
                Clear search
              </button>
            )}
          </div>

          {/* Patient Cards Grid - Varied Styles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[600px] overflow-y-auto pr-2">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient, index) => {
                // Create variety: Different card styles based on index
                const cardStyle = index % 4; // 4 different styles
                const isWide = index % 7 === 0; // Every 7th card is wide
                const isHighlighted = index % 6 === 0; // Every 6th card is highlighted
                // Make key unique by combining patientId with index
                const uniqueKey = `${patient.patientId || patient.id}-${index}`
                
                // Style 1: Standard card with top accent
                if (cardStyle === 0) {
                  return (
                    <button
                      key={uniqueKey}
                      onClick={() => setSelectedPatientId(patient.patientId || patient.id)}
                      className={`group relative bg-white border-2 border-teal-200 rounded-2xl p-6 hover:border-teal-400 hover:shadow-xl transition-all duration-300 text-left overflow-hidden ${isWide && index < 7 ? 'md:col-span-2' : ''}`}
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400"></div>
                      <div className="flex items-start space-x-4 mb-4 mt-2">
                        {patient.profilePicture ? (
                          <img src={patient.profilePicture} alt={patient.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-200 shadow-md" />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-extrabold text-xl">{getInitials(patient.name)}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-teal-600 transition-colors truncate">{patient.name || 'Unknown Patient'}</h3>
                          <div className="flex items-center text-sm text-gray-600 mb-2 bg-teal-50 px-2 py-1 rounded-lg w-fit">
                            <User className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                            <span className="text-xs font-medium truncate">{patient.email || 'No email'}</span>
                          </div>
                          {patient.age && patient.age !== 'N/A' ? (
                            <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-lg inline-block">Age: {typeof patient.age === 'number' ? patient.age : parseInt(patient.age)} years</span>
                          ) : (
                            <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg inline-block">Age: Not available</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t-2 border-teal-100">
                        <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">View →</span>
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </button>
                  )
                }
                
                // Style 2: Card with left border accent
                if (cardStyle === 1) {
                  return (
                    <button
                      key={uniqueKey}
                      onClick={() => setSelectedPatientId(patient.patientId || patient.id)}
                      className={`group relative bg-gradient-to-br from-white to-teal-50/30 border-l-4 border-teal-400 rounded-xl p-5 hover:shadow-xl transition-all duration-300 text-left ${isHighlighted ? 'ring-2 ring-teal-300' : ''}`}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        {patient.profilePicture ? (
                          <img src={patient.profilePicture} alt={patient.name} className="w-14 h-14 rounded-full object-cover border-2 border-teal-300 shadow-md" />
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">{getInitials(patient.name)}</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-extrabold text-gray-900 text-base mb-1 group-hover:text-teal-700 truncate">{patient.name || 'Unknown Patient'}</h3>
                          <p className="text-xs text-gray-600 truncate">{patient.email || 'No email'}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        {patient.age && patient.age !== 'N/A' ? (
                          <span className="text-xs font-bold text-teal-700 bg-teal-100 px-3 py-1.5 rounded-full">{typeof patient.age === 'number' ? patient.age : parseInt(patient.age)} years</span>
                        ) : (
                          <span className="text-xs text-gray-500">Age: N/A</span>
                        )}
                        <Clock className="w-5 h-5 text-teal-500" />
                      </div>
                    </button>
                  )
                }
                
                // Style 3: Minimalist card with icon
                if (cardStyle === 2) {
                  return (
                    <button
                      key={uniqueKey}
                      onClick={() => setSelectedPatientId(patient.patientId || patient.id)}
                      className="group relative bg-white border-2 border-cyan-200 rounded-3xl p-6 hover:border-cyan-400 hover:shadow-2xl transition-all duration-300 text-left"
                    >
                      <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                        <Clock className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div className="mb-4">
                        {patient.profilePicture ? (
                          <img src={patient.profilePicture} alt={patient.name} className="w-20 h-20 rounded-3xl object-cover border-4 border-cyan-200 shadow-lg mb-3" />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-lg mb-3">
                            <span className="text-white font-extrabold text-2xl">{getInitials(patient.name)}</span>
                          </div>
                        )}
                        <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-cyan-600 truncate">{patient.name || 'Unknown Patient'}</h3>
                        <p className="text-sm text-gray-600 mb-3 flex items-center">
                          <User className="w-4 h-4 mr-2 text-cyan-600" />
                          <span className="truncate">{patient.email || 'No email'}</span>
                        </p>
                        {patient.age && patient.age !== 'N/A' && (
                          <div className="inline-block px-4 py-2 bg-cyan-100 rounded-full">
                            <span className="text-sm font-bold text-cyan-800">Age: {typeof patient.age === 'number' ? patient.age : parseInt(patient.age)}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                }
                
                // Style 4: Side-by-side layout card
                return (
                  <button
                    key={uniqueKey}
                    onClick={() => setSelectedPatientId(patient.patientId || patient.id)}
                    className="group relative bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-300 rounded-xl p-5 hover:shadow-xl transition-all duration-300 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        {patient.profilePicture ? (
                          <img src={patient.profilePicture} alt={patient.name} className="w-12 h-12 rounded-xl object-cover border-2 border-teal-300" />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-sm">{getInitials(patient.name)}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-teal-700 truncate">{patient.name || 'Unknown Patient'}</h3>
                          <p className="text-xs text-gray-600 truncate mb-1">{patient.email || 'No email'}</p>
                          {patient.age && patient.age !== 'N/A' && (
                            <span className="text-xs font-semibold text-teal-700 mt-1 inline-block">Age: {typeof patient.age === 'number' ? patient.age : parseInt(patient.age)}</span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="col-span-full bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">No patients found</p>
                <p className="text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms' : 'No patients available at this time'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient timeline...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Structured Header Format */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-teal-200 p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          {/* Left Section - Title & Icon */}
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Patient Timeline</h1>
              <p className="text-sm text-gray-600 font-medium">Chronological Medical History & Audit Trail</p>
            </div>
          </div>
          
          {/* Right Section - Stats & Actions */}
          <div className="flex items-center space-x-4">
            {filteredTimeline.length > 0 && (
              <div className="text-right mr-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Events</p>
                <p className="text-2xl font-bold text-teal-600">{filteredTimeline.length}</p>
              </div>
            )}
            {!propPatientId && selectedPatientId && (
              <button
                onClick={() => {
                  setSelectedPatientId(null)
                  setTimeline([])
                }}
                className="px-5 py-2.5 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded-xl transition-all font-semibold shadow-md hover:shadow-lg"
              >
                ← Change Patient
              </button>
            )}
          </div>
        </div>
        
        {/* Status Bar */}
        {selectedPatientId && (
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border-l-4 border-teal-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-gray-700 font-medium">
                  Viewing timeline for selected patient
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-teal-700 bg-white px-3 py-1.5 rounded-lg border border-teal-200">
                  {filterType !== 'all' ? getTypeLabel(filterType) : 'All Events'}
                </span>
                <span className="text-xs font-semibold text-cyan-700 bg-white px-3 py-1.5 rounded-lg border border-cyan-200">
                  {viewMode === 'table' ? 'Table' : viewMode === 'grouped' ? 'Grouped' : 'Compact'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and View Mode */}
      <div className="bg-gradient-to-br from-white to-teal-50/30 rounded-2xl shadow-md border-2 border-teal-100 p-5">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <span className="text-sm font-bold text-teal-700 uppercase tracking-wide">Filter:</span>
            {['all', 'appointment', 'diet-plan', 'medicine', 'alert'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 ${
                  filterType === type
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-white text-teal-700 border-2 border-teal-200 hover:border-teal-300 hover:shadow-md'
                }`}
              >
                {type === 'all' ? 'All Events' : getTypeLabel(type)}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-4 py-2.5 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-xl border-2 border-teal-200 mr-4">
              <span className="text-sm font-bold text-teal-700">
                <span className="text-teal-600">{filteredTimeline.length}</span> / <span className="text-gray-600">{timeline.length}</span> events
              </span>
            </div>
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-white rounded-xl p-1 border-2 border-teal-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'table' 
                    ? 'bg-teal-500 text-white shadow-md' 
                    : 'text-teal-600 hover:bg-teal-50'
                }`}
                title="Table View"
              >
                <Table className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grouped')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grouped' 
                    ? 'bg-teal-500 text-white shadow-md' 
                    : 'text-teal-600 hover:bg-teal-50'
                }`}
                title="Grouped by Date"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'compact' 
                    ? 'bg-teal-500 text-white shadow-md' 
                    : 'text-teal-600 hover:bg-teal-50'
                }`}
                title="Compact View"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Different View Structures Based on View Mode */}
      <div className="bg-gradient-to-br from-white to-teal-50/20 rounded-3xl shadow-xl border-2 border-teal-100 p-8">
        {filteredTimeline.length > 0 ? (
          <>
            {/* Table View */}
            {viewMode === 'table' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-teal-200">
                      <th className="text-left py-4 px-4 text-sm font-bold text-teal-700 uppercase tracking-wide">Date & Time</th>
                      <th className="text-left py-4 px-4 text-sm font-bold text-teal-700 uppercase tracking-wide">Event Type</th>
                      <th className="text-left py-4 px-4 text-sm font-bold text-teal-700 uppercase tracking-wide">Title</th>
                      <th className="text-left py-4 px-4 text-sm font-bold text-teal-700 uppercase tracking-wide">Description</th>
                      <th className="text-left py-4 px-4 text-sm font-bold text-teal-700 uppercase tracking-wide">Created By</th>
                      <th className="text-left py-4 px-4 text-sm font-bold text-teal-700 uppercase tracking-wide">Status</th>
                      <th className="text-left py-4 px-4 text-sm font-bold text-teal-700 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-teal-100">
                    {filteredTimeline.map((event, idx) => {
                      const isExpanded = expandedEvents.has(event.id)
                      return (
                        <>
                          <tr key={event.id || idx} className="hover:bg-teal-50/50 transition-colors group">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-teal-600" />
                                <span className="text-sm font-medium text-gray-700">{formatDate(event.date)}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className={`inline-flex items-center px-3 py-1.5 rounded-lg ${getTypeColor(event.type)}`}>
                                <div className="mr-2">{getTypeIcon(event.type)}</div>
                                <span className="text-xs font-semibold">{getTypeLabel(event.type)}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-semibold text-gray-900">{event.title}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-gray-600 line-clamp-2">{event.description}</span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-1">
                                <UserCheck className="w-3 h-3 text-teal-600" />
                                <span className="text-sm text-gray-600">{event.createdBy}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {event.status && (
                                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${
                                  event.status === 'active' || event.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  event.status === 'inactive' || event.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {event.status.toUpperCase()}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <button
                                onClick={() => toggleExpand(event.id)}
                                className="p-2 bg-teal-100 hover:bg-teal-200 rounded-lg transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-teal-700" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-teal-700" />
                                )}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && event.details && (
                            <tr>
                              <td colSpan="7" className="py-4 px-4 bg-teal-50/30">
                                <div className="bg-white rounded-xl p-4 border-2 border-teal-200">
                                  <p className="text-xs font-bold text-teal-700 mb-2 uppercase tracking-wide">Full Event Details</p>
                                  <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words font-mono bg-gray-50 p-3 rounded-lg overflow-x-auto">
                                    {JSON.stringify(event.details, null, 2)}
                                  </pre>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Grouped by Date View */}
            {viewMode === 'grouped' && (
              <div className="space-y-8">
                {Object.entries(groupedByDate).map(([dateKey, events]) => (
                  <div key={dateKey} className="space-y-4">
                    {/* Date Header */}
                    <div className="sticky top-0 z-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl p-4 text-white shadow-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5" />
                        <h3 className="text-lg font-extrabold">{formatDateHeader(dateKey)}</h3>
                        <span className="ml-auto px-3 py-1 bg-white/25 rounded-lg text-sm font-bold">
                          {events.length} {events.length === 1 ? 'event' : 'events'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Events for this date */}
                    <div className="space-y-3 pl-6">
                      {events.map((event, idx) => {
                        const isExpanded = expandedEvents.has(event.id)
                        return (
                          <div key={event.id || idx} className={`p-4 rounded-xl border-2 shadow-md hover:shadow-lg transition-all ${getTypeColor(event.type)}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="p-2 bg-white/70 rounded-lg">{getTypeIcon(event.type)}</div>
                                  <div>
                                    <h4 className="font-bold text-gray-900">{event.title}</h4>
                                    <p className="text-xs text-gray-600 mt-1">
                                      <Clock className="w-3 h-3 inline mr-1" />
                                      {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                                <div className="flex items-center space-x-3 text-xs">
                                  <span className="flex items-center text-gray-600">
                                    <UserCheck className="w-3 h-3 mr-1" />
                                    {event.createdBy}
                                  </span>
                                  {event.status && (
                                    <span className={`px-2 py-1 rounded-lg font-semibold ${
                                      event.status === 'active' || event.status === 'completed' ? 'bg-green-100 text-green-800' :
                                      event.status === 'inactive' || event.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {event.status}
                                    </span>
                                  )}
                                </div>
                                {isExpanded && event.details && (
                                  <div className="mt-4 pt-4 border-t-2 border-teal-200 bg-white/50 rounded-lg p-3">
                                    <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words font-mono">
                                      {JSON.stringify(event.details, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => toggleExpand(event.id)}
                                className="ml-4 p-2 bg-white/80 hover:bg-white rounded-lg transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-teal-600" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-teal-600" />
                                )}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Compact Grid View */}
            {viewMode === 'compact' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTimeline.map((event, idx) => {
                  const isExpanded = expandedEvents.has(event.id)
                  return (
                    <div key={event.id || idx} className={`p-4 rounded-xl border-2 shadow-md hover:shadow-xl transition-all ${getTypeColor(event.type)} relative overflow-hidden`}>
                      {/* Accent bar */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-cyan-500"></div>
                      
                      <div className="mt-2">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-white/70 rounded-lg">{getTypeIcon(event.type)}</div>
                            <span className="px-2 py-1 bg-white/90 rounded-lg text-xs font-bold uppercase tracking-wide">
                              {getTypeLabel(event.type)}
                            </span>
                          </div>
                          <button
                            onClick={() => toggleExpand(event.id)}
                            className="p-1.5 bg-white/80 hover:bg-white rounded-lg transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-teal-600" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-teal-600" />
                            )}
                          </button>
                        </div>
                        
                        <h4 className="font-bold text-gray-900 mb-2 text-sm line-clamp-2">{event.title}</h4>
                        
                        <div className="space-y-1.5 mb-3 text-xs text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1.5 text-teal-600" />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center">
                            <UserCheck className="w-3 h-3 mr-1.5 text-cyan-600" />
                            {event.createdBy}
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-700 mb-3 line-clamp-2">{event.description}</p>
                        
                        {event.status && (
                          <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold mb-2 ${
                            event.status === 'active' || event.status === 'completed' ? 'bg-green-100 text-green-800' :
                            event.status === 'inactive' || event.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {event.status}
                          </span>
                        )}
                        
                        {isExpanded && event.details && (
                          <div className="mt-3 pt-3 border-t-2 border-teal-200 bg-white/50 rounded-lg p-2">
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words font-mono">
                              {JSON.stringify(event.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <div className="w-24 h-24 bg-gradient-to-br from-teal-100 via-cyan-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Clock className="w-12 h-12 text-teal-500" />
            </div>
            <p className="font-extrabold text-xl text-gray-700 mb-2">No Timeline Events</p>
            <p className="text-sm text-gray-600 font-medium">
              {filterType !== 'all' 
                ? `No ${getTypeLabel(filterType)} events found for this patient`
                : 'No medical history events found for this patient'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientTimeline
