import { useState } from 'react'
import { Upload, FileText, AlertTriangle, CheckCircle, X, Eye, Download, Camera, Pill, Zap, AlertOctagon } from 'lucide-react'
import prescriptionsData from '../data/prescriptions.json'
import ImagePlaceholder from '../components/ImagePlaceholder'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { processImageOCR, extractMedicinesEnhanced, checkDrugDrugInteractions } from '../utils/ocrService'

const PrescriptionUpload = () => {
  const { token } = useAuth()
  const [uploadedFile, setUploadedFile] = useState(null)
  const [extractedData, setExtractedData] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  // OCR state
  const [ocrImage, setOcrImage] = useState(null)
  const [ocrImagePreview, setOcrImagePreview] = useState(null)
  const [ocrProcessing, setOcrProcessing] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [extractedMedicines, setExtractedMedicines] = useState([])
  const [ocrConflicts, setOcrConflicts] = useState([])
  const [ocrText, setOcrText] = useState('')
  const [error, setError] = useState('')

  const handleFileUpload = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)')
      return
    }
    setUploadedFile(file)
    setOcrImage(file)
    setError('')
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setOcrImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleFileInput = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const clearUpload = () => {
    setUploadedFile(null)
    setExtractedData(null)
    setShowPreview(false)
    setOcrImage(null)
    setOcrImagePreview(null)
    setExtractedMedicines([])
    setOcrConflicts([])
    setOcrText('')
    setError('')
  }

  const handleProcessOCR = async () => {
    if (!ocrImage) {
      setError('Please select an image first')
      return
    }

    setOcrProcessing(true)
    setOcrProgress(0)
    setError('')
    setExtractedMedicines([])
    setOcrConflicts([])
    setOcrText('')

    try {
      // Process OCR
      const text = await processImageOCR(ocrImage, (progress) => {
        setOcrProgress(progress)
      })
      setOcrText(text)

      // Extract medicines
      const medicines = extractMedicinesEnhanced(text)
      setExtractedMedicines(medicines)

      // Check conflicts if we have medicines
      if (medicines.length > 0) {
        const conflictMessages = []
        const flaggedFoodsList = []
        
        // Check for drug-drug interactions
        const drugDrugConflicts = checkDrugDrugInteractions(medicines)
        conflictMessages.push(...drugDrugConflicts)
        
        // Also check food-drug conflicts via API if token is available
        if (token) {
          try {
            const conflictRes = await axios.post('/api/conflicts/check', {
              medications: medicines.map(m => ({ name: m.name })),
              foods: [] // We're checking for potential food conflicts
            }, {
              headers: { Authorization: `Bearer ${token}` }
            })

            if (conflictRes.data?.success && conflictRes.data?.data?.conflicts) {
              const conflicts = conflictRes.data.data.conflicts
              
              // Process food-drug conflicts
              for (const conflict of conflicts) {
                // Add to conflict messages
                if (conflict.severity === 'High' || conflict.severity === 'Critical') {
                  conflictMessages.push(`${conflict.medicine}: ${conflict.description || 'Potential conflict detected'}`)
                }
                
                // Add to flagged foods list
                if (conflict.avoidFood && conflict.avoidFood.length > 0) {
                  for (const food of conflict.avoidFood) {
                    flaggedFoodsList.push({
                      food: food,
                      reason: conflict.description || `May interact with ${conflict.medicine}`,
                      severity: conflict.severity === 'Critical' ? 'High' : conflict.severity || 'Medium'
                    })
                  }
                }
              }
            }
          } catch (conflictError) {
            console.error('Conflict check error:', conflictError)
            // Don't fail the whole process if conflict check fails
          }
        }

        setOcrConflicts(conflictMessages)
        setShowPreview(true)
        
        // Format extracted data for display
        setExtractedData({
          medications: medicines.map(m => ({
            name: m.name,
            dosage: m.dosage,
            frequency: m.frequency,
            instructions: m.frequency,
            conflicts: []
          })),
          flaggedFoods: flaggedFoodsList
        })
      } else {
        setError('No medicines found in the prescription. Please ensure the image is clear and readable.')
      }
    } catch (err) {
      console.error('OCR Error:', err)
      setError(err.message || 'Failed to process image. Please try again.')
    } finally {
      setOcrProcessing(false)
      setOcrProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Prescription</h2>
        <p className="text-gray-600">
          Upload your prescription to get personalized meal recommendations and conflict alerts.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Upload Area */}
      {!uploadedFile ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Drop your prescription here
              </h3>
              <p className="text-gray-600 mb-6">
                Or click to browse files. Supports JPG, PNG, WebP formats.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors inline-block"
              >
                Choose File
              </label>
            </div>
          </div>

          {/* Supported Formats */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">Supported formats:</p>
            <div className="flex justify-center space-x-4 text-xs text-gray-600">
              <span className="px-2 py-1 bg-gray-100 rounded">JPG</span>
              <span className="px-2 py-1 bg-gray-100 rounded">PNG</span>
              <span className="px-2 py-1 bg-gray-100 rounded">WebP</span>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Success with OCR Preview */
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">File Uploaded Successfully</h3>
                  <p className="text-sm text-gray-600">{uploadedFile.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleProcessOCR}
                  disabled={ocrProcessing}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4" />
                  <span>{ocrProcessing ? 'Processing...' : 'Process OCR'}</span>
                </button>
                <button
                  onClick={clearUpload}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* OCR Preview and Extracted Medicines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* OCR Preview */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-gray-800">OCR Preview</h3>
                {ocrImagePreview ? (
                  <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={ocrImagePreview}
                      alt="Prescription preview"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                    {ocrProcessing && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                          <p className="text-sm">Processing OCR... {ocrProgress}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Image preview will appear here</p>
                  </div>
                )}
                {ocrText && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Extracted Text:</h4>
                    <p className="text-xs text-gray-600 max-h-32 overflow-y-auto whitespace-pre-wrap">{ocrText}</p>
                  </div>
                )}
              </div>
              
              {/* Extracted Medicine List */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-gray-800">Extracted Medicines</h3>
                <div className="space-y-3">
                  {extractedMedicines.length > 0 ? (
                    extractedMedicines.map((medicine, index) => {
                      const hasConflict = ocrConflicts.some(conflict => 
                        conflict.toLowerCase().includes(medicine.name.toLowerCase())
                      )
                      return (
                        <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                          hasConflict ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <Pill className={`w-5 h-5 ${hasConflict ? 'text-red-600' : 'text-green-600'}`} />
                            <div>
                              <p className="font-medium text-gray-800">{medicine.name}</p>
                              <p className="text-sm text-gray-600">
                                {medicine.dosage} • {medicine.frequency}
                              </p>
                            </div>
                          </div>
                          {hasConflict ? (
                            <X className="w-5 h-5 text-red-600" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      )
                    })
                  ) : ocrProcessing ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p>Processing image...</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Pill className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p>No medicines extracted yet</p>
                      <p className="text-xs mt-2">Click "Process OCR" to extract medicines</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Conflict Alerts */}
            {ocrConflicts.length > 0 && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertOctagon className="w-5 h-5 text-red-600" />
                  <h4 className="font-semibold text-red-800">Conflict Alert</h4>
                </div>
                <div className="space-y-2">
                  {ocrConflicts.map((conflict, index) => (
                    <p key={index} className="text-sm text-red-700">
                      {conflict}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Extracted Data Preview - Legacy format for compatibility */}
      {showPreview && extractedData && extractedMedicines.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Extracted Medications</h3>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Eye className="h-4 w-4 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Medications List */}
            <div className="space-y-4 mb-6">
              {extractedData.medications.map((med, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{med.name}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {med.dosage}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Frequency:</span> {med.frequency}
                    </div>
                    <div>
                      <span className="font-medium">Instructions:</span> {med.instructions}
                    </div>
                    <div>
                      <span className="font-medium">Conflicts:</span> {med.conflicts.join(', ') || 'None detected'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Flagged Foods */}
      {showPreview && extractedData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Flagged Foods</h3>
            <p className="text-sm text-gray-600">Foods that may interact with your medications</p>
          </div>

          <div className="p-6">
            {extractedData.flaggedFoods && extractedData.flaggedFoods.length > 0 ? (
              <div className="space-y-3">
                {extractedData.flaggedFoods.map((food, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        food.severity === 'High' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <h4 className="font-medium text-gray-900">{food.food}</h4>
                        <p className="text-sm text-gray-600">{food.reason}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      food.severity === 'High' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {food.severity} Risk
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No flagged foods detected</p>
                <p className="text-sm text-gray-500 mt-2">
                  Based on your medications, no foods have been identified that may cause interactions.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Uploads */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Uploads</h3>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {prescriptionsData.map((prescription, index) => (
              <div key={prescription.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <ImagePlaceholder 
                    width={40}
                    height={40}
                    text="📄"
                    bgColor="#dbeafe"
                    textColor="#2563eb"
                    className="rounded-lg"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{prescription.fileName}</h4>
                    <p className="text-sm text-gray-600">
                      Uploaded {new Date(prescription.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    prescription.status === 'Processed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {prescription.status}
                  </span>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Eye className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrescriptionUpload
