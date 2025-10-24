import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Heart,
  Zap,
  Calendar,
  Clock,
  Download,
  Share2,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  Eye,
  EyeOff,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Bookmark,
  ExternalLink,
  List
} from 'lucide-react'

const Insights = () => {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState('week') // week, month, year
  const [selectedCategory, setSelectedCategory] = useState('all') // all, nutrition, exercise, health
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedInsight, setSelectedInsight] = useState(null)
  const [viewMode, setViewMode] = useState('cards') // cards, list, detailed

  // Insights data state
  const [insights, setInsights] = useState([
    {
      id: 1,
      title: 'Nutrition Pattern Analysis',
      category: 'nutrition',
      type: 'pattern',
      priority: 'high',
      status: 'active',
      description: 'Your protein intake has increased by 15% this week compared to last week.',
      impact: 'positive',
      confidence: 85,
      data: {
        current: 120,
        previous: 104,
        change: 15.4,
        unit: 'g',
        trend: 'up'
      },
      recommendations: [
        'Continue maintaining this protein level for muscle recovery',
        'Consider adding more lean protein sources to your diet',
        'Monitor your overall macronutrient balance'
      ],
      relatedMetrics: ['protein', 'calories', 'muscle_mass'],
      createdAt: new Date('2024-01-15'),
      expiresAt: new Date('2024-01-22'),
      isRead: false,
      isBookmarked: false
    },
    {
      id: 2,
      title: 'Exercise Consistency Alert',
      category: 'exercise',
      type: 'alert',
      priority: 'medium',
      status: 'active',
      description: 'You\'ve missed 3 consecutive workout days. Consider adjusting your schedule.',
      impact: 'negative',
      confidence: 92,
      data: {
        missedDays: 3,
        streak: 0,
        averageWorkouts: 4.2,
        unit: 'days',
        trend: 'down'
      },
      recommendations: [
        'Start with shorter, more manageable workouts',
        'Set realistic weekly exercise goals',
        'Consider morning workouts to avoid evening conflicts'
      ],
      relatedMetrics: ['workout_frequency', 'exercise_duration', 'calories_burned'],
      createdAt: new Date('2024-01-14'),
      expiresAt: new Date('2024-01-21'),
      isRead: false,
      isBookmarked: true
    },
    {
      id: 3,
      title: 'Sleep Quality Improvement',
      category: 'health',
      type: 'achievement',
      priority: 'low',
      status: 'completed',
      description: 'Your sleep quality has improved by 20% over the past month.',
      impact: 'positive',
      confidence: 78,
      data: {
        current: 7.8,
        previous: 6.5,
        change: 20.0,
        unit: 'hours',
        trend: 'up'
      },
      recommendations: [
        'Maintain your current sleep schedule',
        'Continue your evening wind-down routine',
        'Monitor sleep quality during stress periods'
      ],
      relatedMetrics: ['sleep_duration', 'sleep_quality', 'energy_levels'],
      createdAt: new Date('2024-01-10'),
      expiresAt: new Date('2024-01-17'),
      isRead: true,
      isBookmarked: false
    },
    {
      id: 4,
      title: 'Hydration Optimization',
      category: 'health',
      type: 'recommendation',
      priority: 'medium',
      status: 'active',
      description: 'Your water intake is 15% below recommended levels for your activity level.',
      impact: 'neutral',
      confidence: 88,
      data: {
        current: 1.8,
        recommended: 2.1,
        deficit: 15.0,
        unit: 'liters',
        trend: 'stable'
      },
      recommendations: [
        'Increase water intake by 300ml daily',
        'Set hourly water reminders',
        'Include more hydrating foods in your diet'
      ],
      relatedMetrics: ['water_intake', 'hydration_level', 'energy_levels'],
      createdAt: new Date('2024-01-13'),
      expiresAt: new Date('2024-01-20'),
      isRead: false,
      isBookmarked: false
    },
    {
      id: 5,
      title: 'Meal Timing Optimization',
      category: 'nutrition',
      type: 'pattern',
      priority: 'low',
      status: 'active',
      description: 'Your largest meal is consistently at dinner. Consider redistributing calories.',
      impact: 'neutral',
      confidence: 75,
      data: {
        breakfast: 20,
        lunch: 30,
        dinner: 50,
        unit: '%',
        trend: 'stable'
      },
      recommendations: [
        'Increase breakfast calories by 200-300',
        'Reduce dinner portion size slightly',
        'Add a mid-morning snack for better energy distribution'
      ],
      relatedMetrics: ['meal_timing', 'calorie_distribution', 'energy_levels'],
      createdAt: new Date('2024-01-12'),
      expiresAt: new Date('2024-01-19'),
      isRead: false,
      isBookmarked: true
    }
  ])

  // Calculate insight statistics
  const insightStats = useMemo(() => {
    const total = insights.length
    const unread = insights.filter(insight => !insight.isRead).length
    const highPriority = insights.filter(insight => insight.priority === 'high').length
    const bookmarked = insights.filter(insight => insight.isBookmarked).length
    const completed = insights.filter(insight => insight.status === 'completed').length
    
    return {
      total,
      unread,
      highPriority,
      bookmarked,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }, [insights])

  // Filtered insights
  const filteredInsights = useMemo(() => {
    return insights.filter(insight => {
      const matchesCategory = selectedCategory === 'all' || insight.category === selectedCategory
      const matchesPeriod = true // Could add period filtering based on createdAt
      return matchesCategory && matchesPeriod
    })
  }, [insights, selectedCategory])


  // Get priority color
  const getPriorityColor = useCallback((priority) => {
    const colors = {
      'high': 'bg-red-100 text-red-700 border-red-200',
      'medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'low': 'bg-green-100 text-green-700 border-green-200'
    }
    return colors[priority] || 'bg-gray-100 text-gray-700 border-gray-200'
  }, [])

  // Get impact color
  const getImpactColor = useCallback((impact) => {
    const colors = {
      'positive': 'text-green-600',
      'negative': 'text-red-600',
      'neutral': 'text-gray-600'
    }
    return colors[impact] || 'text-gray-600'
  }, [])

  // Get impact icon
  const getImpactIcon = useCallback((impact) => {
    const icons = {
      'positive': <TrendingUp className="h-4 w-4 text-green-600" />,
      'negative': <TrendingDown className="h-4 w-4 text-red-600" />,
      'neutral': <div className="h-4 w-4" />
    }
    return icons[impact] || <div className="h-4 w-4" />
  }, [])

  // Get category icon
  const getCategoryIcon = useCallback((category) => {
    const icons = {
      'nutrition': '🍎',
      'exercise': '💪',
      'health': '❤️',
      'all': '🧠'
    }
    return icons[category] || '📊'
  }, [])

  // Get type icon
  const getTypeIcon = useCallback((type) => {
    const icons = {
      'pattern': <BarChart3 className="h-4 w-4" />,
      'alert': <AlertTriangle className="h-4 w-4" />,
      'achievement': <Award className="h-4 w-4" />,
      'recommendation': <Lightbulb className="h-4 w-4" />
    }
    return icons[type] || <Brain className="h-4 w-4" />
  }, [])

  // Mark insight as read
  const handleMarkAsRead = useCallback((insightId) => {
    setInsights(prev => prev.map(insight => 
      insight.id === insightId ? { ...insight, isRead: true } : insight
    ))
  }, [])

  // Toggle bookmark
  const handleToggleBookmark = useCallback((insightId) => {
    setInsights(prev => prev.map(insight => 
      insight.id === insightId ? { ...insight, isBookmarked: !insight.isBookmarked } : insight
    ))
  }, [])

  // Dismiss insight
  const handleDismissInsight = useCallback((insightId) => {
    setInsights(prev => prev.map(insight => 
      insight.id === insightId ? { ...insight, status: 'dismissed' } : insight
    ))
  }, [])

  // View insight details
  const handleViewDetails = useCallback((insight) => {
    setSelectedInsight(insight)
    setShowDetailModal(true)
    if (!insight.isRead) {
      handleMarkAsRead(insight.id)
    }
  }, [handleMarkAsRead])

  // Export insights
  const handleExportInsights = useCallback(() => {
    const exportData = {
      insights: filteredInsights,
      stats: insightStats,
      exportDate: new Date().toISOString(),
      user: user?.email,
      selectedPeriod,
      selectedCategory
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `insights-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }, [filteredInsights, insightStats, user, selectedPeriod, selectedCategory])

  // Share insight
  const handleShareInsight = useCallback((insight) => {
    if (navigator.share) {
      navigator.share({
        title: insight.title,
        text: insight.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(`${insight.title}: ${insight.description}`)
      alert('Insight copied to clipboard!')
    }
  }, [])

  const formatDate = useCallback((date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }, [])

  const formatChange = useCallback((change, unit) => {
    const sign = change > 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}${unit}`
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Health Insights</h2>
            <p className="text-gray-600">AI-powered health insights and personalized recommendations based on your data</p>
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center text-sm text-gray-600">
                <Brain className="h-4 w-4 mr-1" />
                <span>{insightStats.total} insights available</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>{insightStats.unread} new insights</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Award className="h-4 w-4 mr-1" />
                <span>AI-powered analysis</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportInsights}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              {viewMode === 'cards' ? <List className="h-4 w-4 mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
              {viewMode === 'cards' ? 'List View' : 'Card View'}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{insightStats.total}</div>
          <div className="text-sm text-gray-600">Total Insights</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Eye className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{insightStats.unread}</div>
          <div className="text-sm text-gray-600">Unread</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{insightStats.highPriority}</div>
          <div className="text-sm text-gray-600">High Priority</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Bookmark className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{insightStats.bookmarked}</div>
          <div className="text-sm text-gray-600">Bookmarked</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{insightStats.completionRate}%</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['all', 'nutrition', 'exercise', 'health'].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1 ${
                    selectedCategory === category 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>{getCategoryIcon(category)}</span>
                  <span className="capitalize">{category}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
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
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.length > 0 ? (
          viewMode === 'cards' ? (
            // Card View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInsights.map(insight => (
                <div
                  key={insight.id}
                  className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-green-200 transition-all duration-300 group ${
                    !insight.isRead ? 'border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(insight.type)}
                      <span className="text-lg">{getCategoryIcon(insight.category)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!insight.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      {insight.isBookmarked && (
                        <Bookmark className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                      <button
                        onClick={() => handleDismissInsight(insight.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{insight.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                      {insight.priority}
                    </span>
                    {insight.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-600 ml-2 inline" />
                    )}
                  </div>

                  <p className="text-gray-600 mb-4 text-sm line-clamp-3">{insight.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      {getImpactIcon(insight.impact)}
                      <span className={`text-sm font-medium ${getImpactColor(insight.impact)}`}>
                        {insight.data.change && formatChange(insight.data.change, insight.data.unit)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Confidence: {insight.confidence}% • {formatDate(insight.createdAt)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleViewDetails(insight)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleShareInsight(insight)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </button>
                      <button
                        onClick={() => handleToggleBookmark(insight.id)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center ${
                          insight.isBookmarked 
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Bookmark className={`h-4 w-4 mr-1 ${insight.isBookmarked ? 'fill-current' : ''}`} />
                        {insight.isBookmarked ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="space-y-4">
              {filteredInsights.map(insight => (
                <div
                  key={insight.id}
                  className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-green-200 transition-all duration-300 group ${
                    !insight.isRead ? 'border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(insight.type)}
                          <span className="text-lg">{getCategoryIcon(insight.category)}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                          {insight.priority}
                        </span>
                        {insight.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>

                      <p className="text-gray-600 mb-4">{insight.description}</p>

                      <div className="flex items-center space-x-6 mb-4">
                        <div className="flex items-center space-x-2">
                          {getImpactIcon(insight.impact)}
                          <span className={`text-sm font-medium ${getImpactColor(insight.impact)}`}>
                            {insight.data.change && formatChange(insight.data.change, insight.data.unit)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Confidence: {insight.confidence}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(insight.createdAt)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleViewDetails(insight)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleShareInsight(insight)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors flex items-center"
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </button>
                        <button
                          onClick={() => handleToggleBookmark(insight.id)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${
                            insight.isBookmarked 
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Bookmark className={`h-4 w-4 mr-1 ${insight.isBookmarked ? 'fill-current' : ''}`} />
                          {insight.isBookmarked ? 'Bookmarked' : 'Bookmark'}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {!insight.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      {insight.isBookmarked && (
                        <Bookmark className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                      <button
                        onClick={() => handleDismissInsight(insight.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No insights available</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We're analyzing your health data to generate personalized insights and recommendations. 
              Check back soon for AI-powered health insights!
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Analyzing nutrition data
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                Processing exercise patterns
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
                Generating recommendations
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Insight Detail Modal */}
      {showDetailModal && selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {getTypeIcon(selectedInsight.type)}
                <span className="text-xl">{getCategoryIcon(selectedInsight.category)}</span>
                <h3 className="text-xl font-semibold text-gray-900">{selectedInsight.title}</h3>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{selectedInsight.description}</p>
              </div>

              {/* Data */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Data Analysis</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Current Value</div>
                      <div className="font-semibold text-gray-900">
                        {selectedInsight.data.current} {selectedInsight.data.unit}
                      </div>
                    </div>
                    {selectedInsight.data.previous && (
                      <div>
                        <div className="text-sm text-gray-600">Previous Value</div>
                        <div className="font-semibold text-gray-900">
                          {selectedInsight.data.previous} {selectedInsight.data.unit}
                        </div>
                      </div>
                    )}
                    {selectedInsight.data.change && (
                      <div>
                        <div className="text-sm text-gray-600">Change</div>
                        <div className={`font-semibold ${getImpactColor(selectedInsight.impact)}`}>
                          {formatChange(selectedInsight.data.change, selectedInsight.data.unit)}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-gray-600">Confidence</div>
                      <div className="font-semibold text-gray-900">{selectedInsight.confidence}%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                <ul className="space-y-2">
                  {selectedInsight.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Related Metrics */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Related Metrics</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedInsight.relatedMetrics.map((metric, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                    >
                      {metric.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleShareInsight(selectedInsight)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </button>
                <button
                  onClick={() => handleToggleBookmark(selectedInsight.id)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${selectedInsight.isBookmarked ? 'text-yellow-500 fill-current' : ''}`} />
                  {selectedInsight.isBookmarked ? 'Unbookmark' : 'Bookmark'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  )
}

export default Insights
