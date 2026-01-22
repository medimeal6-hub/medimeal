import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSearch } from '../contexts/SearchContext'
import axios from 'axios'
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
  X,
  Sparkles
} from 'lucide-react'
import mealsData from '../data/meals.json'
import ImagePlaceholder from '../components/ImagePlaceholder'
import { getMealImage, getMealTypeColor } from '../utils/mealImages'

const Dashboard = () => {
  const { user, updateUserData } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { searchQuery, updateSearch } = useSearch()
  const [featuredMeal] = useState(mealsData[0])
  const [allMeals, setAllMeals] = useState(mealsData)
  const [removedMeals, setRemovedMeals] = useState(new Set())
  const [activeTab, setActiveTab] = useState('All')
  const [sortBy, setSortBy] = useState('calories')
  const [viewMode, setViewMode] = useState('grid')
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null)
  const [showHealthSurvey, setShowHealthSurvey] = useState(false)
  const [filteredMeals, setFilteredMeals] = useState(mealsData)
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(null)
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const [surveyFormData, setSurveyFormData] = useState({
    hasPressure: false,
    hasSugar: false,
    isPregnant: false,
    hasCholesterol: false,
    hasHeartDisease: false,
    hasKidneyDisease: false,
    hasAcidReflux: false,
    hasGlutenIntolerance: false,
    hasLactoseIntolerance: false,
    allergies: '',
    otherConditions: ''
  })
  const [surveyLoading, setSurveyLoading] = useState(false)

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

  // Handle search query from URL and sync with context
  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      updateSearch(search)
    }
  }, [searchParams, updateSearch])

  // Show health survey on every visit
  useEffect(() => {
    if (user) {
      setShowHealthSurvey(true)
      // Pre-populate form with existing survey data
      if (user.surveyData) {
        const conditions = user.surveyData.medicalConditions || []
        setSurveyFormData({
          hasPressure: conditions.includes('high-blood-pressure'),
          hasSugar: conditions.includes('diabetes'),
          isPregnant: conditions.includes('pregnancy'),
          hasCholesterol: conditions.includes('high-cholesterol'),
          hasHeartDisease: conditions.includes('heart-disease'),
          hasKidneyDisease: conditions.includes('kidney-disease'),
          hasAcidReflux: conditions.includes('acid-reflux'),
          hasGlutenIntolerance: conditions.includes('gluten-free'),
          hasLactoseIntolerance: conditions.includes('dairy-free'),
          allergies: (user.surveyData.allergies || []).join(', '),
          otherConditions: ''
        })
      }
    }
  }, [user])

  // Load personalized recommendations based on user preferences
  useEffect(() => {
    const loadPersonalizedRecommendations = async () => {
      if (!user || !user.surveyData) {
        setFilteredMeals(mealsData)
        return
      }

      try {
        setRecommendationsLoading(true)
        
        // Try to get KNN recommendations first
        try {
          const knnResponse = await axios.get('/recommendations/knn-python')
          if (knnResponse.data.success) {
            const knnData = knnResponse.data.data
            // Flatten recommendations from all meal types
            const allRecommendations = [
              ...(knnData.recommendations?.breakfast || []),
              ...(knnData.recommendations?.lunch || []),
              ...(knnData.recommendations?.dinner || []),
              ...(knnData.recommendations?.snack || [])
            ]
            
            // Convert KNN format to meal format for display
            const formattedMeals = allRecommendations.map(rec => ({
              id: rec.name.toLowerCase().replace(/\s+/g, '-'),
              name: rec.name,
              type: rec.type,
              calories: rec.calories,
              protein: Math.round(rec.calories * 0.15), // Estimate protein
              carbs: Math.round(rec.calories * 0.5), // Estimate carbs
              fats: Math.round(rec.calories * 0.35), // Estimate fats
              rating: 4.5, // Default rating
              healthScore: Math.round(rec.similarity_score * 100), // Use similarity as health score
              difficulty: 'Easy',
              cookDuration: '15-30 min',
              steps: 5,
              reviews: 25,
              tags: rec.tags || [],
              allergens: rec.allergens || [],
              similarity_score: rec.similarity_score,
              rank: rec.rank
            }))
            
            setPersonalizedRecommendations(formattedMeals)
            setFilteredMeals(formattedMeals)
            return
          }
        } catch (knnError) {
          console.log('KNN recommendations not available, falling back to heuristic filtering')
        }

        // Fallback to original heuristic filtering
        const healthConditions = user.surveyData.medicalConditions || []
        const allergies = user.surveyData.allergies || []

        let filtered = mealsData.filter(meal => {
          // Check if meal is suitable for all health conditions
          for (const condition of healthConditions) {
            if (meal.unsuitableFor && meal.unsuitableFor.includes(condition)) {
              return false
            }
          }

          // Check allergies
          for (const allergy of allergies) {
            if (meal.containsAllergens && meal.containsAllergens.includes(allergy.toLowerCase())) {
              return false
            }
          }

          return true
        })

        setFilteredMeals(filtered)
        setPersonalizedRecommendations(null)
        
      } catch (error) {
        console.error('Error loading personalized recommendations:', error)
        setFilteredMeals(mealsData)
      } finally {
        setRecommendationsLoading(false)
      }
    }

    loadPersonalizedRecommendations()
  }, [user])

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

  const handleSurveySubmit = async (e) => {
    e.preventDefault()
    
    if (!user?._id) {
      alert('User ID not found. Please refresh the page.')
      return
    }
    
    setSurveyLoading(true)

    try {
      // Collect selected health conditions
      const selectedConditions = []
      if (surveyFormData.hasPressure) selectedConditions.push('high-blood-pressure')
      if (surveyFormData.hasSugar) selectedConditions.push('diabetes')
      if (surveyFormData.isPregnant) selectedConditions.push('pregnancy')
      if (surveyFormData.hasCholesterol) selectedConditions.push('high-cholesterol')
      if (surveyFormData.hasHeartDisease) selectedConditions.push('heart-disease')
      if (surveyFormData.hasKidneyDisease) selectedConditions.push('kidney-disease')
      if (surveyFormData.hasAcidReflux) selectedConditions.push('acid-reflux')
      if (surveyFormData.hasGlutenIntolerance) selectedConditions.push('gluten-free')
      if (surveyFormData.hasLactoseIntolerance) selectedConditions.push('dairy-free')

      // Parse allergies
      const allergiesList = surveyFormData.allergies
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0)

      // Parse other conditions
      const otherConditionsList = surveyFormData.otherConditions
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0)

      const surveyUpdate = {
        surveyCompleted: true,
        surveyData: {
          medicalConditions: [...selectedConditions, ...otherConditionsList],
          allergies: allergiesList,
          completedAt: new Date()
        }
      }

      const response = await axios.put(`/users/${user._id}`, surveyUpdate)
      
      if (response.data.success) {
        updateUserData(response.data.data)
        setShowHealthSurvey(false)
      }
    } catch (error) {
      console.error('Error submitting survey:', error)
      alert('Failed to save survey. Please try again.')
    } finally {
      setSurveyLoading(false)
    }
  }

  const handleSurveyToggle = (key) => {
    setSurveyFormData(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSurveyInputChange = (e) => {
    const { name, value } = e.target
    setSurveyFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

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

  // Filter meals based on active tab, removed meals, and search query
  const getFilteredMeals = () => {
    // Start with health-filtered meals
    let filtered = filteredMeals.filter(meal => !removedMeals.has(meal.id))
    
    // Then filter by meal type
    if (activeTab !== 'All') {
      filtered = filtered.filter(meal => meal.type === activeTab)
    }
    
    // Then filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(meal => 
        meal.name.toLowerCase().includes(query) ||
        meal.description.toLowerCase().includes(query) ||
        meal.type.toLowerCase().includes(query)
      )
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

  // Get the final processed meals with memoization for performance
  const processedMeals = useMemo(() => {
    return getSortedMeals(getFilteredMeals())
  }, [searchQuery, activeTab, sortBy, filteredMeals, removedMeals])

  const healthConditions = [
    { key: 'hasPressure', label: 'High Blood Pressure', description: 'Meals low in sodium and healthy fats' },
    { key: 'hasSugar', label: 'Diabetes / High Sugar', description: 'Meals with controlled carbohydrates and low glycemic index' },
    { key: 'isPregnant', label: 'Pregnancy', description: 'Pregnancy-safe meals with essential nutrients' },
    { key: 'hasCholesterol', label: 'High Cholesterol', description: 'Heart-healthy meals low in saturated fats' },
    { key: 'hasHeartDisease', label: 'Heart Disease', description: 'Cardiac-friendly meals rich in omega-3s' },
    { key: 'hasKidneyDisease', label: 'Kidney Disease', description: 'Low-protein, kidney-friendly meals' },
    { key: 'hasAcidReflux', label: 'Acid Reflux / GERD', description: 'Meals avoiding trigger foods' },
    { key: 'hasGlutenIntolerance', label: 'Gluten Intolerance', description: 'Gluten-free meal options' },
    { key: 'hasLactoseIntolerance', label: 'Lactose Intolerance', description: 'Dairy-free meal options' }
  ]

  return (
    <div className="space-y-8">
      {/* Recommendations CTA */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl text-white p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">Personalized Recommendations</h2>
          <p className="text-sm text-emerald-50">See meals tailored to your health profile and calorie target.</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/recommendations')}
          className="inline-flex items-center bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          View Recommendations
        </button>
      </div>
      {/* Health Survey Section - Top of Dashboard */}
      {showHealthSurvey && (
        <div className="bg-gradient-to-br from-white via-green-50/30 to-blue-50/30 rounded-2xl border border-green-200/50 shadow-lg backdrop-blur-sm">
          {/* Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Health Preferences</h2>
                  <p className="text-green-100 text-sm mt-1">Personalize your meal recommendations</p>
                </div>
              </div>
              <button
                onClick={() => setShowHealthSurvey(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSurveySubmit} className="p-8">
            {/* Health Conditions Section */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Health Conditions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {healthConditions.map((condition) => (
                  <label
                    key={condition.key}
                    className={`group relative flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                      surveyFormData[condition.key]
                        ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md'
                        : 'border-gray-200 hover:border-green-300 bg-white hover:bg-green-50/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={surveyFormData[condition.key]}
                      onChange={() => handleSurveyToggle(condition.key)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center mr-4 flex-shrink-0 mt-0.5 transition-all duration-200 ${
                      surveyFormData[condition.key]
                        ? 'border-green-500 bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm'
                        : 'border-gray-300 group-hover:border-green-400'
                    }`}>
                      {surveyFormData[condition.key] && (
                        <CheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                        {condition.label}
                      </div>
                      <div className="text-xs text-gray-600 mt-1 leading-relaxed">{condition.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center mr-2">
                    <AlertTriangle className="h-3 w-3 text-white" />
                  </div>
                  Food Allergies
                </label>
                <input
                  type="text"
                  name="allergies"
                  value={surveyFormData.allergies}
                  onChange={handleSurveyInputChange}
                  placeholder="e.g., peanuts, shellfish, eggs"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-4 focus:ring-green-200 focus:border-green-400 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                  Separate multiple allergies with commas
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center mr-2">
                    <Heart className="h-3 w-3 text-white" />
                  </div>
                  Other Conditions
                </label>
                <input
                  type="text"
                  name="otherConditions"
                  value={surveyFormData.otherConditions}
                  onChange={handleSurveyInputChange}
                  placeholder="e.g., anemia, thyroid issues"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-4 focus:ring-green-200 focus:border-green-400 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                  Separate multiple conditions with commas
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200/50">
              <button
                type="button"
                onClick={() => setShowHealthSurvey(false)}
                className="px-6 py-3 text-sm font-semibold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={surveyLoading}
                className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 border border-transparent rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                {surveyLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Preferences'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

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

      {/* Personalized Recommendations Section */}
      {personalizedRecommendations && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                Personalized Recommendations
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                AI-powered meal suggestions based on your health profile and preferences
                {user?.surveyData?.medicalConditions?.length > 0 && (
                  <span className="ml-2 text-green-600 font-medium">
                    ✓ Tailored to your health conditions
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-500 bg-purple-50 px-2 py-1 rounded">
                Powered by KNN
              </div>
            </div>
          </div>
          
          {recommendationsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-[160px] bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personalizedRecommendations.slice(0, 6).map((meal, index) => (
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
                        <div className="flex items-center text-purple-600">
                          <Sparkles className="h-3 w-3 mr-1" />
                          <span className="text-xs font-medium">{meal.healthScore}/100</span>
                        </div>
                        <div className="text-xs text-gray-500 bg-purple-50 px-1 py-0.5 rounded">
                          #{meal.rank}
                        </div>
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

                    {meal.tags && meal.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {meal.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <button 
                      onClick={() => handleAddToMealPlan(meal.id)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-xs font-medium transition-colors"
                    >
                      Add to Meal Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Menu Section */}
      <div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {personalizedRecommendations ? 'More Options' : 'All Menu'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {processedMeals.length} meal{processedMeals.length !== 1 ? 's' : ''}
              {activeTab !== 'All' && ` in ${activeTab}`}
              {searchQuery && (
                <span className="ml-2 text-blue-600 font-medium">
                  for "{searchQuery}"
                </span>
              )}
              {removedMeals.size > 0 && (
                <span className="ml-2 text-orange-600">
                  ({removedMeals.size} removed)
                </span>
              )}
              {user?.surveyData?.medicalConditions?.length > 0 && !personalizedRecommendations && (
                <span className="ml-2 text-green-600 font-medium">
                  ✓ Filtered by your health conditions
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
