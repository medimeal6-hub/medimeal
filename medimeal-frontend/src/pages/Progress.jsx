import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  TrendingUp,
  TrendingDown,
  Award,
  Calendar,
  Activity,
  Heart,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Clock,
  Plus,
  Edit3,
  Download,
  Share2,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  Eye,
  EyeOff
} from 'lucide-react'
import ImagePlaceholder from '../components/ImagePlaceholder'

const Progress = () => {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState('week') // week, month, year
  const [selectedMetric, setSelectedMetric] = useState('weight')
  const [showAddMetricModal, setShowAddMetricModal] = useState(false)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [viewMode, setViewMode] = useState('chart') // chart, table, summary
  const [weightUnit, setWeightUnit] = useState('kg') // kg | lbs
  const [heightUnit, setHeightUnit] = useState('cm') // cm | in
  
  // Form state for Add Metric Modal
  const [newMetricType, setNewMetricType] = useState('weight')
  const [newMetricValue, setNewMetricValue] = useState('')
  const [newMetricDate, setNewMetricDate] = useState(new Date().toISOString().split('T')[0])

  // Progress data state
  const [progressData, setProgressData] = useState(() => {
    const today = new Date()
    const data = {}
    
    // Generate sample data for the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      const weightVal = 70 + Math.random() * 2 - 1
      const heightCmVal = 170 + Math.random() * 4 - 2
      const bmiVal = Number((weightVal / Math.pow(heightCmVal / 100, 2)).toFixed(1))
      data[dateKey] = {
        weight: weightVal,
        heightCm: heightCmVal,
        bmi: bmiVal,
        bodyFat: 15 + Math.random() * 3 - 1.5,
        muscleMass: 35 + Math.random() * 2 - 1,
        waterPercentage: 55 + Math.random() * 5 - 2.5,
        calories: 1800 + Math.random() * 400 - 200,
        steps: 8000 + Math.random() * 4000 - 2000,
        sleep: 7 + Math.random() * 2 - 1,
        mood: Math.floor(Math.random() * 5) + 1,
        energy: Math.floor(Math.random() * 5) + 1,
        stress: Math.floor(Math.random() * 5) + 1
      }
    }
    
    return data
  })

  // Unit converters
  const kgToLbs = useCallback((kg) => kg * 2.2046226218, [])
  const lbsToKg = useCallback((lbs) => lbs / 2.2046226218, [])
  const cmToIn = useCallback((cm) => cm / 2.54, [])
  const inToCm = useCallback((inch) => inch * 2.54, [])

  const convertForDisplay = useCallback((metric, value) => {
    if (value === undefined || value === null || Number.isNaN(value)) return value
    if (metric === 'weight') return weightUnit === 'lbs' ? kgToLbs(Number(value)) : Number(value)
    if (metric === 'heightCm') return heightUnit === 'in' ? cmToIn(Number(value)) : Number(value)
    return Number(value)
  }, [weightUnit, heightUnit, kgToLbs, cmToIn])

  const convertDeltaForDisplay = useCallback((metric, delta) => {
    if (typeof delta !== 'number' || Number.isNaN(delta)) return delta
    if (metric === 'weight') return weightUnit === 'lbs' ? kgToLbs(delta) : delta
    if (metric === 'heightCm') return heightUnit === 'in' ? cmToIn(delta) : delta
    return delta
  }, [weightUnit, heightUnit, kgToLbs, cmToIn])

  const getBmiCategory = useCallback((bmi) => {
    if (typeof bmi !== 'number' || Number.isNaN(bmi)) return { label: '—', color: 'bg-gray-200 text-gray-700' }
    if (bmi < 18.5) return { label: 'Underweight', color: 'bg-yellow-100 text-yellow-700' }
    if (bmi < 25) return { label: 'Normal', color: 'bg-green-100 text-green-700' }
    if (bmi < 30) return { label: 'Overweight', color: 'bg-orange-100 text-orange-700' }
    return { label: 'Obese', color: 'bg-red-100 text-red-700' }
  }, [])

  

  // Calculate progress statistics
  const progressStats = useMemo(() => {
    const dates = Object.keys(progressData).sort()
    if (dates.length < 2) return null

    const latest = progressData[dates[dates.length - 1]]
    const previous = progressData[dates[dates.length - 2]]
    const first = progressData[dates[0]]

    const changes = {
      weight: latest.weight - previous.weight,
      bmi: (latest.bmi ?? NaN) - (previous.bmi ?? NaN),
      heightCm: (latest.heightCm ?? NaN) - (previous.heightCm ?? NaN),
      bodyFat: latest.bodyFat - previous.bodyFat,
      muscleMass: latest.muscleMass - previous.muscleMass,
      waterPercentage: latest.waterPercentage - previous.waterPercentage,
      calories: latest.calories - previous.calories,
      steps: latest.steps - previous.steps,
      sleep: latest.sleep - previous.sleep
    }

    const trends = {
      weight: latest.weight - first.weight,
      bmi: (latest.bmi ?? NaN) - (first.bmi ?? NaN),
      heightCm: (latest.heightCm ?? NaN) - (first.heightCm ?? NaN),
      bodyFat: latest.bodyFat - first.bodyFat,
      muscleMass: latest.muscleMass - first.muscleMass,
      waterPercentage: latest.waterPercentage - first.waterPercentage,
      calories: latest.calories - first.calories,
      steps: latest.steps - first.steps,
      sleep: latest.sleep - first.sleep
    }

    return {
      latest,
      changes,
      trends,
      period: dates.length
    }
  }, [progressData])

  

  // Get metric data for charts
  const getMetricData = useCallback((metric) => {
    return Object.entries(progressData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        value: data[metric],
        formattedDate: new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      }))
  }, [progressData])

  // Add new metric entry
  const handleAddMetric = useCallback((metric, value, date = new Date()) => {
    const dateKey = typeof date === 'string' ? date : date.toISOString().split('T')[0]
    setProgressData(prev => {
      const base = prev[dateKey] || {
        weight: 70,
        heightCm: 170,
        bmi: 24.2,
        bodyFat: 15,
        muscleMass: 35,
        waterPercentage: 55,
        calories: 1800,
        steps: 8000,
        sleep: 7,
        mood: 3,
        energy: 3,
        stress: 3
      }
      let parsed = parseFloat(value)
      if (metric === 'weight' && weightUnit === 'lbs') parsed = lbsToKg(parsed)
      if (metric === 'heightCm' && heightUnit === 'in') parsed = inToCm(parsed)
      const updated = { ...base, [metric]: parsed }
      const weightKg = updated.weight
      const heightCm = updated.heightCm
      if (weightKg && heightCm) {
        const bmiCalc = weightKg / Math.pow(heightCm / 100, 2)
        updated.bmi = Number(bmiCalc.toFixed(1))
      }
      return { ...prev, [dateKey]: updated }
    })
    setShowAddMetricModal(false)
    setNewMetricValue('')
  }, [weightUnit, heightUnit, lbsToKg, inToCm])
  
  // Handle Add Metric form submission
  const handleAddMetricSubmit = useCallback(() => {
    if (!newMetricValue) return
    
    handleAddMetric(newMetricType, newMetricValue, newMetricDate)
    setNewMetricValue('')
    setNewMetricDate(new Date().toISOString().split('T')[0])
  }, [newMetricType, newMetricValue, newMetricDate, handleAddMetric])

  

  // Export progress data
  const handleExportProgress = useCallback(() => {
    const exportData = {
      progressData,
      progressStats,
      exportDate: new Date().toISOString(),
      user: user?.email,
      selectedPeriod,
      selectedMetric
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `progress-data-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }, [progressData, progressStats, user, selectedPeriod, selectedMetric])

  // Get metric info
  const getMetricInfo = useCallback((metric) => {
    const info = {
      weight: { label: 'Weight', unit: weightUnit, color: 'blue', icon: '⚖️' },
      heightCm: { label: 'Height', unit: heightUnit, color: 'gray', icon: '📏' },
      bmi: { label: 'BMI', unit: '', color: 'blue', icon: '📐' },
      bodyFat: { label: 'Body Fat', unit: '%', color: 'red', icon: '📊' },
      muscleMass: { label: 'Muscle Mass', unit: 'kg', color: 'green', icon: '💪' },
      waterPercentage: { label: 'Water %', unit: '%', color: 'cyan', icon: '💧' },
      calories: { label: 'Calories', unit: 'kcal', color: 'orange', icon: '🔥' },
      steps: { label: 'Steps', unit: 'steps', color: 'purple', icon: '👟' },
      sleep: { label: 'Sleep', unit: 'hrs', color: 'indigo', icon: '😴' },
      mood: { label: 'Mood', unit: '/5', color: 'yellow', icon: '😊' },
      energy: { label: 'Energy', unit: '/5', color: 'green', icon: '⚡' },
      stress: { label: 'Stress', unit: '/5', color: 'red', icon: '😰' }
    }
    return info[metric] || { label: metric, unit: '', color: 'gray', icon: '📈' }
  }, [weightUnit, heightUnit])

  const formatValue = useCallback((value, unit) => {
    if (value === undefined || value === null || Number.isNaN(value)) return '-'
    if (unit === 'kg' || unit === '%' || unit === 'hrs' || unit === '') {
      return Number(value).toFixed(1)
    } else if (unit === 'kcal' || unit === 'steps') {
      return Math.round(Number(value)).toLocaleString()
    } else {
      return Number(value).toFixed(1)
    }
  }, [])

  const getTrendIcon = useCallback((change) => {
    if (typeof change !== 'number' || Number.isNaN(change)) return <div className="h-4 w-4" />
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <div className="h-4 w-4" />
  }, [])

  const getTrendColor = useCallback((change) => {
    if (typeof change !== 'number' || Number.isNaN(change)) return 'text-gray-600'
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }, [])

  if (!progressStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No progress data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Progress Tracking</h2>
          <p className="text-gray-600 mt-1">Monitor your health metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportProgress}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowAnalyticsModal(true)}
            className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setShowAddMetricModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Metric
          </button>
        </div>
      </div>

      {/* Period Selection */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">Progress Overview</h3>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['week', 'month', 'year'].map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectedPeriod === period 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'chart' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Chart
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {['weight', 'bmi', 'bodyFat', 'muscleMass', 'waterPercentage', 'calories', 'steps'].map(metric => {
            const info = getMetricInfo(metric)
            const latestRaw = progressStats.latest[metric]
            const changeRaw = progressStats.changes[metric]
            const latest = convertForDisplay(metric, latestRaw)
            const change = convertDeltaForDisplay(metric, changeRaw)
            
            return (
              <div key={metric} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">{info.icon}</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatValue(latest, info.unit)}
                </div>
                <div className="text-xs text-gray-600 mb-1">{info.label}</div>
                {metric === 'bmi' && (
                  <div className="mb-1">
                    {(() => {
                      const cat = getBmiCategory(progressStats.latest.bmi)
                      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.color}`}>{cat.label}</span>
                    })()}
                  </div>
                )}
                <div className={`flex items-center justify-center text-xs ${getTrendColor(change)}`}>
                  {getTrendIcon(change)}
                  <span className="ml-1">
                    {change > 0 ? '+' : ''}{formatValue(change, info.unit)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Chart Placeholder */}
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <LineChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="font-medium text-gray-900 mb-2">Progress Chart</h4>
          <p className="text-sm text-gray-600">
            Interactive charts showing {selectedMetric} trends over {selectedPeriod} would be displayed here
          </p>
        </div>
      </div>

      

      {/* Add Metric Modal */}
      {showAddMetricModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Metric Entry</h3>
              <button
                onClick={() => setShowAddMetricModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metric Type
                </label>
                <select 
                  value={newMetricType}
                  onChange={(e) => setNewMetricType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                >
                  {['weight', 'heightCm', 'bodyFat', 'muscleMass', 'waterPercentage', 'calories', 'steps', 'sleep', 'mood', 'energy', 'stress'].map(metric => {
                    const info = getMetricInfo(metric)
                    return (
                      <option key={metric} value={metric}>
                        {info.icon} {info.label}
                      </option>
                    )
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newMetricValue}
                  onChange={(e) => setNewMetricValue(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder={`Enter value (${newMetricType === 'weight' ? weightUnit : newMetricType === 'heightCm' ? heightUnit : ''})`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newMetricDate}
                  onChange={(e) => setNewMetricDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddMetricModal(false)
                    setNewMetricValue('')
                    setNewMetricDate(new Date().toISOString().split('T')[0])
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMetricSubmit}
                  disabled={!newMetricValue}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Progress Analytics</h3>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">Progress Trends</h4>
                <p className="text-sm text-gray-600">Detailed progress charts and trends would be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Unit Toggles */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">Units</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Weight</span>
            <select
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Height</span>
            <select
              value={heightUnit}
              onChange={(e) => setHeightUnit(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="cm">cm</option>
              <option value="in">in</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Progress
