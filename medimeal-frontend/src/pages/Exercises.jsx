import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Dumbbell,
  Play,
  Pause,
  Square,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Download,
  Upload,
  Share2,
  Bookmark,
  Star,
  Clock,
  Target,
  TrendingUp,
  Activity,
  Heart,
  Zap,
  Calendar,
  Filter,
  Search,
  Grid,
  List,
  MoreHorizontal,
  X,
  CheckCircle,
  AlertTriangle,
  Award,
  Timer,
  Users,
  BarChart3
} from 'lucide-react'
import ImagePlaceholder from '../components/ImagePlaceholder'

const Exercises = () => {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false)
  const [showExerciseModal, setShowExerciseModal] = useState(false)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // grid, list
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)
  const [workoutTimer, setWorkoutTimer] = useState(0)

  // Exercise data state
  const [exercises, setExercises] = useState([
    {
      id: 1,
      name: 'Push-ups',
      category: 'Strength',
      muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
      difficulty: 'Beginner',
      duration: 5,
      calories: 50,
      description: 'Classic bodyweight exercise for upper body strength',
      instructions: ['Start in plank position', 'Lower chest to ground', 'Push back up'],
      image: '💪',
      isFavorite: true,
      rating: 4.5
    },
    {
      id: 2,
      name: 'Squats',
      category: 'Strength',
      muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
      difficulty: 'Beginner',
      duration: 8,
      calories: 80,
      description: 'Fundamental lower body exercise',
      instructions: ['Stand with feet shoulder-width apart', 'Lower as if sitting in chair', 'Return to standing'],
      image: '🦵',
      isFavorite: false,
      rating: 4.2
    },
    {
      id: 3,
      name: 'Running',
      category: 'Cardio',
      muscleGroups: ['Legs', 'Core'],
      difficulty: 'Intermediate',
      duration: 30,
      calories: 300,
      description: 'High-intensity cardiovascular exercise',
      instructions: ['Maintain steady pace', 'Keep good posture', 'Breathe rhythmically'],
      image: '🏃',
      isFavorite: true,
      rating: 4.8
    },
    {
      id: 4,
      name: 'Plank',
      category: 'Core',
      muscleGroups: ['Core', 'Shoulders'],
      difficulty: 'Beginner',
      duration: 1,
      calories: 20,
      description: 'Isometric core strengthening exercise',
      instructions: ['Start in push-up position', 'Hold body straight', 'Engage core'],
      image: '🤸',
      isFavorite: false,
      rating: 4.0
    },
    {
      id: 5,
      name: 'Burpees',
      category: 'HIIT',
      muscleGroups: ['Full Body'],
      difficulty: 'Advanced',
      duration: 10,
      calories: 100,
      description: 'High-intensity full body exercise',
      instructions: ['Start standing', 'Drop to push-up', 'Jump back up', 'Jump with arms overhead'],
      image: '🔥',
      isFavorite: true,
      rating: 4.7
    }
  ])

  // Workout sessions state
  const [workoutSessions, setWorkoutSessions] = useState(() => {
    const today = new Date().toISOString().split('T')[0]
    return {
      [today]: [
        {
          id: 1,
          exerciseId: 1,
          sets: 3,
          reps: 15,
          weight: 0,
          duration: 5,
          calories: 50,
          completed: true,
          notes: 'Good form'
        },
        {
          id: 2,
          exerciseId: 2,
          sets: 3,
          reps: 20,
          weight: 0,
          duration: 8,
          calories: 80,
          completed: true,
          notes: 'Felt strong'
        }
      ]
    }
  })

  // Current workout state
  const [currentWorkout, setCurrentWorkout] = useState([])
  const [workoutStartTime, setWorkoutStartTime] = useState(null)

  // Timer effect
  useEffect(() => {
    let interval = null
    if (isWorkoutActive && workoutStartTime) {
      interval = setInterval(() => {
        setWorkoutTimer(Math.floor((Date.now() - workoutStartTime) / 1000))
      }, 1000)
    } else if (!isWorkoutActive) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isWorkoutActive, workoutStartTime])

  // Calculate daily workout stats
  const dailyStats = useMemo(() => {
    const dateKey = selectedDate.toISOString().split('T')[0]
    const sessions = workoutSessions[dateKey] || []
    
    return sessions.reduce((stats, session) => {
      const exercise = exercises.find(ex => ex.id === session.exerciseId)
      return {
        totalDuration: stats.totalDuration + session.duration,
        totalCalories: stats.totalCalories + session.calories,
        totalExercises: stats.totalExercises + 1,
        completedExercises: stats.completedExercises + (session.completed ? 1 : 0)
      }
    }, { totalDuration: 0, totalCalories: 0, totalExercises: 0, completedExercises: 0 })
  }, [workoutSessions, selectedDate, exercises])

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const weekStart = new Date(selectedDate)
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay())
    
    let totalDuration = 0
    let totalCalories = 0
    let totalWorkouts = 0
    let activeDays = 0

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const dateKey = date.toISOString().split('T')[0]
      const sessions = workoutSessions[dateKey] || []
      
      if (sessions.length > 0) {
        activeDays++
        totalWorkouts++
        sessions.forEach(session => {
          totalDuration += session.duration
          totalCalories += session.calories
        })
      }
    }

    return {
      totalDuration,
      totalCalories,
      totalWorkouts,
      activeDays,
      averageDuration: activeDays > 0 ? Math.round(totalDuration / activeDays) : 0
    }
  }, [workoutSessions, selectedDate])

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      const matchesSearch = !searchQuery || 
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.muscleGroups.some(group => group.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesFilter = filterType === 'all' || 
        exercise.category.toLowerCase() === filterType.toLowerCase() ||
        exercise.difficulty.toLowerCase() === filterType.toLowerCase()
      
      return matchesSearch && matchesFilter
    })
  }, [exercises, searchQuery, filterType])

  // Workout handlers
  const handleStartWorkout = useCallback(() => {
    setIsWorkoutActive(true)
    setWorkoutStartTime(Date.now())
    setWorkoutTimer(0)
  }, [])

  const handlePauseWorkout = useCallback(() => {
    setIsWorkoutActive(false)
  }, [])

  const handleStopWorkout = useCallback(() => {
    setIsWorkoutActive(false)
    setWorkoutStartTime(null)
    setWorkoutTimer(0)
    
    // Save workout session
    const dateKey = selectedDate.toISOString().split('T')[0]
    const newSession = {
      id: Date.now(),
      exerciseId: 0, // Custom workout
      sets: 0,
      reps: 0,
      weight: 0,
      duration: Math.floor(workoutTimer / 60),
      calories: Math.floor(workoutTimer / 60) * 10, // Rough estimate
      completed: true,
      notes: `Workout completed in ${Math.floor(workoutTimer / 60)} minutes`
    }
    
    setWorkoutSessions(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newSession]
    }))
    
    setCurrentWorkout([])
  }, [selectedDate, workoutTimer])

  const handleAddExerciseToWorkout = useCallback((exercise) => {
    const newWorkoutItem = {
      id: Date.now(),
      exerciseId: exercise.id,
      sets: 3,
      reps: 15,
      weight: 0,
      duration: exercise.duration,
      calories: exercise.calories,
      completed: false,
      notes: ''
    }
    
    setCurrentWorkout(prev => [...prev, newWorkoutItem])
  }, [])

  const handleRemoveFromWorkout = useCallback((itemId) => {
    setCurrentWorkout(prev => prev.filter(item => item.id !== itemId))
  }, [])

  const handleUpdateWorkoutItem = useCallback((itemId, updates) => {
    setCurrentWorkout(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ))
  }, [])

  const handleToggleFavorite = useCallback((exerciseId) => {
    setExercises(prev => prev.map(exercise => 
      exercise.id === exerciseId 
        ? { ...exercise, isFavorite: !exercise.isFavorite }
        : exercise
    ))
  }, [])

  const handleAddExercise = useCallback((exerciseData) => {
    const newExercise = {
      id: Date.now(),
      ...exerciseData,
      isFavorite: false,
      rating: 0
    }
    setExercises(prev => [...prev, newExercise])
    setShowExerciseModal(false)
  }, [])

  const handleDeleteExercise = useCallback((exerciseId) => {
    setExercises(prev => prev.filter(exercise => exercise.id !== exerciseId))
  }, [])

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const getDifficultyColor = useCallback((difficulty) => {
    const colors = {
      'Beginner': 'bg-green-100 text-green-700',
      'Intermediate': 'bg-yellow-100 text-yellow-700',
      'Advanced': 'bg-red-100 text-red-700'
    }
    return colors[difficulty] || 'bg-gray-100 text-gray-700'
  }, [])

  const getCategoryIcon = useCallback((category) => {
    const icons = {
      'Strength': '💪',
      'Cardio': '❤️',
      'Core': '🤸',
      'HIIT': '🔥',
      'Flexibility': '🧘',
      'Yoga': '🧘‍♀️'
    }
    return icons[category] || '🏃'
  }, [])

  const dateKey = selectedDate.toISOString().split('T')[0]
  const todaySessions = workoutSessions[dateKey] || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exercises</h2>
          <p className="text-gray-600 mt-1">Track your workouts and exercise routines</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAnalyticsModal(true)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setShowExerciseModal(true)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Exercise
          </button>
          <button
            onClick={() => setShowAddWorkoutModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Workout
          </button>
        </div>
      </div>

      {/* Workout Timer */}
      {isWorkoutActive && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-green-700">
                {formatTime(workoutTimer)}
              </div>
              <div>
                <div className="text-sm text-green-600">Workout in Progress</div>
                <div className="text-xs text-green-500">
                  {currentWorkout.length} exercises • {currentWorkout.filter(item => item.completed).length} completed
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePauseWorkout}
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Pause className="h-4 w-4" />
              </button>
              <button
                onClick={handleStopWorkout}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Square className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Today's Workout</h3>
          <div className="text-sm text-gray-600">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{dailyStats.totalDuration}</div>
            <div className="text-xs text-green-600">Minutes</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-700">{dailyStats.totalCalories}</div>
            <div className="text-xs text-orange-600">Calories</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{dailyStats.totalExercises}</div>
            <div className="text-xs text-blue-600">Exercises</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">{dailyStats.completedExercises}</div>
            <div className="text-xs text-purple-600">Completed</div>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">This Week</h4>
            <div className="text-sm text-gray-600">
              {weeklyStats.activeDays} active days
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Total Duration</div>
              <div className="font-semibold text-gray-900">{weeklyStats.totalDuration} min</div>
            </div>
            <div>
              <div className="text-gray-600">Total Calories</div>
              <div className="font-semibold text-gray-900">{weeklyStats.totalCalories}</div>
            </div>
            <div>
              <div className="text-gray-600">Avg Duration</div>
              <div className="font-semibold text-gray-900">{weeklyStats.averageDuration} min</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="all">All Categories</option>
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="core">Core</option>
              <option value="hiit">HIIT</option>
              <option value="flexibility">Flexibility</option>
            </select>
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <Grid className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <List className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Exercises Grid/List */}
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
          : 'space-y-4'
        }>
          {filteredExercises.map(exercise => (
            <div
              key={exercise.id}
              className={`border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow ${
                viewMode === 'list' ? 'flex items-center space-x-4' : ''
              }`}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{exercise.image}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                        <div className="text-sm text-gray-600">{exercise.category}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleFavorite(exercise.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Star className={`h-4 w-4 ${exercise.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                    </button>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{exercise.duration} min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Calories</span>
                      <span className="font-medium">{exercise.calories}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Difficulty</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                        {exercise.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleAddExerciseToWorkout(exercise)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Add to Workout
                    </button>
                    <button
                      onClick={() => handleDeleteExercise(exercise.id)}
                      className="p-2 hover:bg-gray-100 rounded ml-2"
                    >
                      <Trash2 className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-2xl">{exercise.image}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                        <div className="text-sm text-gray-600">
                          {exercise.category} • {exercise.duration} min • {exercise.calories} cal
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                          {exercise.difficulty}
                        </span>
                        <button
                          onClick={() => handleToggleFavorite(exercise.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Star className={`h-4 w-4 ${exercise.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                        </button>
                        <button
                          onClick={() => handleAddExerciseToWorkout(exercise)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Workout Modal */}
      {showAddWorkoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Start New Workout</h3>
              <button
                onClick={() => setShowAddWorkoutModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workout Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="e.g., Morning Strength Training"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workout Type
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
                  <option value="strength">Strength Training</option>
                  <option value="cardio">Cardio</option>
                  <option value="hiit">HIIT</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddWorkoutModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowAddWorkoutModal(false)
                    handleStartWorkout()
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Workout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Exercise</h3>
              <button
                onClick={() => setShowExerciseModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exercise Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="e.g., Bicep Curls"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Core">Core</option>
                    <option value="HIIT">HIIT</option>
                    <option value="Flexibility">Flexibility</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calories
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowExerciseModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowExerciseModal(false)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Exercise
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
              <h3 className="text-xl font-semibold text-gray-900">Exercise Analytics</h3>
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
                <h4 className="font-medium text-gray-900 mb-2">Workout Trends</h4>
                <p className="text-sm text-gray-600">Detailed workout analytics and trends would be displayed here</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Activity className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">Performance Metrics</h4>
                <p className="text-sm text-gray-600">Performance tracking and improvement metrics would be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Exercises
