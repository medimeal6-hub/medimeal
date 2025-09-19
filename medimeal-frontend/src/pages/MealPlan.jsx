import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Calendar,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Download,
  Upload,
  Target,
  TrendingUp,
  Zap,
  Clock,
  Utensils,
  Heart,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Settings,
  Share2,
  Bookmark,
  Filter,
  Search,
  Grid,
  List,
  MoreHorizontal,
  X
} from 'lucide-react'
import ImagePlaceholder from '../components/ImagePlaceholder'
import mealsData from '../data/meals.json'

const MealPlan = () => {
  const { user } = useAuth()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [viewMode, setViewMode] = useState('week') // week, day, month
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showMealModal, setShowMealModal] = useState(false)
  const [showNutritionModal, setShowNutritionModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [draggedMeal, setDraggedMeal] = useState(null)

  // Meal plan state
  const [mealPlan, setMealPlan] = useState(() => {
    // Initialize with sample meal plan data
    const today = new Date()
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
    
    return {
      [weekStart.toISOString().split('T')[0]]: {
        breakfast: mealsData[0],
        lunch: mealsData[1],
        dinner: mealsData[2],
        snacks: [mealsData[3]]
      }
    }
  })

  // Get week dates
  const weekDates = useMemo(() => {
    const start = new Date(currentWeek)
    start.setDate(start.getDate() - start.getDay())
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      return date
    })
  }, [currentWeek])

  // Calculate nutrition totals for the week
  const weeklyNutrition = useMemo(() => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      sugar: 0
    }

    Object.values(mealPlan).forEach(dayMeals => {
      Object.values(dayMeals).forEach(meal => {
        if (Array.isArray(meal)) {
          meal.forEach(m => {
            totals.calories += m.calories || 0
            totals.protein += m.protein || 0
            totals.carbs += m.carbs || 0
            totals.fats += m.fats || 0
          })
        } else if (meal) {
          totals.calories += meal.calories || 0
          totals.protein += meal.protein || 0
          totals.carbs += meal.carbs || 0
          totals.fats += meal.fats || 0
        }
      })
    })

    return totals
  }, [mealPlan])

  // Navigation handlers
  const navigateWeek = useCallback((direction) => {
    setCurrentWeek(prev => {
      const newWeek = new Date(prev)
      newWeek.setDate(prev.getDate() + (direction * 7))
      return newWeek
    })
  }, [])

  const goToCurrentWeek = useCallback(() => {
    setCurrentWeek(new Date())
  }, [])

  // Meal plan handlers
  const handleAddMeal = useCallback((date, mealType) => {
    setSelectedDate(date)
    setShowMealModal(true)
  }, [])

  const handleRemoveMeal = useCallback((date, mealType, mealIndex = null) => {
    const dateKey = date.toISOString().split('T')[0]
    setMealPlan(prev => {
      const newPlan = { ...prev }
      if (mealIndex !== null) {
        // Remove specific snack
        newPlan[dateKey][mealType] = newPlan[dateKey][mealType].filter((_, i) => i !== mealIndex)
      } else {
        // Remove entire meal
        newPlan[dateKey][mealType] = null
      }
      return newPlan
    })
  }, [])

  const handleDuplicateMeal = useCallback((date, mealType, meal) => {
    const dateKey = date.toISOString().split('T')[0]
    setMealPlan(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [mealType]: mealType === 'snacks' ? [...(prev[dateKey]?.[mealType] || []), meal] : meal
      }
    }))
  }, [])

  const handleDragStart = useCallback((meal, mealType) => {
    setDraggedMeal({ meal, mealType })
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e, targetDate, targetMealType) => {
    e.preventDefault()
    if (draggedMeal) {
      const dateKey = targetDate.toISOString().split('T')[0]
      setMealPlan(prev => ({
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          [targetMealType]: targetMealType === 'snacks' 
            ? [...(prev[dateKey]?.[targetMealType] || []), draggedMeal.meal]
            : draggedMeal.meal
        }
      }))
      setDraggedMeal(null)
    }
  }, [draggedMeal])

  const handleExportMealPlan = useCallback(() => {
    const exportData = {
      mealPlan,
      weeklyNutrition,
      exportDate: new Date().toISOString(),
      user: user?.email,
      weekDates: weekDates.map(d => d.toISOString().split('T')[0])
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `meal-plan-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }, [mealPlan, weeklyNutrition, user, weekDates])

  const handleShareMealPlan = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: 'My Meal Plan',
        text: `Check out my weekly meal plan with ${weeklyNutrition.calories} total calories!`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(`My Meal Plan: ${weeklyNutrition.calories} calories this week`)
      alert('Meal plan copied to clipboard!')
    }
  }, [weeklyNutrition])

  const getMealTypeColor = useCallback((mealType) => {
    const colors = {
      breakfast: 'bg-orange-100 text-orange-700 border-orange-200',
      lunch: 'bg-green-100 text-green-700 border-green-200',
      dinner: 'bg-purple-100 text-purple-700 border-purple-200',
      snacks: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    }
    return colors[mealType] || 'bg-gray-100 text-gray-700 border-gray-200'
  }, [])

  const getMealTypeIcon = useCallback((mealType) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snacks: '🍎'
    }
    return icons[mealType] || '🍽️'
  }, [])

  const formatDate = useCallback((date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }, [])

  const isToday = useCallback((date) => {
    return date.toDateString() === new Date().toDateString()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meal Plan</h2>
          <p className="text-gray-600 mt-1">Plan your weekly meals and track your nutrition</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleShareMealPlan}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
          <button
            onClick={handleExportMealPlan}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowMealModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Meal
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h3 className="text-xl font-semibold text-gray-900">
              {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </h3>
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={goToCurrentWeek}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              This Week
            </button>
            <button
              onClick={() => setShowNutritionModal(true)}
              className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              <Target className="h-4 w-4 mr-2" />
              Nutrition
            </button>
          </div>
        </div>

        {/* Weekly Nutrition Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{weeklyNutrition.calories}</div>
            <div className="text-xs text-green-600">Calories</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{weeklyNutrition.protein}g</div>
            <div className="text-xs text-blue-600">Protein</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-700">{weeklyNutrition.carbs}g</div>
            <div className="text-xs text-yellow-600">Carbs</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">{weeklyNutrition.fats}g</div>
            <div className="text-xs text-purple-600">Fats</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-700">{weeklyNutrition.fiber}g</div>
            <div className="text-xs text-orange-600">Fiber</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{weeklyNutrition.sugar}g</div>
            <div className="text-xs text-red-600">Sugar</div>
          </div>
        </div>

        {/* Weekly Meal Plan Grid */}
        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date, index) => {
            const dateKey = date.toISOString().split('T')[0]
            const dayMeals = mealPlan[dateKey] || {}
            
            return (
              <div
                key={dateKey}
                className={`border rounded-xl p-4 ${
                  isToday(date) 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                {/* Day Header */}
                <div className="text-center mb-4">
                  <div className={`text-sm font-medium ${
                    isToday(date) ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {formatDate(date)}
                  </div>
                  {isToday(date) && (
                    <div className="text-xs text-green-600 mt-1">Today</div>
                  )}
                </div>

                {/* Meal Types */}
                {['breakfast', 'lunch', 'dinner', 'snacks'].map(mealType => (
                  <div key={mealType} className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm">{getMealTypeIcon(mealType)}</span>
                        <span className="text-xs font-medium text-gray-600 capitalize">
                          {mealType}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddMeal(date, mealType)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>

                    {/* Meal Content */}
                    <div
                      className={`min-h-[60px] border-2 border-dashed border-gray-300 rounded-lg p-2 ${
                        draggedMeal ? 'border-green-400 bg-green-50' : ''
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, date, mealType)}
                    >
                      {dayMeals[mealType] ? (
                        Array.isArray(dayMeals[mealType]) ? (
                          // Multiple snacks
                          dayMeals[mealType].map((meal, mealIndex) => (
                            <div
                              key={`${meal.id}-${mealIndex}`}
                              className={`p-2 rounded border ${getMealTypeColor(mealType)} mb-1`}
                              draggable
                              onDragStart={() => handleDragStart(meal, mealType)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate">
                                    {meal.name}
                                  </div>
                                  <div className="text-xs opacity-75">
                                    {meal.calories} kcal
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => handleDuplicateMeal(date, mealType, meal)}
                                    className="p-1 hover:bg-white/20 rounded"
                                  >
                                    <Copy className="h-2 w-2" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveMeal(date, mealType, mealIndex)}
                                    className="p-1 hover:bg-white/20 rounded"
                                  >
                                    <Trash2 className="h-2 w-2" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          // Single meal
                          <div
                            className={`p-2 rounded border ${getMealTypeColor(mealType)}`}
                            draggable
                            onDragStart={() => handleDragStart(dayMeals[mealType], mealType)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium truncate">
                                  {dayMeals[mealType].name}
                                </div>
                                <div className="text-xs opacity-75">
                                  {dayMeals[mealType].calories} kcal
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleDuplicateMeal(date, mealType, dayMeals[mealType])}
                                  className="p-1 hover:bg-white/20 rounded"
                                >
                                  <Copy className="h-2 w-2" />
                                </button>
                                <button
                                  onClick={() => handleRemoveMeal(date, mealType)}
                                  className="p-1 hover:bg-white/20 rounded"
                                >
                                  <Trash2 className="h-2 w-2" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="text-xs text-gray-400 text-center py-2">
                          No {mealType}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Meal Selection Modal */}
      {showMealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Meal</h3>
              <button
                onClick={() => setShowMealModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            
            {/* Search and Filter */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search meals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            </div>

            {/* Meal Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mealsData
                .filter(meal => 
                  !searchQuery || meal.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(meal => (
                  <div
                    key={meal.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      // Add meal to selected date and meal type
                      setShowMealModal(false)
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <ImagePlaceholder
                        width={48}
                        height={48}
                        text={`🍽️ ${meal.type}`}
                        bgColor={meal.type === 'Breakfast' ? "#fef3c7" : meal.type === 'Lunch' ? "#f0fdf4" : "#fef2f2"}
                        textColor={meal.type === 'Breakfast' ? "#d97706" : meal.type === 'Lunch' ? "#16a34a" : "#dc2626"}
                        className="rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{meal.name}</h4>
                        <div className="text-xs text-gray-600">
                          {meal.calories} kcal • {meal.protein}g protein
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Nutrition Analytics Modal */}
      {showNutritionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Nutrition Analytics</h3>
              <button
                onClick={() => setShowNutritionModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* Nutrition Charts Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">Weekly Trends</h4>
                <p className="text-sm text-gray-600">Nutrition charts would be displayed here</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Target className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">Goals Progress</h4>
                <p className="text-sm text-gray-600">Goal tracking would be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MealPlan
