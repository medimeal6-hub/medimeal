import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Heart, 
  Pill, 
  Utensils, 
  Activity,
  CheckCircle,
  XCircle,
  Search,
  User,
  Shield,
  Info
} from 'lucide-react'

const ClinicalInsights = ({ patientId: propPatientId }) => {
  const [selectedPatientId, setSelectedPatientId] = useState(propPatientId)
  const [patients, setPatients] = useState([])
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

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
      fetchInsights()
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

  const fetchInsights = async () => {
    if (!selectedPatientId) return
    setLoading(true)
    try {
      const response = await axios.get(`/doctor/clinical-insights/${selectedPatientId}`)
      if (response.data.success) {
        setInsights(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching clinical insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'moderate':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'red':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'medium':
      case 'moderate':
      case 'yellow':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'low':
      case 'green':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      default:
        return <Info className="w-5 h-5 text-gray-600" />
    }
  }

  // Patient Selection UI
  if (!propPatientId && !selectedPatientId) {
    return (
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mr-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">Clinical Insights</h2>
              <p className="text-blue-100 text-sm">AI-powered decision support and medical intelligence</p>
            </div>
          </div>
          <p className="text-blue-50 text-sm">Select a patient to view comprehensive clinical insights, risk assessments, and AI-powered recommendations</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search patients by name or email..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Patient Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'} found
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear search
              </button>
            )}
          </div>

          {/* Patient Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient, index) => {
                // Deduplicate: Ensure unique key by combining patient ID with index
                const uniqueKey = `${patient.patientId || patient.id || 'patient'}-${index}`
                return (
                <button
                  key={uniqueKey}
                  onClick={() => setSelectedPatientId(patient.patientId || patient.id)}
                  className="group bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-200 text-left"
                >
                  {/* Patient Avatar & Info */}
                  <div className="flex items-start space-x-4 mb-3">
                    {/* Avatar */}
                    {patient.profilePicture ? (
                      <img 
                        src={patient.profilePicture} 
                        alt={patient.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-400 transition-colors"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                        <span className="text-white font-bold text-lg">
                          {getInitials(patient.name)}
                        </span>
                      </div>
                    )}
                    
                    {/* Patient Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors truncate">
                        {patient.name || 'Unknown Patient'}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <User className="w-4 h-4 mr-1" />
                        <span className="truncate">{patient.email || 'No email'}</span>
                      </div>
                      {patient.age && patient.age !== 'N/A' && (
                        <p className="text-xs text-gray-400">Age: {typeof patient.age === 'number' ? patient.age : parseInt(patient.age)} years</p>
                      )}
                      {(!patient.age || patient.age === 'N/A') && (
                        <p className="text-xs text-gray-400">Age: Not available</p>
                      )}
                    </div>
                  </div>

                  {/* Action Indicator */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                      View Insights
                    </span>
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Brain className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </button>
                )
              })
            ) : (
              <div className="col-span-full bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
          <p className="text-gray-600">Analyzing patient data...</p>
        </div>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No clinical insights available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">Clinical Insights</h1>
              <p className="text-blue-100 text-sm">AI-powered decision support and medical intelligence</p>
            </div>
          </div>
          {!propPatientId && selectedPatientId && (
            <button
              onClick={() => {
                setSelectedPatientId(null)
                setInsights(null)
              }}
              className="px-4 py-2 text-sm bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors font-medium"
            >
              ← Change Patient
            </button>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            <strong>AI-Assisted Clinical Insight.</strong> This tool provides interpreted medical intelligence for decision support. Doctor decision required for all clinical actions.
          </p>
        </div>
      </div>

      {/* A) Patient Health Summary */}
      {insights.patientSummary && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Patient Health Summary</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Age</p>
                <User className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-900">{insights.patientSummary.age || 'N/A'}</p>
              <p className="text-xs text-blue-600 mt-1">years</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Gender</p>
                <Activity className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-purple-900">{insights.patientSummary.gender || 'N/A'}</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-orange-700 uppercase tracking-wide">Conditions</p>
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-orange-900">
                {insights.patientSummary.chronicConditions?.length || 0}
              </p>
              <p className="text-xs text-orange-600 mt-1">chronic conditions</p>
            </div>
            <div className={`p-5 rounded-xl border-2 shadow-sm hover:shadow-md transition-shadow ${
              insights.patientSummary.overallRisk === 'High' ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-300' :
              insights.patientSummary.overallRisk === 'Moderate' ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300' :
              'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-xs font-medium uppercase tracking-wide ${
                  insights.patientSummary.overallRisk === 'High' ? 'text-red-700' :
                  insights.patientSummary.overallRisk === 'Moderate' ? 'text-yellow-700' :
                  'text-green-700'
                }`}>Risk Level</p>
                {getSeverityIcon(insights.patientSummary.overallRisk)}
              </div>
              <p className={`text-2xl font-bold ${
                insights.patientSummary.overallRisk === 'High' ? 'text-red-900' :
                insights.patientSummary.overallRisk === 'Moderate' ? 'text-yellow-900' :
                'text-green-900'
              }`}>{insights.patientSummary.overallRisk || 'Low'}</p>
            </div>
          </div>
          {insights.patientSummary.chronicConditions && insights.patientSummary.chronicConditions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Chronic Conditions:</p>
              <div className="flex flex-wrap gap-2">
                {insights.patientSummary.chronicConditions.map((condition, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* B) AI Health Pattern Detection */}
      {insights.healthPatterns && insights.healthPatterns.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            AI Health Pattern Detection
          </h2>
          <div className="space-y-4">
            {insights.healthPatterns.map((pattern, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{pattern.type}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(pattern.severity)}`}>
                    {pattern.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{pattern.description}</p>
                {pattern.occurrences && (
                  <p className="text-xs text-gray-500">Detected {pattern.occurrences} time(s)</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* C) Clinical Risk Alerts */}
      {insights.clinicalRisks && insights.clinicalRisks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-red-600" />
            Clinical Risk Alerts
          </h2>
          <div className="space-y-3">
            {insights.clinicalRisks.map((risk, idx) => (
              <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                risk.severity === 'Red' ? 'bg-red-50 border-red-500' :
                risk.severity === 'Yellow' ? 'bg-yellow-50 border-yellow-500' :
                'bg-green-50 border-green-500'
              }`}>
                <div className="flex items-start">
                  {getSeverityIcon(risk.severity)}
                  <div className="ml-3 flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{risk.title}</h4>
                    <p className="text-sm text-gray-700 mb-2">{risk.description}</p>
                    {risk.factors && risk.factors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-600 mb-1">Risk Factors:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {risk.factors.map((factor, i) => (
                            <li key={i} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* D) Medication Safety Insights */}
      {insights.medicationSafety && insights.medicationSafety.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Pill className="w-5 h-5 mr-2 text-green-600" />
            Medication Safety Insights
          </h2>
          <div className="space-y-4">
            {insights.medicationSafety.map((safety, idx) => (
              <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                safety.type === 'interaction' || safety.type === 'allergy' ? 'bg-red-50 border-red-500' :
                safety.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{safety.title}</h4>
                  <span className="text-xs font-medium text-gray-600 uppercase">{safety.type}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{safety.description}</p>
                {safety.medications && safety.medications.length > 0 && (
                  <p className="text-xs text-gray-600">
                    <strong>Medications:</strong> {safety.medications.join(', ')}
                  </p>
                )}
                {safety.recommendation && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-blue-700">Recommendation:</p>
                    <p className="text-sm text-blue-800">{safety.recommendation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* E) Diet & Lifestyle Insights */}
      {insights.dietLifestyle && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Utensils className="w-5 h-5 mr-2 text-orange-600" />
            Diet & Lifestyle Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Diet Adherence Score</p>
              <p className="text-2xl font-semibold text-gray-900">
                {insights.dietLifestyle.adherenceScore || 0}%
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Trigger Foods Detected</p>
              <p className="text-2xl font-semibold text-gray-900">
                {insights.dietLifestyle.triggerFoods?.length || 0}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Lifestyle Risk Factors</p>
              <p className="text-2xl font-semibold text-gray-900">
                {insights.dietLifestyle.riskFactors?.length || 0}
              </p>
            </div>
          </div>
          {insights.dietLifestyle.triggerFoods && insights.dietLifestyle.triggerFoods.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Trigger Foods:</p>
              <div className="flex flex-wrap gap-2">
                {insights.dietLifestyle.triggerFoods.map((food, idx) => (
                  <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    {food}
                  </span>
                ))}
              </div>
            </div>
          )}
          {insights.dietLifestyle.riskFactors && insights.dietLifestyle.riskFactors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Lifestyle Risk Factors:</p>
              <ul className="space-y-1">
                {insights.dietLifestyle.riskFactors.map((factor, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start">
                    <AlertTriangle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* F) AI Recommendations */}
      {insights.aiRecommendations && insights.aiRecommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-600" />
            AI Recommendations (Advisory Only)
          </h2>
          <div className="space-y-3">
            {insights.aiRecommendations.map((rec, idx) => (
              <div key={idx} className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{rec.category}</h4>
                    <p className="text-sm text-gray-700">{rec.suggestion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!insights.patientSummary && 
       (!insights.healthPatterns || insights.healthPatterns.length === 0) &&
       (!insights.clinicalRisks || insights.clinicalRisks.length === 0) &&
       (!insights.medicationSafety || insights.medicationSafety.length === 0) &&
       !insights.dietLifestyle &&
       (!insights.aiRecommendations || insights.aiRecommendations.length === 0) && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-2">No clinical insights available</p>
          <p className="text-sm text-gray-500">Insufficient patient data for analysis</p>
        </div>
      )}
    </div>
  )
}

export default ClinicalInsights
