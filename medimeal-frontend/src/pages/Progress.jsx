import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Calendar,
  Activity,
  Heart,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Target as TargetIcon,
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  Edit3,
  Trash2,
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
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [viewMode, setViewMode] = useState('chart') // chart, table, summary
  
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
      
      data[dateKey] = {
        weight: 70 + Math.random() * 2 - 1, // 69-71 kg range
        bodyFat: 15 + Math.random() * 3 - 1.5, // 13.5-16.5% range
        muscleMass: 35 + Math.random() * 2 - 1, // 34-36 kg range
        waterPercentage: 55 + Math.random() * 5 - 2.5, // 52.5-57.5% range
        calories: 1800 + Math.random() * 400 - 200, // 1600-2000 range
        steps: 8000 + Math.random() * 4000 - 2000, // 6000-12000 range
        sleep: 7 + Math.random() * 2 - 1, // 6-8 hours range
        mood: Math.floor(Math.random() * 5) + 1, // 1-5 scale
        energy: Math.floor(Math.random() * 5) + 1, // 1-5 scale
        stress: Math.floor(Math.random() * 5) + 1 // 1-5 scale
      }
    }
    
    return data
  })

  // Goals state
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: 'Weight Loss',
      target: 65,
      current: 70.2,
      unit: 'kg',
      deadline: '2024-03-01',
      progress: 70,
      status: 'active'
    },
    {
      id: 2,
      title: 'Daily Steps',
      target: 10000,
      current: 8500,
      unit: 'steps',
      deadline: '2024-02-15',
      progress: 85,
      status: 'active'
    },
    {
      id: 3,
      title: 'Sleep Quality',
      target: 8,
      current: 7.2,
      unit: 'hours',
      deadline: '2024-02-20',
      progress: 90,
      status: 'active'
    }
  ])

  // Calculate progress statistics
  const progressStats = useMemo(() => {
    const dates = Object.keys(progressData).sort()
    if (dates.length < 2) return null

    const latest = progressData[dates[dates.length - 1]]
    const previous = progressData[dates[dates.length - 2]]
    const first = progressData[dates[0]]

    const changes = {
      weight: latest.weight - previous.weight,
      bodyFat: latest.bodyFat - previous.bodyFat,
      muscleMass: latest.muscleMass - previous.muscleMass,
      waterPercentage: latest.waterPercentage - previous.waterPercentage,
      calories: latest.calories - previous.calories,
      steps: latest.steps - previous.steps,
      sleep: latest.sleep - previous.sleep
    }

    const trends = {
      weight: latest.weight - first.weight,
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

  // Calculate goal progress
  const goalProgress = useMemo(() => {
    return goals.map(goal => {
      const progress = Math.min(100, Math.max(0, (goal.current / goal.target) * 100))
      const daysRemaining = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
      
      return {
        ...goal,
        progress,
        daysRemaining,
        isOverdue: daysRemaining < 0,
        isCompleted: progress >= 100
      }
    })
  }, [goals])

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
    setProgressData(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey] || {
          weight: 70,
          bodyFat: 15,
          muscleMass: 35,
          waterPercentage: 55,
          calories: 1800,
          steps: 8000,
          sleep: 7,
          mood: 3,
          energy: 3,
          stress: 3
        },
        [metric]: parseFloat(value)
      }
    }))
    setShowAddMetricModal(false)
    setNewMetricValue('')
  }, [])
  
  // Handle Add Metric form submission
  const handleAddMetricSubmit = useCallback(() => {
    if (!newMetricValue) return
    
    handleAddMetric(newMetricType, newMetricValue, newMetricDate)
    setNewMetricValue('')
    setNewMetricDate(new Date().toISOString().split('T')[0])
  }, [newMetricType, newMetricValue, newMetricDate, handleAddMetric])

  // Add new goal
  const handleAddGoal = useCallback((goalData) => {
    const newGoal = {
      id: Date.now(),
      ...goalData,
      progress: 0,
      status: 'active'
    }
    setGoals(prev => [...prev, newGoal])
    setShowGoalModal(false)
  }, [])

  // Update goal
  const handleUpdateGoal = useCallback((goalId, updates) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    ))
  }, [])

  // Delete goal
  const handleDeleteGoal = useCallback((goalId) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId))
  }, [])

  // Export progress data
  const handleExportProgress = useCallback(() => {
    const exportData = {
      progressData,
      goals: goalProgress,
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
  }, [progressData, goalProgress, progressStats, user, selectedPeriod, selectedMetric])

  // Get metric info
  const getMetricInfo = useCallback((metric) => {
    const info = {
      weight: { label: 'Weight', unit: 'kg', color: 'blue', icon: '⚖️' },
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
  }, [])

  const formatValue = useCallback((value, unit) => {
    if (unit === 'kg' || unit === '%' || unit === 'hrs') {
      return value.toFixed(1)
    } else if (unit === 'kcal' || unit === 'steps') {
      return Math.round(value).toLocaleString()
    } else {
      return value.toFixed(1)
    }
  }, [])

  const getTrendIcon = useCallback((change) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <div className="h-4 w-4" />
  }, [])

  const getTrendColor = useCallback((change) => {
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
          <p className="text-gray-600 mt-1">Monitor your health metrics and goal progress</p>
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
          {['weight', 'bodyFat', 'muscleMass', 'waterPercentage', 'calories', 'steps'].map(metric => {
            const info = getMetricInfo(metric)
            const latest = progressStats.latest[metric]
            const change = progressStats.changes[metric]
            
            return (
              <div key={metric} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">{info.icon}</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatValue(latest, info.unit)}
                </div>
                <div className="text-xs text-gray-600 mb-1">{info.label}</div>
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

      {/* Goals Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Goals</h3>
          <button
            onClick={() => setShowGoalModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </button>
        </div>

        <div className="space-y-4">
          {goalProgress.map(goal => (
            <div key={goal.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <TargetIcon className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{goal.title}</h4>
                    <div className="text-sm text-gray-600">
                      {formatValue(goal.current, goal.unit)} / {formatValue(goal.target, goal.unit)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {goal.isCompleted && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {goal.isOverdue && !goal.isCompleted && (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(goal.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      goal.isCompleted ? 'bg-green-500' : 'bg-green-400'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              {/* Goal Details */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                  <span className={`${goal.isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                    {goal.isOverdue ? 'Overdue' : `${goal.daysRemaining} days left`}
                  </span>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  goal.isCompleted 
                    ? 'bg-green-100 text-green-700' 
                    : goal.isOverdue 
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {goal.isCompleted ? 'Completed' : goal.isOverdue ? 'Overdue' : 'Active'}
                </div>
              </div>
            </div>
          ))}
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
                  {['weight', 'bodyFat', 'muscleMass', 'waterPercentage', 'calories', 'steps', 'sleep', 'mood', 'energy', 'stress'].map(metric => {
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
                  placeholder="Enter value"
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

      {/* Add Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Goal</h3>
              <button
                onClick={() => setShowGoalModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Title
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="e.g., Lose 5kg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Value
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="65"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                    <option value="%">%</option>
                    <option value="steps">steps</option>
                    <option value="hours">hours</option>
                    <option value="kcal">kcal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Goal
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">Progress Trends</h4>
                <p className="text-sm text-gray-600">Detailed progress charts and trends would be displayed here</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <PieChart className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">Goal Distribution</h4>
                <p className="text-sm text-gray-600">Goal completion and distribution charts would be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Progress
