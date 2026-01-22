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
  X,
  ShoppingCart,
  Star,
  Info,
  ChefHat,
  Apple,
  Flame,
  Droplet,
  Scale
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
  const [showShoppingListModal, setShowShoppingListModal] = useState(false)
  const [showGoalsModal, setShowGoalsModal] = useState(false)
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [draggedMeal, setDraggedMeal] = useState(null)
  const [selectedMealType, setSelectedMealType] = useState(null)
  const [mealFilters, setMealFilters] = useState({
    maxCalories: '',
    minProtein: '',
    mealType: 'all'
  })
  
  // Nutrition goals
  const [nutritionGoals, setNutritionGoals] = useState({
    dailyCalories: 2000,
    dailyProtein: 150,
    dailyCarbs: 250,
    dailyFats: 65,
    dailyFiber: 30,
    dailySugar: 50
  })

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
    setSelectedMealType(mealType)
    setShowMealModal(true)
  }, [])

  // Add selected meal to the plan
  const handleSelectMeal = useCallback((meal) => {
    const dateKey = selectedDate.toISOString().split('T')[0]
    
    setMealPlan(prev => {
      const newPlan = { ...prev }
      
      // Ensure the date entry exists
      if (!newPlan[dateKey]) {
        newPlan[dateKey] = { breakfast: null, lunch: null, dinner: null, snacks: [] }
      }
      
      // Add meal to the appropriate slot
      if (selectedMealType === 'snacks') {
        // For snacks, add to array
        newPlan[dateKey][selectedMealType] = [
          ...(newPlan[dateKey][selectedMealType] || []),
          meal
        ]
      } else {
        // For other meal types, replace
        newPlan[dateKey][selectedMealType] = meal
      }
      
      return newPlan
    })
    
    // Close modal and reset
    setShowMealModal(false)
    setSearchQuery('')
    setMealFilters({ maxCalories: '', minProtein: '', mealType: 'all' })
  }, [selectedDate, selectedMealType])

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

  // Calculate daily nutrition for each day
  const dailyNutrition = useMemo(() => {
    const daily = {}
    Object.keys(mealPlan).forEach(dateKey => {
      const dayMeals = mealPlan[dateKey]
      const totals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        sugar: 0,
        prepTime: 0
      }
      
      Object.values(dayMeals).forEach(meal => {
        if (Array.isArray(meal)) {
          meal.forEach(m => {
            totals.calories += m.calories || 0
            totals.protein += m.protein || 0
            totals.carbs += m.carbs || 0
            totals.fats += m.fats || 0
            totals.fiber += m.fiber || 0
            totals.sugar += m.sugar || 0
            totals.prepTime += parseInt(m.cookDuration) || 0
          })
        } else if (meal) {
          totals.calories += meal.calories || 0
          totals.protein += meal.protein || 0
          totals.carbs += meal.carbs || 0
          totals.fats += meal.fats || 0
          totals.fiber += meal.fiber || 0
          totals.sugar += meal.sugar || 0
          totals.prepTime += parseInt(meal.cookDuration) || 0
        }
      })
      
      daily[dateKey] = totals
    })
    return daily
  }, [mealPlan])

  // Filter meals for the modal
  const filteredMeals = useMemo(() => {
    return mealsData.filter(meal => {
      // Search query filter
      if (searchQuery && !meal.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      // Calories filter
      if (mealFilters.maxCalories && meal.calories > parseInt(mealFilters.maxCalories)) {
        return false
      }
      // Protein filter
      if (mealFilters.minProtein && meal.protein < parseInt(mealFilters.minProtein)) {
        return false
      }
      // Meal type filter
      if (mealFilters.mealType !== 'all' && meal.type !== mealFilters.mealType) {
        return false
      }
      return true
    })
  }, [searchQuery, mealFilters])

  // Generate shopping list
  const generateShoppingList = useCallback(() => {
    const ingredients = new Map()
    
    Object.values(mealPlan).forEach(dayMeals => {
      Object.values(dayMeals).forEach(meal => {
        if (Array.isArray(meal)) {
          meal.forEach(m => {
            if (m.ingredients && Array.isArray(m.ingredients)) {
              m.ingredients.forEach(ing => {
                ingredients.set(ing, (ingredients.get(ing) || 0) + 1)
              })
            }
          })
        } else if (meal && meal.ingredients && Array.isArray(meal.ingredients)) {
          meal.ingredients.forEach(ing => {
            ingredients.set(ing, (ingredients.get(ing) || 0) + 1)
          })
        }
      })
    })
    
    return Array.from(ingredients.entries()).map(([item, count]) => ({
      item,
      count: count > 1 ? `${count}x` : ''
    }))
  }, [mealPlan])

  // Calculate meal variety score
  const varietyScore = useMemo(() => {
    const uniqueMeals = new Set()
    Object.values(mealPlan).forEach(dayMeals => {
      Object.values(dayMeals).forEach(meal => {
        if (Array.isArray(meal)) {
          meal.forEach(m => uniqueMeals.add(m.id))
        } else if (meal) {
          uniqueMeals.add(meal.id)
        }
      })
    })
    const totalMeals = Object.values(mealPlan).reduce((sum, dayMeals) => {
      return sum + Object.values(dayMeals).filter(m => m).length
    }, 0)
    return totalMeals > 0 ? Math.round((uniqueMeals.size / totalMeals) * 100) : 0
  }, [mealPlan])

  // Meal plan templates
  const mealPlanTemplates = {
    mediterranean: {
      name: 'Mediterranean Diet',
      description: 'Rich in vegetables, fruits, whole grains, and healthy fats',
      meals: {
        breakfast: ['Greek Yogurt with Honey and Nuts', 'Avocado Toast with Poached Egg'],
        lunch: ['Quinoa Salad with Grilled Chicken and Vegetables', 'Mediterranean Chicken Wrap'],
        dinner: ['Grilled Vegetable Pasta', 'Baked Salmon with Sweet Potato and Broccoli'],
        snacks: ['Mixed Berry Smoothie Bowl']
      }
    },
    lowCarb: {
      name: 'Low-Carb Diet',
      description: 'Focus on protein and healthy fats with minimal carbs',
      meals: {
        breakfast: ['Avocado Toast with Poached Egg'],
        lunch: ['Grilled Turkey Breast with Steamed Asparagus and Brown Rice'],
        dinner: ['Baked Salmon with Sweet Potato and Broccoli'],
        snacks: ['Greek Yogurt with Honey and Nuts']
      }
    },
    balanced: {
      name: 'Balanced Nutrition',
      description: 'Well-rounded meals for optimal health',
      meals: {
        breakfast: ['Healthy Breakfast Bowl with Greek Yogurt and Berries'],
        lunch: ['Quinoa Salad with Grilled Chicken and Vegetables'],
        dinner: ['Baked Salmon with Sweet Potato and Broccoli'],
        snacks: ['Mixed Berry Smoothie Bowl']
      }
    }
  }

  const applyTemplate = useCallback((template) => {
    const newPlan = {}
    weekDates.forEach(date => {
      const dateKey = date.toISOString().split('T')[0]
      newPlan[dateKey] = {}
      
      Object.keys(template.meals).forEach(mealType => {
        const mealNames = template.meals[mealType]
        const selectedMeals = mealsData
          .filter(meal => mealNames.includes(meal.name))
          .slice(0, mealType === 'snacks' ? 1 : 1)
        
        if (mealType === 'snacks') {
          newPlan[dateKey][mealType] = selectedMeals
        } else {
          newPlan[dateKey][mealType] = selectedMeals[0] || null
        }
      })
    })
    
    setMealPlan(newPlan)
    setShowTemplatesModal(false)
  }, [weekDates])

  // Export shopping list
  const exportShoppingList = useCallback(() => {
    const shoppingList = generateShoppingList()
    const listText = shoppingList.map(({ item, count }) => 
      `- ${count ? count + ' ' : ''}${item}`
    ).join('\n')
    
    const blob = new Blob([listText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `shopping-list-${new Date().toISOString().split('T')[0]}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }, [generateShoppingList])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Meal Plan</h2>
            <p className="text-gray-600 mt-1">Plan your weekly meals and track your nutrition</p>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setShowTemplatesModal(true)}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Templates
            </button>
            <button
              onClick={() => setShowShoppingListModal(true)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Shopping List
            </button>
            <button
              onClick={() => setShowGoalsModal(true)}
              className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              <Target className="h-4 w-4 mr-2" />
              Set Goals
            </button>
            <button
              onClick={handleShareMealPlan}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
            <button
              onClick={handleExportMealPlan}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
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
        
        {/* Quick Stats Bar */}
        <div className="flex flex-wrap items-center gap-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Apple className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Variety Score</div>
              <div className="text-sm font-semibold text-gray-900">{varietyScore}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Avg Prep Time</div>
              <div className="text-sm font-semibold text-gray-900">
                {Math.round(Object.values(dailyNutrition).reduce((sum, day) => sum + day.prepTime, 0) / weekDates.length)} min/day
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Flame className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Weekly Avg Calories</div>
              <div className="text-sm font-semibold text-gray-900">
                {Math.round(weeklyNutrition.calories / weekDates.length)} kcal/day
              </div>
            </div>
          </div>
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
                <div className="text-center mb-3">
                  <div className={`text-sm font-medium ${
                    isToday(date) ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {formatDate(date)}
                  </div>
                  {isToday(date) && (
                    <div className="text-xs text-green-600 mt-1">Today</div>
                  )}
                </div>

                {/* Daily Nutrition Progress */}
                {dailyNutrition[dateKey] && (
                  <div className="mb-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Calories</span>
                      <span className="font-medium">{Math.round(dailyNutrition[dateKey].calories)} / {nutritionGoals.dailyCalories}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-green-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min((dailyNutrition[dateKey].calories / nutritionGoals.dailyCalories) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{dailyNutrition[dateKey].prepTime} min prep</span>
                    </div>
                  </div>
                )}

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
                              className={`p-2 rounded-lg border ${getMealTypeColor(mealType)} mb-1 hover:shadow-sm transition-shadow cursor-pointer`}
                              draggable
                              onDragStart={() => handleDragStart(meal, mealType)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-semibold truncate mb-1">
                                    {meal.name}
                                  </div>
                                  <div className="flex flex-wrap gap-2 text-xs opacity-75">
                                    <span className="flex items-center gap-1">
                                      <Flame className="h-3 w-3" />
                                      {meal.calories} kcal
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Scale className="h-3 w-3" />
                                      {meal.protein}g protein
                                    </span>
                                    {meal.healthScore && (
                                      <span className="flex items-center gap-1">
                                        <Star className="h-3 w-3 text-yellow-500" />
                                        {meal.healthScore}
                                      </span>
                                    )}
                                  </div>
                                  {meal.difficulty && (
                                    <div className="mt-1 text-xs flex items-center gap-2">
                                      <ChefHat className="h-3 w-3 opacity-60" />
                                      <span className="opacity-75">{meal.difficulty}</span>
                                      {meal.cookDuration && <span className="opacity-60">• {meal.cookDuration}</span>}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1 ml-2">
                                  <button
                                    onClick={() => handleDuplicateMeal(date, mealType, meal)}
                                    className="p-1 hover:bg-white/30 rounded"
                                    title="Duplicate"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveMeal(date, mealType, mealIndex)}
                                    className="p-1 hover:bg-white/30 rounded"
                                    title="Remove"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          // Single meal
                          <div
                            className={`p-2 rounded-lg border ${getMealTypeColor(mealType)} hover:shadow-sm transition-shadow cursor-pointer`}
                            draggable
                            onDragStart={() => handleDragStart(dayMeals[mealType], mealType)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold truncate mb-1">
                                  {dayMeals[mealType].name}
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs opacity-75">
                                  <span className="flex items-center gap-1">
                                    <Flame className="h-3 w-3" />
                                    {dayMeals[mealType].calories} kcal
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Scale className="h-3 w-3" />
                                    {dayMeals[mealType].protein}g protein
                                  </span>
                                  {dayMeals[mealType].healthScore && (
                                    <span className="flex items-center gap-1">
                                      <Star className="h-3 w-3 text-yellow-500" />
                                      {dayMeals[mealType].healthScore}
                                    </span>
                                  )}
                                </div>
                                {dayMeals[mealType].difficulty && (
                                  <div className="mt-1 text-xs flex items-center gap-2">
                                    <ChefHat className="h-3 w-3 opacity-60" />
                                    <span className="opacity-75">{dayMeals[mealType].difficulty}</span>
                                    {dayMeals[mealType].cookDuration && <span className="opacity-60">• {dayMeals[mealType].cookDuration}</span>}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                <button
                                  onClick={() => handleDuplicateMeal(date, mealType, dayMeals[mealType])}
                                  className="p-1 hover:bg-white/30 rounded"
                                  title="Duplicate"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleRemoveMeal(date, mealType)}
                                  className="p-1 hover:bg-white/30 rounded"
                                  title="Remove"
                                >
                                  <Trash2 className="h-3 w-3" />
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
            <div className="mb-4 space-y-3">
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
              
              {/* Advanced Filters */}
              <div className="grid grid-cols-3 gap-3">
                <select
                  value={mealFilters.mealType}
                  onChange={(e) => setMealFilters(prev => ({ ...prev, mealType: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
                
                <input
                  type="number"
                  placeholder="Max calories"
                  value={mealFilters.maxCalories}
                  onChange={(e) => setMealFilters(prev => ({ ...prev, maxCalories: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                />
                
                <input
                  type="number"
                  placeholder="Min protein (g)"
                  value={mealFilters.minProtein}
                  onChange={(e) => setMealFilters(prev => ({ ...prev, minProtein: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                />
              </div>
            </div>

            {/* Meal Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMeals.length > 0 ? (
                filteredMeals.map(meal => (
                  <div
                    key={meal.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-green-400"
                    onClick={() => {
                      // Add meal to selected date and meal type
                      setShowMealModal(false)
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <ImagePlaceholder
                        width={56}
                        height={56}
                        text={`🍽️ ${meal.type}`}
                        bgColor={meal.type === 'Breakfast' ? "#fef3c7" : meal.type === 'Lunch' ? "#f0fdf4" : meal.type === 'Dinner' ? "#fef2f2" : "#e0f2fe"}
                        textColor={meal.type === 'Breakfast' ? "#d97706" : meal.type === 'Lunch' ? "#16a34a" : meal.type === 'Dinner' ? "#dc2626" : "#0369a1"}
                        className="rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-gray-900 text-sm">{meal.name}</h4>
                          {meal.healthScore && (
                            <div className="flex items-center gap-1 bg-yellow-100 px-2 py-0.5 rounded text-xs">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-yellow-700 font-medium">{meal.healthScore}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            {meal.calories} kcal
                          </span>
                          <span className="flex items-center gap-1">
                            <Scale className="h-3 w-3" />
                            {meal.protein}g protein
                          </span>
                        </div>
                        {meal.difficulty && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <ChefHat className="h-3 w-3" />
                            <span>{meal.difficulty}</span>
                            {meal.cookDuration && <span>• {meal.cookDuration}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No meals found matching your criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nutrition Analytics Modal */}
      {showNutritionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Nutrition Analytics</h3>
              <button
                onClick={() => setShowNutritionModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* Weekly Nutrition Breakdown */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries({
                  calories: { label: 'Calories', color: 'bg-red-100 text-red-700', icon: Flame },
                  protein: { label: 'Protein', color: 'bg-blue-100 text-blue-700', icon: Scale },
                  carbs: { label: 'Carbs', color: 'bg-yellow-100 text-yellow-700', icon: Apple },
                  fats: { label: 'Fats', color: 'bg-purple-100 text-purple-700', icon: Droplet }
                }).map(([key, { label, color, icon: Icon }]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{weeklyNutrition[key]}g</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shopping List Modal */}
      {showShoppingListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Shopping List</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportShoppingList}
                  className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium"
                >
                  <Download className="h-4 w-4 inline mr-1" />
                  Export
                </button>
                <button
                  onClick={() => setShowShoppingListModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {generateShoppingList().length > 0 ? (
                generateShoppingList().map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="flex-1 text-gray-900">{item.item}</span>
                    {item.count && <span className="text-sm text-gray-500">{item.count}</span>}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Add meals to generate your shopping list</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Goals Modal */}
      {showGoalsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Set Nutrition Goals</h3>
              <button
                onClick={() => setShowGoalsModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(nutritionGoals).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {key.replace('daily', '')} (per day)
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setNutritionGoals(prev => ({
                      ...prev,
                      [key]: parseInt(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>
              ))}
              
              <button
                onClick={() => {
                  setShowGoalsModal(false)
                  // Save goals (could be saved to backend/localStorage)
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Save Goals
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Meal Plan Templates</h3>
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(mealPlanTemplates).map(([key, template]) => (
                <div
                  key={key}
                  onClick={() => applyTemplate(template)}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-green-400 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Bookmark className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">{template.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="flex items-center text-sm text-green-600 font-medium">
                    Apply Template →
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MealPlan
