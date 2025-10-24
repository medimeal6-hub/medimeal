import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { 
  Heart, 
  Upload, 
  Shield, 
  Utensils, 
  TrendingUp, 
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  X
} from 'lucide-react'
import mealsData from '../data/meals.json'
import ImagePlaceholder from '../components/ImagePlaceholder'
import { getMealImage, getMealTypeColor } from '../utils/mealImages'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [featuredMeal] = useState(mealsData[0])
  const [allMeals, setAllMeals] = useState(mealsData)
  const [removedMeals, setRemovedMeals] = useState(new Set())
  const [activeTab, setActiveTab] = useState('All')
  const [sortBy, setSortBy] = useState('calories')
  const [viewMode, setViewMode] = useState('grid')
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null)

  const stats = [
    {
      label: 'Prescriptions Uploaded',
      value: '3',
      icon: Upload,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+1 this week'
    },
    {
      label: 'Conflicts Avoided',
      value: '12',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+3 this week'
    },
    {
      label: 'Meals Recommended',
      value: '28',
      icon: Utensils,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+5 this week'
    }
  ]

  const userName = user?.displayName || user?.email?.split('@')[0] || 'User'

  const handleAddToMealPlan = (mealId) => {
    // Add meal to user's meal plan
    console.log('Adding meal to plan:', mealId)
    // Here you would typically make an API call to add the meal
    alert(`Added meal ${mealId} to your meal plan!`)
  }

  const handleRemoveMeal = (mealId) => {
    setShowRemoveConfirm(mealId)
  }

  const confirmRemoveMeal = (mealId) => {
    setRemovedMeals(prev => new Set([...prev, mealId]))
    setShowRemoveConfirm(null)
    // Here you would typically make an API call to remove the meal
    console.log('Removed meal:', mealId)
  }

  const cancelRemoveMeal = () => {
    setShowRemoveConfirm(null)
  }

  const restoreMeal = (mealId) => {
    setRemovedMeals(prev => {
      const newSet = new Set(prev)
      newSet.delete(mealId)
      return newSet
    })
  }

  // Handle keyboard events for confirmation dialog
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (showRemoveConfirm && event.key === 'Escape') {
        cancelRemoveMeal()
      }
    }

    if (showRemoveConfirm) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showRemoveConfirm])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleSortChange = (sort) => {
    setSortBy(sort)
  }

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
  }

  const handleFilterClick = () => {
    // Navigate to meals page with filter options
    navigate('/meals?filter=true')
  }

  // Filter meals based on active tab and removed meals
  const getFilteredMeals = () => {
    // First filter out removed meals
    let filtered = allMeals.filter(meal => !removedMeals.has(meal.id))
    
    // Then filter by meal type
    if (activeTab !== 'All') {
      filtered = filtered.filter(meal => meal.type === activeTab)
    }
    
    return filtered
  }

  // Sort meals based on selected criteria
  const getSortedMeals = (meals) => {
    const sorted = [...meals]
    
    switch (sortBy) {
      case 'calories':
        return sorted.sort((a, b) => a.calories - b.calories)
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating)
      case 'healthScore':
        return sorted.sort((a, b) => b.healthScore - a.healthScore)
      default:
        return sorted
    }
  }

  // Get the final processed meals
  const processedMeals = getSortedMeals(getFilteredMeals())

  return (
    <div className="space-y-8">
      {/* Confirmation Dialog */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Remove Meal</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove this meal from your dashboard? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelRemoveMeal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmRemoveMeal(showRemoveConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Featured Menu Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Featured Menu</h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex flex-col lg:flex-row">
            {/* Meal Image */}
            <div className="w-full lg:w-1/3">
              <img 
                src="/images/meals/meal1.png"
                alt={featuredMeal.name}
                className="w-full h-[300px] object-cover"
              />
            </div>

            {/* Meal Details */}
            <div className="w-full lg:w-2/3 p-6 lg:p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {featuredMeal.name}
                  </h3>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      {featuredMeal.type}
                    </span>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current mr-1" />
                      <span className="text-sm font-medium">{featuredMeal.rating}/5 (125 reviews)</span>
                    </div>
                    <span className="text-sm text-gray-600">{featuredMeal.difficulty}</span>
                  </div>
                </div>
                <div className="flex items-center text-green-600">
                  <Heart className="h-5 w-5 mr-2" />
                  <span className="text-lg font-bold">{featuredMeal.healthScore}/100</span>
                </div>
              </div>

              <div className="flex items-center space-x-6 mb-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{featuredMeal.cookDuration}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📋</span>
                  <span>{featuredMeal.steps} steps</span>
                </div>
              </div>

              {/* Nutrition Info */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-xl font-bold text-green-700">{featuredMeal.calories}</div>
                  <div className="text-xs text-green-600">Calories</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 text-center">
                  <div className="text-xl font-bold text-yellow-700">{featuredMeal.carbs}g</div>
                  <div className="text-xs text-yellow-600">Carbs</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <div className="text-xl font-bold text-orange-700">{featuredMeal.protein}g</div>
                  <div className="text-xs text-orange-600">Proteins</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-xl font-bold text-gray-700">{featuredMeal.fats}g</div>
                  <div className="text-xs text-gray-600">Fats</div>
                </div>
              </div>

              <button 
                onClick={() => handleAddToMealPlan(featuredMeal.id)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add to Meal Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* All Menu Section */}
      <div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">All Menu</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {processedMeals.length} meal{processedMeals.length !== 1 ? 's' : ''}
              {activeTab !== 'All' && ` in ${activeTab}`}
              {removedMeals.size > 0 && (
                <span className="ml-2 text-orange-600">
                  ({removedMeals.size} removed)
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            {/* Meal Type Tabs */}
            <div className="flex flex-wrap gap-2">
              {['All', 'Breakfast', 'Lunch', 'Snack', 'Dinner'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleTabChange(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    type === activeTab
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Filter and Sort */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleFilterClick}
                className="flex items-center px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200"
              >
                <span className="mr-2">🔽</span>
                Filter
              </button>
              <select 
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 border-0 focus:ring-2 focus:ring-green-500"
              >
                <option value="calories">Sort by: Calories</option>
                <option value="rating">Sort by: Rating</option>
                <option value="healthScore">Sort by: Health Score</option>
              </select>
              <div className="flex border border-gray-200 rounded-lg">
                <button 
                  onClick={() => handleViewModeChange('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'} rounded-l-lg`}
                >
                  <span>⊞</span>
                </button>
                <button 
                  onClick={() => handleViewModeChange('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'} rounded-r-lg`}
                >
                  <span>☰</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Meal Grid/List */}
        {processedMeals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Utensils className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meals found</h3>
            <p className="text-gray-600">
              {activeTab !== 'All' 
                ? `No ${activeTab.toLowerCase()} meals available. Try selecting a different meal type.`
                : 'No meals are currently available.'
              }
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedMeals.map((meal, index) => (
            <div key={meal.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <img 
                src={getMealImage(meal)}
                alt={meal.name}
                className="w-full h-[160px] object-cover"
              />
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    {meal.name}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-green-600">
                      <Heart className="h-3 w-3 mr-1" />
                      <span className="text-xs font-medium">{meal.healthScore}/100</span>
                    </div>
                    <button
                      onClick={() => handleRemoveMeal(meal.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove meal"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMealTypeColor(meal.type)}`}>
                    {meal.type}
                  </span>
                  <span className="text-xs text-gray-600">{meal.difficulty}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                  <span>{meal.calories} kcal</span>
                  <span>{meal.protein}g protein</span>
                  <span>{meal.carbs}g carbs</span>
                  <span>{meal.fats}g fats</span>
                </div>

                <button 
                  onClick={() => handleAddToMealPlan(meal.id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-medium transition-colors"
                >
                  Add to Meal Plan
                </button>
              </div>
            </div>
          ))}
          </div>
        ) : (
          <div className="space-y-4">
            {processedMeals.map((meal, index) => (
              <div key={meal.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/4">
                    <img 
                      src={getMealImage(meal)}
                      alt={meal.name}
                      className="w-full h-[200px] md:h-full object-cover"
                    />
                  </div>
                  
                  <div className="w-full md:w-3/4 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">
                          {meal.name}
                        </h4>
                        <div className="flex items-center space-x-4 mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMealTypeColor(meal.type)}`}>
                            {meal.type}
                          </span>
                          <div className="flex items-center text-yellow-500">
                            <Star className="h-4 w-4 fill-current mr-1" />
                            <span className="text-sm font-medium">{meal.rating}/5 ({meal.reviews} reviews)</span>
                          </div>
                          <span className="text-sm text-gray-600">{meal.difficulty}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center text-green-600">
                          <Heart className="h-5 w-5 mr-2" />
                          <span className="text-lg font-bold">{meal.healthScore}/100</span>
                        </div>
                        <button
                          onClick={() => handleRemoveMeal(meal.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove meal"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 mb-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{meal.cookDuration}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">📋</span>
                        <span>{meal.steps} steps</span>
                      </div>
                    </div>

                    {/* Nutrition Info */}
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="bg-green-50 rounded-xl p-3 text-center">
                        <div className="text-lg font-bold text-green-700">{meal.calories}</div>
                        <div className="text-xs text-green-600">Calories</div>
                      </div>
                      <div className="bg-yellow-50 rounded-xl p-3 text-center">
                        <div className="text-lg font-bold text-yellow-700">{meal.carbs}g</div>
                        <div className="text-xs text-yellow-600">Carbs</div>
                      </div>
                      <div className="bg-orange-50 rounded-xl p-3 text-center">
                        <div className="text-lg font-bold text-orange-700">{meal.protein}g</div>
                        <div className="text-xs text-orange-600">Proteins</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-lg font-bold text-gray-700">{meal.fats}g</div>
                        <div className="text-xs text-gray-600">Fats</div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleAddToMealPlan(meal.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add to Meal Plan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Removed Meals Section */}
      {removedMeals.size > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Removed Meals</h2>
            <button
              onClick={() => setRemovedMeals(new Set())}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(removedMeals).map(mealId => {
              const meal = allMeals.find(m => m.id === mealId)
              if (!meal) return null
              
              return (
                <div key={meal.id} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden opacity-75">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-700 text-sm mb-1">
                        {meal.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{meal.type}</span>
                        <button
                          onClick={() => restoreMeal(meal.id)}
                          className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                          title="Restore meal"
                        >
                          <X className="h-3 w-3 rotate-45" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{meal.calories} kcal</span>
                      <span>{meal.healthScore}/100</span>
                    </div>
                    <button
                      onClick={() => restoreMeal(meal.id)}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg text-xs font-medium transition-colors"
                    >
                      Restore Meal
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Progress Stats */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Progress Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-xs text-green-600 font-medium">{stat.change}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
