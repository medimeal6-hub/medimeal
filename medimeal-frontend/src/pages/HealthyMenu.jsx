import { useState, useEffect, useMemo, useCallback, memo, Suspense, lazy } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Grid3X3, 
  List, 
  Star,
  Heart,
  Clock,
  Users,
  TrendingUp,
  Bell,
  User,
  X,
  Save,
  Upload,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import mealsData from '../data/meals.json'
import ImagePlaceholder from '../components/ImagePlaceholder'
import PerformanceMonitor from '../components/PerformanceMonitor'
import { getMealImage, getMealTypeColor } from '../utils/mealImages'

// Lazy load heavy components
const MealCard = lazy(() => import('../components/MealCard'))
const AdvancedFilters = lazy(() => import('../components/AdvancedFilters'))
const MealModal = lazy(() => import('../components/MealModal'))

// Debounce hook for performance
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const HealthyMenu = memo(() => {
  const { user } = useAuth()
  const [meals, setMeals] = useState(mealsData)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [sortBy, setSortBy] = useState('calories')
  const [viewMode, setViewMode] = useState('grid')
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showAddCustomMeal, setShowAddCustomMeal] = useState(false)
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [favorites, setFavorites] = useState(new Set())
  const [removedMeals, setRemovedMeals] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Debounced search for performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Advanced filter states
  const [advancedFilters, setAdvancedFilters] = useState({
    dietaryRestrictions: [],
    allergies: [],
    maxCalories: '',
    minProtein: '',
    maxCookTime: '',
    difficulty: []
  })

  // New meal form states
  const [newMeal, setNewMeal] = useState({
    name: '',
    type: 'Breakfast',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    description: '',
    difficulty: 'Easy',
    cookDuration: '',
    steps: '',
    image: null
  })

  const userName = user?.displayName || user?.email?.split('@')[0] || 'User'

  // Memoized filtered meals for performance
  const filteredMeals = useMemo(() => {
    setIsLoading(true)
    
    let filtered = meals.filter(meal => !removedMeals.has(meal.id))

    // Search filter with debounced term
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      filtered = filtered.filter(meal => 
        meal.name.toLowerCase().includes(searchLower) ||
        meal.description.toLowerCase().includes(searchLower) ||
        meal.type.toLowerCase().includes(searchLower)
      )
    }

    // Type filter
    if (activeFilter !== 'All') {
      filtered = filtered.filter(meal => meal.type === activeFilter)
    }

    // Advanced filters
    if (advancedFilters.dietaryRestrictions.length > 0) {
      filtered = filtered.filter(meal => 
        advancedFilters.dietaryRestrictions.some(restriction => 
          meal.tags?.includes(restriction)
        )
      )
    }

    if (advancedFilters.maxCalories) {
      filtered = filtered.filter(meal => meal.calories <= parseInt(advancedFilters.maxCalories))
    }

    if (advancedFilters.minProtein) {
      filtered = filtered.filter(meal => meal.protein >= parseInt(advancedFilters.minProtein))
    }

    if (advancedFilters.maxCookTime) {
      const maxMinutes = parseInt(advancedFilters.maxCookTime)
      filtered = filtered.filter(meal => {
        const cookTime = parseInt(meal.cookDuration.replace(/\D/g, ''))
        return cookTime <= maxMinutes
      })
    }

    if (advancedFilters.difficulty.length > 0) {
      filtered = filtered.filter(meal => 
        advancedFilters.difficulty.includes(meal.difficulty)
      )
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'calories':
          return a.calories - b.calories
        case 'rating':
          return b.rating - a.rating
        case 'healthScore':
          return b.healthScore - a.healthScore
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setIsLoading(false)
    return sorted
  }, [meals, debouncedSearchTerm, activeFilter, sortBy, advancedFilters, removedMeals])

  // Paginated meals for infinite scroll
  const paginatedMeals = useMemo(() => {
    const itemsPerPage = viewMode === 'grid' ? 12 : 6
    return filteredMeals.slice(0, currentPage * itemsPerPage)
  }, [filteredMeals, currentPage, viewMode])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'f' || event.key === 'F') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          document.getElementById('search-input')?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Memoized callbacks for performance
  const handleAddToFavorites = useCallback((mealId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(mealId)) {
        newFavorites.delete(mealId)
      } else {
        newFavorites.add(mealId)
      }
      return newFavorites
    })
  }, [])

  const handleRemoveMeal = useCallback((mealId) => {
    setRemovedMeals(prev => new Set([...prev, mealId]))
  }, [])

  const handleAddCustomMeal = useCallback(() => {
    const newMealData = {
      id: Date.now(),
      ...newMeal,
      calories: parseInt(newMeal.calories),
      protein: parseInt(newMeal.protein),
      carbs: parseInt(newMeal.carbs),
      fats: parseInt(newMeal.fats),
      steps: parseInt(newMeal.steps),
      rating: 4.0,
      reviews: 0,
      healthScore: 80,
      status: 'Safe'
    }

    setMeals(prev => [...prev, newMealData])
    setNewMeal({
      name: '',
      type: 'Breakfast',
      calories: '',
      protein: '',
      carbs: '',
      fats: '',
      description: '',
      difficulty: 'Easy',
      cookDuration: '',
      steps: '',
      image: null
    })
    setShowAddCustomMeal(false)
  }, [newMeal])

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(filteredMeals, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `healthy-menu-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }, [filteredMeals])

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
      setCurrentPage(prev => prev + 1)
    }
  }, [])

  // Add scroll listener for infinite scroll
  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])


  return (
    <div className="min-h-screen bg-gray-50">
      <PerformanceMonitor />
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Healthy Menu</h1>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="search-input"
                type="text"
                placeholder="Search menu"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Menu
            </button>
            
            <div className="relative">
              <Bell className="h-6 w-6 text-gray-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Meal Library Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Meal Library</h2>
            <p className="text-gray-600 mb-4">
              Discover meals that work perfectly with your medications and health goals.
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
              <span>{filteredMeals.length} meals available</span>
              <span>{favorites.size} favorites</span>
              <span className="text-green-600">AI-powered recommendations</span>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
                
                <button
                  onClick={() => setShowAddCustomMeal(true)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Meal
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search meals... (Press 'F' to focus)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="calories">Sort by: Calories</option>
                  <option value="rating">Sort by: Rating</option>
                  <option value="healthScore">Sort by: Health Score</option>
                  <option value="name">Sort by: Name</option>
                </select>

                <button
                  onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced
                </button>

                <div className="flex border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'} rounded-l-lg`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'} rounded-r-lg`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            <Suspense fallback={<div className="mt-6 pt-6 border-t border-gray-200"><div className="animate-pulse h-20 bg-gray-200 rounded"></div></div>}>
              <AdvancedFilters
                advancedFilters={advancedFilters}
                setAdvancedFilters={setAdvancedFilters}
                showAdvancedFilter={showAdvancedFilter}
              />
            </Suspense>
          </div>

          {/* Meal Type Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'].map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  type === activeFilter
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {activeFilter} Meals ({filteredMeals.length})
            </h3>
            <p className="text-sm text-gray-600">
              Showing {filteredMeals.length} of {meals.length} meals
            </p>
          </div>

          {/* Meal Grid/List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : filteredMeals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No meals found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or filters to find more meals.
              </p>
            </div>
          ) : (
            <Suspense fallback={<div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>}>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                {paginatedMeals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    viewMode={viewMode}
                    favorites={favorites}
                    onAddToFavorites={handleAddToFavorites}
                    onRemoveMeal={handleRemoveMeal}
                    getMealImage={getMealImage}
                  />
                ))}
              </div>
            </Suspense>
          )}

          {/* Load More Button */}
          {paginatedMeals.length < filteredMeals.length && (
            <div className="text-center mt-8">
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Load More Meals
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{userName}</h3>
                <p className="text-sm text-gray-600">Member</p>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-800">Health Streak</span>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div className="w-full bg-green-200 rounded-full h-2 mb-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <p className="text-sm text-green-700">7 days</p>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Prescriptions Uploaded:</span>
                <span className="font-semibold text-gray-900">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Conflicts Avoided:</span>
                <span className="font-semibold text-gray-900">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Meals Recommended:</span>
                <span className="font-semibold text-gray-900">28</span>
              </div>
            </div>
          </div>

          {/* Popular Menu */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Popular Menu</h3>
            <div className="space-y-3">
              {meals.slice(0, 3).map((meal) => (
                <div key={meal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={getMealImage(meal)}
                        alt={meal.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{meal.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                          <span className="text-xs text-gray-600">{meal.rating}/5</span>
                        </div>
                        <span className="text-xs text-gray-500">{meal.type}</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-green-500 transition-colors">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Menu */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Recommended Menu</h3>
            <div className="space-y-3">
              {meals.slice(1, 4).map((meal) => (
                <div key={meal.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={getMealImage(meal)}
                        alt={meal.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{meal.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-600">{meal.type}</span>
                        <span className="text-xs text-gray-500">{meal.calories} kcal</span>
                        <span className="text-xs text-gray-500">{meal.protein}g P</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-green-500 transition-colors">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Meal Modal */}
      <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div></div>}>
        <MealModal
          showAddCustomMeal={showAddCustomMeal}
          setShowAddCustomMeal={setShowAddCustomMeal}
          newMeal={newMeal}
          setNewMeal={setNewMeal}
          handleAddCustomMeal={handleAddCustomMeal}
        />
      </Suspense>
    </div>
  )
})

HealthyMenu.displayName = 'HealthyMenu'

export default HealthyMenu
