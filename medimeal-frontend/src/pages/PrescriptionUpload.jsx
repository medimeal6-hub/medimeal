import { useState } from 'react'
import { Upload, FileText, AlertTriangle, CheckCircle, X, Eye, Download } from 'lucide-react'
import prescriptionsData from '../data/prescriptions.json'
import ImagePlaceholder from '../components/ImagePlaceholder'

const PrescriptionUpload = () => {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [extractedData, setExtractedData] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = (file) => {
    setUploadedFile(file)
    // Simulate data extraction
    setTimeout(() => {
      setExtractedData(prescriptionsData[0])
      setShowPreview(true)
    }, 1000)
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
  }

  const checkConflicts = () => {
    // Simulate conflict checking
    console.log('Checking conflicts...')
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
                Or click to browse files. Supports PDF, JPG, PNG formats.
              </p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
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
              <span className="px-2 py-1 bg-gray-100 rounded">PDF</span>
              <span className="px-2 py-1 bg-gray-100 rounded">JPG</span>
              <span className="px-2 py-1 bg-gray-100 rounded">PNG</span>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Success */
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
            <button
              onClick={clearUpload}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span>Processing prescription data...</span>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Data Preview */}
      {showPreview && extractedData && (
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
                      <span className="font-medium">Conflicts:</span> {med.conflicts.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Check Conflicts Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>Ready to check for food interactions</span>
              </div>
              <button
                onClick={checkConflicts}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Check Conflicts
              </button>
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
