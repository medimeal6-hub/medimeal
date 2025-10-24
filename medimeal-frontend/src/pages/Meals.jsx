import { useState, useEffect, useMemo, useCallback, useRef, useTransition } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Heart, 
  Clock, 
  Plus, 
  AlertTriangle,
  Bookmark,
  Share2,
  Download,
  Upload,
  Settings,
  Zap,
  TrendingUp,
  Users,
  Award,
  Eye,
  EyeOff,
  ChevronDown,
  X,
  Check,
  SortAsc,
  SortDesc
} from 'lucide-react'
import mealsData from '../data/meals.json'
import AddCustomMealModal from '../components/AddCustomMealModal'

const Meals = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()
  
  // Core state
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('calories')
  const [sortOrder, setSortOrder] = useState('asc')
  
  // Custom meal modal state
  const [showAddMealModal, setShowAddMealModal] = useState(false)
  const [customMeals, setCustomMeals] = useState([])
  
  // Advanced features state
  const [favorites, setFavorites] = useState(new Set())
  const [comparisonList, setComparisonList] = useState([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [selectedMeals, setSelectedMeals] = useState(new Set())
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  
  // Advanced filters
  const [filters, setFilters] = useState({
    calories: { min: '', max: '' },
    protein: { min: '', max: '' },
    carbs: { min: '', max: '' },
    rating: { min: '', max: '' },
    healthScore: { min: '', max: '' },
    difficulty: 'all',
    status: 'all',
    allergens: [],
    dietary: []
  })
  
  // Refs for performance
  const searchInputRef = useRef(null)
  const observerRef = useRef(null)
  const lastMealElementRef = useRef(null)

  // Handle search query from URL
  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      setSearchQuery(search)
    }
  }, [searchParams])

  // Debounced search with useTransition for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        // Search is handled in filteredMeals useMemo
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, startTransition])

  const mealTypes = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack']

  // Combine default meals with custom meals
  const allMeals = useMemo(() => {
    return [...mealsData, ...customMeals]
  }, [customMeals])

  // Advanced filtering with memoization for performance
  const filteredMeals = useMemo(() => {
    return allMeals.filter(meal => {
      // Basic filters
      const matchesTab = activeTab === 'All' || meal.type === activeTab
      const matchesSearch = !searchQuery || 
        meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meal.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Advanced filters
      const matchesCalories = (!filters.calories.min || meal.calories >= filters.calories.min) &&
                            (!filters.calories.max || meal.calories <= filters.calories.max)
      
      const matchesProtein = (!filters.protein.min || meal.protein >= filters.protein.min) &&
                            (!filters.protein.max || meal.protein <= filters.protein.max)
      
      const matchesCarbs = (!filters.carbs.min || meal.carbs >= filters.carbs.min) &&
                          (!filters.carbs.max || meal.carbs <= filters.carbs.max)
      
      const matchesRating = (!filters.rating.min || meal.rating >= filters.rating.min) &&
                           (!filters.rating.max || meal.rating <= filters.rating.max)
      
      const matchesHealthScore = (!filters.healthScore.min || meal.healthScore >= filters.healthScore.min) &&
                               (!filters.healthScore.max || meal.healthScore <= filters.healthScore.max)
      
      const matchesDifficulty = filters.difficulty === 'all' || meal.difficulty === filters.difficulty
      const matchesStatus = filters.status === 'all' || meal.status === filters.status
      
      return matchesTab && matchesSearch && matchesCalories && matchesProtein && 
             matchesCarbs && matchesRating && matchesHealthScore && 
             matchesDifficulty && matchesStatus
    })
  }, [allMeals, activeTab, searchQuery, filters])

  // Advanced sorting with multiple criteria
  const sortedMeals = useMemo(() => {
    return [...filteredMeals].sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'calories':
          comparison = a.calories - b.calories
          break
        case 'rating':
          comparison = b.rating - a.rating
          break
        case 'healthScore':
          comparison = b.healthScore - a.healthScore
          break
        case 'protein':
          comparison = b.protein - a.protein
          break
        case 'carbs':
          comparison = a.carbs - b.carbs
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        default:
          comparison = 0
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [filteredMeals, sortBy, sortOrder])

  const getStatusColor = (status) => {
    return status === 'Safe' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-red-100 text-red-700'
  }

  const getTypeColor = (type) => {
    const colors = {
      'Breakfast': 'bg-orange-100 text-orange-700',
      'Lunch': 'bg-blue-100 text-blue-700',
      'Dinner': 'bg-purple-100 text-purple-700',
      'Snack': 'bg-yellow-100 text-yellow-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const getMealImage = (meal) => {
    // Use actual meal images based on meal ID
    const imageIndex = (meal.id % 5) + 1
    return `/images/meals/meal${imageIndex}.png`
  }

  // Advanced event handlers with useCallback for performance
  const handleAddToMealPlan = useCallback((mealId) => {
    console.log('Adding meal to plan:', mealId)
    // Here you would typically make an API call
    alert(`Added meal ${mealId} to your meal plan!`)
  }, [])

  const handleToggleFavorite = useCallback((mealId) => {
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

  const handleAddToComparison = useCallback((meal) => {
    if (comparisonList.length < 3) {
      setComparisonList(prev => [...prev, meal])
      setShowComparison(true)
    } else {
      alert('You can compare up to 3 meals at once')
    }
  }, [comparisonList.length])

  const handleRemoveFromComparison = useCallback((mealId) => {
    setComparisonList(prev => prev.filter(meal => meal.id !== mealId))
  }, [])

  const handleSelectMeal = useCallback((mealId) => {
    setSelectedMeals(prev => {
      const newSelected = new Set(prev)
      if (newSelected.has(mealId)) {
        newSelected.delete(mealId)
      } else {
        newSelected.add(mealId)
      }
      return newSelected
    })
  }, [])

  const handleSortChange = useCallback((newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('asc')
    }
  }, [sortBy])

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({
      calories: { min: '', max: '' },
      protein: { min: '', max: '' },
      carbs: { min: '', max: '' },
      rating: { min: '', max: '' },
      healthScore: { min: '', max: '' },
      difficulty: 'all',
      status: 'all',
      allergens: [],
      dietary: []
    })
  }, [])

  const handleExportMeals = useCallback(() => {
    const exportData = {
      meals: sortedMeals,
      filters: filters,
      exportDate: new Date().toISOString(),
      totalCount: sortedMeals.length
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `meals-export-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }, [sortedMeals, filters])

  const handleShareMeal = useCallback((meal) => {
    if (navigator.share) {
      navigator.share({
        title: meal.name,
        text: `Check out this ${meal.type.toLowerCase()} meal: ${meal.name}`,
        url: window.location.href
      })
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${meal.name} - ${meal.description}`)
      alert('Meal details copied to clipboard!')
    }
  }, [])

  const handleAddCustomMeal = useCallback((mealData) => {
    setCustomMeals(prev => [...prev, mealData])
    alert(`Custom meal "${mealData.name}" added successfully!`)
  }, [])

  const handleOpenAddMealModal = useCallback(() => {
    setShowAddMealModal(true)
  }, [])

  const handleCloseAddMealModal = useCallback(() => {
    setShowAddMealModal(false)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      
      switch (e.key) {
        case 'f':
          e.preventDefault()
          searchInputRef.current?.focus()
          break
        case 'g':
          e.preventDefault()
          setViewMode('grid')
          break
        case 'l':
          e.preventDefault()
          setViewMode('list')
          break
        case 'Escape':
          setShowAdvancedFilters(false)
          setShowComparison(false)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
      {/* Advanced Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Healthy Menu</h2>
            <p className="text-gray-600">
              Discover nutritious meals that work perfectly with your medications and health goals.
            </p>
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                <span>{sortedMeals.length} meals available</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>{favorites.size} favorites</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Award className="h-4 w-4 mr-1" />
                <span>AI-powered recommendations</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportMeals}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button 
              onClick={handleOpenAddMealModal}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Meal
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Advanced Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search meals... (Press 'F' to focus)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Advanced Controls */}
          <div className="flex items-center space-x-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                <option value="calories">Sort by: Calories</option>
                <option value="rating">Sort by: Rating</option>
                <option value="healthScore">Sort by: Health Score</option>
                <option value="protein">Sort by: Protein</option>
                <option value="carbs">Sort by: Carbs</option>
                <option value="name">Sort by: Name</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 text-gray-400" /> : <SortDesc className="h-4 w-4 text-gray-400" />}
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showAdvancedFilters ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced
            </button>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                title="Grid view (Press 'G')"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                title="List view (Press 'L')"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">Advanced Filters</h4>
              <button
                onClick={handleClearFilters}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                Clear all filters
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Calories Range */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Calories</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.calories.min}
                    onChange={(e) => handleFilterChange('calories', { ...filters.calories, min: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.calories.max}
                    onChange={(e) => handleFilterChange('calories', { ...filters.calories, max: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Protein Range */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Protein (g)</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.protein.min}
                    onChange={(e) => handleFilterChange('protein', { ...filters.protein, min: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.protein.max}
                    onChange={(e) => handleFilterChange('protein', { ...filters.protein, max: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Health Score Range */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Health Score</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.healthScore.min}
                    onChange={(e) => handleFilterChange('healthScore', { ...filters.healthScore, min: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.healthScore.max}
                    onChange={(e) => handleFilterChange('healthScore', { ...filters.healthScore, max: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                >
                  <option value="all">All</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Meal Type Tabs */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-2">
          {mealTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === type
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Meals Grid/List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {activeTab} Meals ({sortedMeals.length})
            </h3>
            <div className="text-sm text-gray-600">
              Showing {sortedMeals.length} of {allMeals.length} meals
            </div>
          </div>
        </div>

        <div className="p-6">
          {sortedMeals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Utensils className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No meals found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'Try adjusting your search criteria' : 'No meals match your current filters'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setActiveTab('All')
                  handleClearFilters()
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedMeals.map((meal, index) => (
                <div key={meal.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-green-200 transition-all duration-300 group">
                  {/* Meal Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={getMealImage(meal)}
                      alt={meal.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = `/images/meals/meal1.png` // Fallback image
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(meal.type)}`}>
                        {meal.type}
                      </span>
                    </div>
                  </div>

                  {/* Meal Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                        {meal.name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meal.status)}`}>
                        {meal.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(meal.type)}`}>
                        {meal.type}
                      </span>
                      <span className="text-xs text-gray-600">{meal.difficulty}</span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-green-600">
                        <Heart className="h-3 w-3 mr-1" />
                        <span className="text-xs font-medium">{meal.healthScore}/100</span>
                      </div>
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        <span className="text-xs">{meal.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                      <span>{meal.calories} kcal</span>
                      <span>{meal.protein}g protein</span>
                      <span>{meal.carbs}g carbs</span>
                    </div>

                    {meal.status === 'Unsafe' && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        <div className="flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {meal.conflictReason}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleAddToMealPlan(meal.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add to Plan
                      </button>
                      <button
                        onClick={() => handleToggleFavorite(meal.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          favorites.has(meal.id) 
                            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={favorites.has(meal.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Bookmark className={`h-3 w-3 ${favorites.has(meal.id) ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleShareMeal(meal)}
                        className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Share meal"
                      >
                        <Share2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedMeals.map((meal, index) => (
                <div key={meal.id} className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-green-200 transition-all duration-300 group">
                  {/* Meal Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={getMealImage(meal)}
                      alt={meal.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `/images/meals/meal1.png` // Fallback image
                      }}
                    />
                  </div>

                  {/* Meal Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {meal.name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meal.status)} ml-2`}>
                        {meal.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-sm text-gray-600 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(meal.type)}`}>
                        {meal.type}
                      </span>
                      <span>{meal.difficulty}</span>
                      <div className="flex items-center text-green-600">
                        <Heart className="h-3 w-3 mr-1" />
                        <span className="text-xs font-medium">{meal.healthScore}/100</span>
                      </div>
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        <span className="text-xs">{meal.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <span>{meal.calories} kcal</span>
                      <span>{meal.protein}g protein</span>
                      <span>{meal.carbs}g carbs</span>
                      <span>{meal.fats}g fats</span>
                    </div>

                    {meal.status === 'Unsafe' && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        <div className="flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {meal.conflictReason}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={() => handleAddToMealPlan(meal.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Panel */}
      {showComparison && comparisonList.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-md w-full z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Compare Meals</h3>
            <button
              onClick={() => setShowComparison(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <div className="space-y-2">
            {comparisonList.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{meal.name}</h4>
                  <div className="text-xs text-gray-600">
                    {meal.calories} kcal • {meal.protein}g protein • {meal.healthScore}/100
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFromComparison(meal.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="h-3 w-3 text-gray-600" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              // Handle comparison logic
              alert('Comparison feature coming soon!')
            }}
            className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Compare Selected Meals
          </button>
        </div>
      )}

      {/* Loading State */}
      {isPending && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span className="text-gray-700">Searching meals...</span>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 text-xs text-gray-600 z-40">
        <div className="font-medium mb-1">Keyboard Shortcuts:</div>
        <div>F - Focus search</div>
        <div>G - Grid view</div>
        <div>L - List view</div>
        <div>Esc - Close panels</div>
      </div>

      {/* Add Custom Meal Modal */}
      <AddCustomMealModal
        isOpen={showAddMealModal}
        onClose={handleCloseAddMealModal}
        onSubmit={handleAddCustomMeal}
      />
        </div>
      </div>
    </div>
  )
}

export default Meals
