import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Pill, Plus, Trash2, Edit, Clock, Calendar, AlertTriangle } from 'lucide-react'

const Medications = () => {
  const { user } = useAuth()
  const [medications, setMedications] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingMedication, setEditingMedication] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    timingMode: 'fixed',
    times: [''],
    relativeMealType: 'breakfast',
    relativeWhen: 'after',
    offsetMinutes: 30,
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  })

  // Initialize medications from user data
  useEffect(() => {
    if (user && user.medications) {
      setMedications(user.medications)
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTimeChange = (index, value) => {
    const newTimes = [...formData.times]
    newTimes[index] = value
    setFormData(prev => ({
      ...prev,
      times: newTimes
    }))
  }

  const addTimeField = () => {
    setFormData(prev => ({
      ...prev,
      times: [...prev.times, '']
    }))
  }

  const removeTimeField = (index) => {
    if (formData.times.length > 1) {
      const newTimes = formData.times.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        times: newTimes
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Create medication object
    const medication = {
      ...formData,
      _id: editingMedication ? editingMedication._id : Date.now().toString(),
      times: formData.times.filter(time => time !== '')
    }

    if (editingMedication) {
      // Update existing medication
      setMedications(prev => 
        prev.map(med => med._id === editingMedication._id ? medication : med)
      )
    } else {
      // Add new medication
      setMedications(prev => [...prev, medication])
    }

    // Reset form
    setFormData({
      name: '',
      dosage: '',
      frequency: '',
      timingMode: 'fixed',
      times: [''],
      relativeMealType: 'breakfast',
      relativeWhen: 'after',
      offsetMinutes: 30,
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    })
    setEditingMedication(null)
    setShowForm(false)
  }

  const handleEdit = (medication) => {
    setFormData({
      ...medication,
      times: medication.times && medication.times.length > 0 ? medication.times : [''],
      startDate: medication.startDate ? new Date(medication.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: medication.endDate ? new Date(medication.endDate).toISOString().split('T')[0] : ''
    })
    setEditingMedication(medication)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      setMedications(prev => prev.filter(med => med._id !== id))
    }
  }

  const cancelForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: '',
      timingMode: 'fixed',
      times: [''],
      relativeMealType: 'breakfast',
      relativeWhen: 'after',
      offsetMinutes: 30,
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    })
    setEditingMedication(null)
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">My Medications</h2>
            <p className="text-gray-600">
              Manage your medications and set up reminders for optimal timing.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Medication
          </button>
        </div>
      </div>

      {/* Medication Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingMedication ? 'Edit Medication' : 'Add New Medication'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medication Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Metformin"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage *
                </label>
                <input
                  type="text"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 500mg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency *
                </label>
                <input
                  type="text"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Twice daily"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            {/* Timing Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reminder Timing
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <select
                    name="timingMode"
                    value={formData.timingMode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="fixed">Fixed Times</option>
                    <option value="relativeToMeal">Relative to Meals</option>
                  </select>
                </div>
                
                {formData.timingMode === 'fixed' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Times (24h format)
                    </label>
                    <div className="space-y-2">
                      {formData.times.map((time, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => handleTimeChange(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          {formData.times.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTimeField(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addTimeField}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        + Add another time
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <select
                      name="relativeMealType"
                      value={formData.relativeMealType}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="any">Any Meal</option>
                    </select>
                    
                    <select
                      name="relativeWhen"
                      value={formData.relativeWhen}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="before">Before</option>
                      <option value="after">After</option>
                      <option value="with">With</option>
                    </select>
                    
                    <div>
                      <input
                        type="number"
                        name="offsetMinutes"
                        value={formData.offsetMinutes}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Minutes"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minutes</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {editingMedication ? 'Update' : 'Add'} Medication
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Medications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            My Medications ({medications.length})
          </h3>
        </div>
        
        <div className="p-6">
          {medications.length === 0 ? (
            <div className="text-center py-12">
              <Pill className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No medications added</h4>
              <p className="text-gray-600 mb-4">
                Add your medications to get personalized meal recommendations and reminders.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Your First Medication
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {medications.map((medication) => (
                <div key={medication._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Pill className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{medication.name}</h4>
                        <p className="text-sm text-gray-600">
                          {medication.dosage} • {medication.frequency}
                        </p>
                        
                        {/* Timing Information */}
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              {new Date(medication.startDate).toLocaleDateString()}
                              {medication.endDate && ` - ${new Date(medication.endDate).toLocaleDateString()}`}
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>
                              {medication.timingMode === 'fixed' 
                                ? `${medication.times.length} time(s)` 
                                : `${medication.relativeWhen} ${medication.relativeMealType}`}
                            </span>
                          </div>
                        </div>
                        
                        {/* Reminder Times */}
                        {medication.timingMode === 'fixed' && medication.times && medication.times.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {medication.times.map((time, index) => (
                              <span key={index} className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                                {time}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {medication.timingMode === 'relativeToMeal' && (
                          <div className="mt-2 text-sm text-gray-500">
                            {medication.relativeWhen} {medication.relativeMealType} by {medication.offsetMinutes} minutes
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(medication)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(medication._id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Medication Tips */}
      {medications.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Medication Tips</h4>
              <ul className="text-sm text-blue-800 list-disc pl-5 space-y-1">
                <li>Take medications with food if they cause stomach upset</li>
                <li>Set up reminders to ensure you don't miss doses</li>
                <li>Keep a record of any side effects to discuss with your doctor</li>
                <li>Review your medication list with your healthcare provider regularly</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Medications