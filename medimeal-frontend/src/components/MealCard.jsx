import { memo, useState, useCallback } from 'react'
import { Heart, Clock, Star, X, Plus } from 'lucide-react'
import { getMealImage, getMealTypeColor } from '../utils/mealImages'

const MealCard = memo(({ 
  meal, 
  viewMode, 
  favorites, 
  onAddToFavorites, 
  onRemoveMeal, 
  getMealImage 
}) => {
  // Get the appropriate image for this meal
  const mealImage = getMealImage(meal)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  const handleImageError = useCallback(() => {
    setImageError(true)
  }, [])

  if (viewMode === 'grid') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          {!imageError ? (
            <img 
              src={mealImage}
              alt={meal.name}
              className={`w-full h-48 object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-4xl">🍽️</span>
            </div>
          )}
          
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
          )}
          
          <button
            onClick={() => onAddToFavorites(meal.id)}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          >
            <Heart className={`h-4 w-4 ${favorites.has(meal.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
          </button>
          <button
            onClick={() => onRemoveMeal(meal.id)}
            className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
              {meal.name}
            </h4>
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

          <div className="flex items-center justify-start text-xs text-gray-600 mb-3">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{meal.cookDuration}</span>
            </div>
          </div>

          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-medium transition-colors">
            Add to Meal Plan
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/4">
          {!imageError ? (
            <img 
              src={mealImage}
              alt={meal.name}
              className={`w-full h-48 md:h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-48 md:h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-4xl">🍽️</span>
            </div>
          )}
          
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
          )}
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
                <span className="text-sm text-gray-600">{meal.difficulty}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onAddToFavorites(meal.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Heart className={`h-5 w-5 ${favorites.has(meal.id) ? 'text-red-500 fill-current' : ''}`} />
              </button>
              <button
                onClick={() => onRemoveMeal(meal.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <p className="text-gray-600 mb-4">{meal.description}</p>

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

          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add to Meal Plan
          </button>
        </div>
      </div>
    </div>
  )
})

MealCard.displayName = 'MealCard'

export default MealCard