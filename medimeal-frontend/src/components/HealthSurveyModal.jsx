import { useState } from 'react'
import { X, CheckCircle } from 'lucide-react'
import axios from 'axios'

const HealthSurveyModal = ({ isOpen, onClose, onSubmit, userId }) => {
  const [formData, setFormData] = useState({
    hasPressure: false,
    hasSugar: false,
    isPregnant: false,
    hasCholesterol: false,
    hasHeartDisease: false,
    hasKidneyDisease: false,
    hasAcidReflux: false,
    hasGlutenIntolerance: false,
    hasLactoseIntolerance: false,
    allergies: '',
    otherConditions: ''
  })
  const [loading, setLoading] = useState(false)

  const healthConditions = [
    { key: 'hasPressure', label: 'High Blood Pressure', description: 'Meals low in sodium and healthy fats' },
    { key: 'hasSugar', label: 'Diabetes / High Sugar', description: 'Meals with controlled carbohydrates and low glycemic index' },
    { key: 'isPregnant', label: 'Pregnancy', description: 'Pregnancy-safe meals with essential nutrients' },
    { key: 'hasCholesterol', label: 'High Cholesterol', description: 'Heart-healthy meals low in saturated fats' },
    { key: 'hasHeartDisease', label: 'Heart Disease', description: 'Cardiac-friendly meals rich in omega-3s' },
    { key: 'hasKidneyDisease', label: 'Kidney Disease', description: 'Low-protein, kidney-friendly meals' },
    { key: 'hasAcidReflux', label: 'Acid Reflux / GERD', description: 'Meals avoiding trigger foods' },
    { key: 'hasGlutenIntolerance', label: 'Gluten Intolerance', description: 'Gluten-free meal options' },
    { key: 'hasLactoseIntolerance', label: 'Lactose Intolerance', description: 'Dairy-free meal options' }
  ]

  const handleToggle = (key) => {
    setFormData(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!userId) {
      alert('User ID not found. Please refresh the page.')
      return
    }
    
    setLoading(true)

    try {
      // Collect selected health conditions
      const selectedConditions = []
      if (formData.hasPressure) selectedConditions.push('high-blood-pressure')
      if (formData.hasSugar) selectedConditions.push('diabetes')
      if (formData.isPregnant) selectedConditions.push('pregnancy')
      if (formData.hasCholesterol) selectedConditions.push('high-cholesterol')
      if (formData.hasHeartDisease) selectedConditions.push('heart-disease')
      if (formData.hasKidneyDisease) selectedConditions.push('kidney-disease')
      if (formData.hasAcidReflux) selectedConditions.push('acid-reflux')
      if (formData.hasGlutenIntolerance) selectedConditions.push('gluten-free')
      if (formData.hasLactoseIntolerance) selectedConditions.push('dairy-free')

      // Parse allergies
      const allergiesList = formData.allergies
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0)

      // Parse other conditions
      const otherConditionsList = formData.otherConditions
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0)

      // Build survey data to match User model structure
      const surveyUpdate = {
        surveyCompleted: true,
        surveyData: {
          medicalConditions: [...selectedConditions, ...otherConditionsList],
          allergies: allergiesList,
          completedAt: new Date()
        }
      }

      // Update user survey data
      const response = await axios.put(`/api/users/${userId}`, surveyUpdate)
      
      if (response.data.success) {
        // Call the onSubmit callback to update the parent component
        onSubmit(response.data.data)
      }
    } catch (error) {
      console.error('Error submitting survey:', error)
      alert('Failed to save survey. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Health Survey</h2>
            <p className="text-sm text-gray-600 mt-1">Help us personalize your meal recommendations</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Health Conditions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Do you have any of these health conditions?
            </h3>
            <div className="space-y-3">
              {healthConditions.map((condition) => (
                <div
                  key={condition.key}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    formData[condition.key]
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleToggle(condition.key)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mr-3 ${
                          formData[condition.key]
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        }`}>
                          {formData[condition.key] && (
                            <CheckCircle className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <h4 className="font-semibold text-gray-900">{condition.label}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 ml-9">
                        {condition.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Allergies (comma-separated)
            </label>
            <input
              type="text"
              name="allergies"
              value={formData.allergies}
              onChange={handleInputChange}
              placeholder="e.g., peanuts, shellfish, eggs"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Other Conditions */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Other Health Conditions (comma-separated)
            </label>
            <input
              type="text"
              name="otherConditions"
              value={formData.otherConditions}
              onChange={handleInputChange}
              placeholder="e.g., anemia, thyroid issues"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default HealthSurveyModal

