import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Utensils,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Heart,
  Zap,
  AlertTriangle,
  CheckCircle,
  Edit3,
  Trash2,
  Copy,
  Download,
  Upload,
  Share2,
  Bookmark,
  Star,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X
} from 'lucide-react'
import ImagePlaceholder from '../components/ImagePlaceholder'
import mealsData from '../data/meals.json'

const FoodDiary = () => {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showAddMealModal, setShowAddMealModal] = useState(false)
  const [showNutritionModal, setShowNutritionModal] = useState(false)
  const [viewMode, setViewMode] = useState('day') // day, week, month
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Food diary state
  const [foodEntries, setFoodEntries] = useState(() => {
    const today = new Date().toISOString().split('T')[0]
    return {
      [today]: {
        breakfast: [
          { id: 1, meal: mealsData[0], quantity: 1, time: '08:00', notes: 'Delicious!' },
          { id: 2, meal: mealsData[1], quantity: 0.5, time: '08:30', notes: 'Half portion' }
        ],
        lunch: [
          { id: 3, meal: mealsData[2], quantity: 1, time: '12:30', notes: 'Very filling' }
        ],
        dinner: [
          { id: 4, meal: mealsData[3], quantity: 1, time: '19:00', notes: 'Light dinner' }
        ],
        snacks: [
          { id: 5, meal: mealsData[4], quantity: 1, time: '15:00', notes: 'Afternoon snack' }
        ]
      }
    }
  })

  // Calculate daily nutrition totals
  const dailyNutrition = useMemo(() => {
    const dateKey = selectedDate.toISOString().split('T')[0]
    const dayEntries = foodEntries[dateKey] || {}
    
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      water: 0
    }

    Object.values(dayEntries).forEach(mealType => {
      if (Array.isArray(mealType)) {
        mealType.forEach(entry => {
          const multiplier = entry.quantity || 1
          totals.calories += (entry.meal.calories || 0) * multiplier
          totals.protein += (entry.meal.protein || 0) * multiplier
          totals.carbs += (entry.meal.carbs || 0) * multiplier
          totals.fats += (entry.meal.fats || 0) * multiplier
        })
      }
    })

    return totals
  }, [foodEntries, selectedDate])

  // Calculate weekly nutrition averages
  const weeklyNutrition = useMemo(() => {
    const weekStart = new Date(selectedDate)
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay())
    
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      days: 0
    }

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const dateKey = date.toISOString().split('T')[0]
      const dayEntries = foodEntries[dateKey] || {}
      
      let dayCalories = 0
      Object.values(dayEntries).forEach(mealType => {
        if (Array.isArray(mealType)) {
          mealType.forEach(entry => {
            dayCalories += (entry.meal.calories || 0) * (entry.quantity || 1)
          })
        }
      })
      
      if (dayCalories > 0) {
        totals.calories += dayCalories
        totals.days++
      }
    }

    return {
      ...totals,
      averageCalories: totals.days > 0 ? Math.round(totals.calories / totals.days) : 0
    }
  }, [foodEntries, selectedDate])

  // Navigation handlers
  const navigateDate = useCallback((direction) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + direction)
      return newDate
    })
  }, [])

  const goToToday = useCallback(() => {
    setSelectedDate(new Date())
  }, [])

  // Food entry handlers
  const handleAddMeal = useCallback((mealType, meal) => {
    const dateKey = selectedDate.toISOString().split('T')[0]
    const newEntry = {
      id: Date.now(),
      meal,
      quantity: 1,
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      notes: ''
    }

    setFoodEntries(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [mealType]: [...(prev[dateKey]?.[mealType] || []), newEntry]
      }
    }))
    setShowAddMealModal(false)
  }, [selectedDate])

  const handleRemoveEntry = useCallback((mealType, entryId) => {
    const dateKey = selectedDate.toISOString().split('T')[0]
    setFoodEntries(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [mealType]: prev[dateKey]?.[mealType]?.filter(entry => entry.id !== entryId) || []
      }
    }))
  }, [selectedDate])

  const handleUpdateQuantity = useCallback((mealType, entryId, newQuantity) => {
    const dateKey = selectedDate.toISOString().split('T')[0]
    setFoodEntries(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [mealType]: prev[dateKey]?.[mealType]?.map(entry => 
          entry.id === entryId ? { ...entry, quantity: newQuantity } : entry
        ) || []
      }
    }))
  }, [selectedDate])

  const handleUpdateNotes = useCallback((mealType, entryId, newNotes) => {
    const dateKey = selectedDate.toISOString().split('T')[0]
    setFoodEntries(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [mealType]: prev[dateKey]?.[mealType]?.map(entry => 
          entry.id === entryId ? { ...entry, notes: newNotes } : entry
        ) || []
      }
    }))
  }, [selectedDate])

  const handleDuplicateEntry = useCallback((mealType, entry) => {
    const dateKey = selectedDate.toISOString().split('T')[0]
    const newEntry = {
      ...entry,
      id: Date.now(),
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    }

    setFoodEntries(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [mealType]: [...(prev[dateKey]?.[mealType] || []), newEntry]
      }
    }))
  }, [selectedDate])

  const handleExportDiary = useCallback(() => {
    const exportData = {
      foodEntries,
      dailyNutrition,
      weeklyNutrition,
      exportDate: new Date().toISOString(),
      user: user?.email,
      selectedDate: selectedDate.toISOString().split('T')[0]
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `food-diary-${selectedDate.toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }, [foodEntries, dailyNutrition, weeklyNutrition, user, selectedDate])

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
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }, [])

  const isToday = useCallback((date) => {
    return date.toDateString() === new Date().toDateString()
  }, [])

  const dateKey = selectedDate.toISOString().split('T')[0]
  const dayEntries = foodEntries[dateKey] || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Food Diary</h2>
          <p className="text-gray-600 mt-1">Track your daily food intake and nutrition</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportDiary}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowNutritionModal(true)}
            className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setShowAddMealModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Food
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {formatDate(selectedDate)}
              </h3>
              {isToday(selectedDate) && (
                <div className="text-sm text-green-600 font-medium">Today</div>
              )}
            </div>
            <button
              onClick={() => navigateDate(1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              Today
            </button>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'day' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'week' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Week
              </button>
            </div>
          </div>
        </div>

        {/* Daily Nutrition Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{dailyNutrition.calories}</div>
            <div className="text-xs text-green-600">Calories</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{dailyNutrition.protein}g</div>
            <div className="text-xs text-blue-600">Protein</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-700">{dailyNutrition.carbs}g</div>
            <div className="text-xs text-yellow-600">Carbs</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">{dailyNutrition.fats}g</div>
            <div className="text-xs text-purple-600">Fats</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-700">{dailyNutrition.fiber}g</div>
            <div className="text-xs text-orange-600">Fiber</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{dailyNutrition.sugar}g</div>
            <div className="text-xs text-red-600">Sugar</div>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-indigo-700">{dailyNutrition.sodium}mg</div>
            <div className="text-xs text-indigo-600">Sodium</div>
          </div>
          <div className="bg-cyan-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-700">{dailyNutrition.water}ml</div>
            <div className="text-xs text-cyan-600">Water</div>
          </div>
        </div>

        {/* Weekly Summary */}
        {viewMode === 'week' && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Weekly Average</h4>
              <div className="text-sm text-gray-600">
                {weeklyNutrition.days} days logged
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-green-700">
              {weeklyNutrition.averageCalories} calories/day
            </div>
          </div>
        )}

        {/* Meal Types */}
        <div className="space-y-6">
          {['breakfast', 'lunch', 'dinner', 'snacks'].map(mealType => {
            const entries = dayEntries[mealType] || []
            const mealTypeNutrition = entries.reduce((totals, entry) => {
              const multiplier = entry.quantity || 1
              return {
                calories: totals.calories + (entry.meal.calories || 0) * multiplier,
                protein: totals.protein + (entry.meal.protein || 0) * multiplier,
                carbs: totals.carbs + (entry.meal.carbs || 0) * multiplier,
                fats: totals.fats + (entry.meal.fats || 0) * multiplier
              }
            }, { calories: 0, protein: 0, carbs: 0, fats: 0 })

            return (
              <div key={mealType} className="border border-gray-200 rounded-xl p-6">
                {/* Meal Type Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getMealTypeIcon(mealType)}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 capitalize">{mealType}</h4>
                      <div className="text-sm text-gray-600">
                        {mealTypeNutrition.calories} calories • {mealTypeNutrition.protein}g protein
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddMealModal(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                {/* Food Entries */}
                <div className="space-y-3">
                  {entries.length > 0 ? (
                    entries.map(entry => (
                      <div
                        key={entry.id}
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <ImagePlaceholder
                          width={48}
                          height={48}
                          text={`🍽️ ${entry.meal.type}`}
                          bgColor={entry.meal.type === 'Breakfast' ? "#fef3c7" : entry.meal.type === 'Lunch' ? "#f0fdf4" : "#fef2f2"}
                          textColor={entry.meal.type === 'Breakfast' ? "#d97706" : entry.meal.type === 'Lunch' ? "#16a34a" : "#dc2626"}
                          className="rounded-lg"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium text-gray-900 truncate">
                              {entry.meal.name}
                            </h5>
                            <span className="text-sm text-gray-500">
                              {entry.time}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {entry.meal.calories * entry.quantity} calories • {entry.meal.protein * entry.quantity}g protein
                          </div>
                          {entry.notes && (
                            <div className="text-sm text-gray-500 italic mt-1">
                              "{entry.notes}"
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleUpdateQuantity(mealType, entry.id, Math.max(0.1, entry.quantity - 0.1))}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <span className="text-sm font-bold">-</span>
                            </button>
                            <span className="text-sm font-medium w-8 text-center">
                              {entry.quantity}x
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(mealType, entry.id, entry.quantity + 0.1)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <span className="text-sm font-bold">+</span>
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleDuplicateEntry(mealType, entry)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Copy className="h-3 w-3 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleRemoveEntry(mealType, entry.id)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Trash2 className="h-3 w-3 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Utensils className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No {mealType} logged yet</p>
                      <button
                        onClick={() => setShowAddMealModal(true)}
                        className="text-green-600 hover:text-green-700 font-medium mt-2"
                      >
                        Add your first {mealType}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Meal Modal */}
      {showAddMealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Food Entry</h3>
              <button
                onClick={() => setShowAddMealModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            
            {/* Search */}
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

            {/* Meal Selection */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Select Meal Type:</h4>
              <div className="grid grid-cols-2 gap-3">
                {['breakfast', 'lunch', 'dinner', 'snacks'].map(mealType => (
                  <button
                    key={mealType}
                    onClick={() => {
                      // This would open meal selection for specific meal type
                      setShowAddMealModal(false)
                    }}
                    className={`p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors ${getMealTypeColor(mealType)}`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getMealTypeIcon(mealType)}</span>
                      <span className="font-medium capitalize">{mealType}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Meal Grid */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Available Meals:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {mealsData
                  .filter(meal => 
                    !searchQuery || meal.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(meal => (
                    <div
                      key={meal.id}
                      className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        // Add meal to selected meal type
                        setShowAddMealModal(false)
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <ImagePlaceholder
                          width={40}
                          height={40}
                          text={`🍽️ ${meal.type}`}
                          bgColor={meal.type === 'Breakfast' ? "#fef3c7" : meal.type === 'Lunch' ? "#f0fdf4" : "#fef2f2"}
                          textColor={meal.type === 'Breakfast' ? "#d97706" : meal.type === 'Lunch' ? "#16a34a" : "#dc2626"}
                          className="rounded-lg"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 text-sm">{meal.name}</h5>
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

            {/* Analytics Charts Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <PieChart className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">Macro Distribution</h4>
                <p className="text-sm text-gray-600">Nutrition breakdown charts would be displayed here</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">Weekly Trends</h4>
                <p className="text-sm text-gray-600">Calorie and nutrition trends would be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FoodDiary
