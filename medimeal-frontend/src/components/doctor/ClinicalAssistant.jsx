import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { 
  Bot, 
  Stethoscope, 
  Pill, 
  AlertTriangle, 
  CheckCircle,
  Loader,
  Sparkles,
  User,
  Calendar,
  FileText,
  Activity
} from 'lucide-react'

const ClinicalAssistant = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    symptoms: '',
    existingConditions: '',
    currentMedicines: '',
    allergies: ''
  })
  const [loading, setLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('input')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
    if (analysisResult) setAnalysisResult(null)
  }

  const handleAnalyze = async (e) => {
    e.preventDefault()
    setError('')
    setAnalysisResult(null)

    if (!formData.gender || !formData.age || !formData.symptoms.trim()) {
      setError('Please fill in all required fields: Gender, Age, and Symptoms')
      return
    }

    if (isNaN(formData.age) || parseInt(formData.age) < 0 || parseInt(formData.age) > 150) {
      setError('Please enter a valid age (0-150)')
      return
    }

    setLoading(true)
    setActiveTab('results')

    try {
      const response = await axios.post('/doctor/clinical-assistant/analyze', formData)
      if (response.data.success) {
        setAnalysisResult(response.data.data)
      } else {
        setError(response.data.message || 'Analysis failed. Please try again.')
        setActiveTab('input')
      }
    } catch (err) {
      console.error('Clinical analysis error:', err)
      setError(err.response?.data?.message || 'Failed to analyze patient. Please try again.')
      setActiveTab('input')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignMedicine = async (medicine) => {
    if (!confirm(`Assign ${medicine.name} to this patient?\n\nPlease review all contraindications and interactions before confirming.`)) return
    
    try {
      const response = await axios.post('/doctor/clinical-assistant/assign-medicine', {
        selectedMedicine: medicine,
        patientInfo: {
          gender: formData.gender,
          age: formData.age,
          symptoms: formData.symptoms,
          existingConditions: formData.existingConditions || '',
          currentMedicines: formData.currentMedicines || '',
          allergies: formData.allergies || ''
        },
        doctorDecision: 'approved'
      })
      if (response.data.success) {
        alert(`✓ ${medicine.name} assigned successfully!`)
      }
    } catch (err) {
      console.error('Assign medicine error:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to assign medicine'
      alert(errorMessage)
    }
  }

  const resetForm = () => {
    setFormData({
      gender: '',
      age: '',
      symptoms: '',
      existingConditions: '',
      currentMedicines: '',
      allergies: ''
    })
    setAnalysisResult(null)
    setError('')
    setActiveTab('input')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bot className="w-6 h-6 mr-2 text-blue-600" />
            Clinical AI Assistant
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered clinical analysis with live medicine recommendations
          </p>
        </div>
        {analysisResult && (
          <button
            onClick={resetForm}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            New Analysis
          </button>
        )}
      </div>

      {/* Tabs */}
      {analysisResult && (
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('input')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'input'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Patient Info
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'results'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analysis Results
            </button>
          </nav>
        </div>
      )}

      {/* Content */}
      {activeTab === 'input' ? (
        /* Input Form */
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Patient Information
          </h2>

          <form onSubmit={handleAnalyze} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age (Years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="150"
                  placeholder="Enter age"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Diseases / Symptoms <span className="text-red-500">*</span>
              </label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                required
                rows="3"
                placeholder="e.g., Fever, Headache, Cough, High Blood Pressure..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="mt-1 text-xs text-gray-500">Separate multiple symptoms with commas</p>
            </div>

            {/* Optional Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Existing Conditions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Existing Conditions <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <textarea
                  name="existingConditions"
                  value={formData.existingConditions}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="e.g., Diabetes, Hypertension..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
              </div>

              {/* Current Medicines */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Medicines <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <textarea
                  name="currentMedicines"
                  value={formData.currentMedicines}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="e.g., Metformin 500mg..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="e.g., Penicillin, Sulfa..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto min-w-[200px] bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-medium shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Patient...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze Patient
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Results Display */
        <div className="space-y-5">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Analyzing patient data...</p>
              <p className="text-sm text-gray-500 mt-2">Fetching live medicine recommendations</p>
            </div>
          ) : analysisResult ? (
            <>
              {/* Clinical Analysis Card */}
              {analysisResult.clinicalAnalysis?.possibleDiseases?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-600" />
                    Clinical Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysisResult.clinicalAnalysis.possibleDiseases.map((disease, idx) => (
                      <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{disease.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                            disease.confidence === 'High' ? 'bg-green-100 text-green-800' :
                            disease.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {disease.confidence}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{disease.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicine Suggestions */}
              {analysisResult.medicineSuggestions?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Pill className="w-5 h-5 mr-2 text-green-600" />
                    Medicine Suggestions ({analysisResult.medicineSuggestions.length})
                  </h3>
                  <div className="space-y-4">
                    {analysisResult.medicineSuggestions.map((medicine, idx) => (
                      <div key={idx} className="p-5 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">{medicine.name}</h4>
                            {medicine.brandName && (
                              <p className="text-sm text-gray-500">Brand: {medicine.brandName}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleAssignMedicine(medicine)}
                            className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex-shrink-0"
                          >
                            Assign
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Purpose</p>
                            <p className="text-gray-600">{medicine.purpose || medicine.indication || 'N/A'}</p>
                          </div>
                          {medicine.dosage && (
                            <div>
                              <p className="font-medium text-gray-700 mb-1">Dosage</p>
                              <p className="text-gray-600">{medicine.dosage}</p>
                            </div>
                          )}
                        </div>

                        {(medicine.contraindications?.length > 0 || medicine.interactions?.length > 0) && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                            {medicine.contraindications?.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-red-700 mb-1">⚠️ Contraindications</p>
                                <ul className="text-xs text-red-600 space-y-1">
                                  {medicine.contraindications.slice(0, 3).map((contra, i) => (
                                    <li key={i} className="flex items-start">
                                      <span className="mr-2">•</span>
                                      <span>{contra}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {medicine.interactions?.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-orange-700 mb-1">⚡ Interactions</p>
                                <ul className="text-xs text-orange-600 space-y-1">
                                  {medicine.interactions.slice(0, 2).map((interaction, i) => (
                                    <li key={i} className="flex items-start">
                                      <span className="mr-2">•</span>
                                      <span>{interaction}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety Alerts */}
              {analysisResult.safetyAlerts?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
                  <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                    Safety Alerts
                  </h3>
                  <div className="space-y-3">
                    {analysisResult.safetyAlerts.map((alert, idx) => (
                      <div key={idx} className="flex items-start p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-900">{alert.type}</p>
                          <p className="text-sm text-red-700 mt-1">{alert.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysisResult.medicineSuggestions?.length === 0 && 
               !analysisResult.clinicalAnalysis?.possibleDiseases?.length && 
               analysisResult.safetyAlerts?.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No recommendations found</p>
                  <p className="text-sm text-gray-500 mt-2">Please adjust the patient information and try again</p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No analysis yet</p>
              <p className="text-sm text-gray-500 mt-2">Fill in patient information and click "Analyze Patient"</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ClinicalAssistant
