import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, TrendingUp, Clock, Star, Plus, Bell } from 'lucide-react'
import mealsData from '../../data/meals.json'
import ImagePlaceholder from '../ImagePlaceholder'

const RightPanel = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recommendedMeals] = useState(mealsData.slice(0, 3))
  const [popularMeals] = useState(mealsData.slice(3, 6))

  const handleAddToMealPlan = (mealId) => {
    console.log('Adding meal to plan:', mealId)
    alert(`Added meal ${mealId} to your meal plan!`)
  }

  const handleNotifications = () => {
    navigate('/alerts')
  }

  const quickStats = [
    { label: 'Prescriptions Uploaded', value: '3', icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Conflicts Avoided', value: '12', icon: Clock, color: 'text-green-600' },
    { label: 'Meals Recommended', value: '28', icon: Star, color: 'text-purple-600' },
  ]

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* User Profile */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <ImagePlaceholder 
            width={40}
            height={40}
            text="👤"
            bgColor="#dbeafe"
            textColor="#2563eb"
            className="rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {user?.displayName || user?.email?.split('@')[0] || 'User'}
            </h3>
            <p className="text-xs text-gray-600">Member</p>
          </div>
          <button 
            onClick={handleNotifications}
            className="ml-auto p-1 rounded-lg hover:bg-gray-50"
          >
            <Bell className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Health Streak</span>
            <span>7 days</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{width: '70%'}}></div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6 border-b border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">Quick Stats</h4>
        <div className="space-y-3">
          {quickStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-sm text-gray-600">{stat.label}</span>
              </div>
              <span className="font-semibold text-gray-900">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Menu */}
      <div className="p-6 border-b border-gray-100">
        <h4 className="font-semibold text-gray-900 mb-4 text-sm">Popular Menu</h4>
        <div className="space-y-3">
          {popularMeals.map((meal, index) => (
            <div key={meal.id} className="flex items-center space-x-3">
              <ImagePlaceholder 
                width={32}
                height={32}
                text="🍽️"
                bgColor={index === 0 ? "#fef3c7" : index === 1 ? "#f0fdf4" : "#fef2f2"}
                textColor={index === 0 ? "#d97706" : index === 1 ? "#16a34a" : "#dc2626"}
                className="rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {meal.name}
                </p>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600">{meal.rating}/5</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-600">{meal.type}</span>
                </div>
              </div>
              <button 
                onClick={() => handleAddToMealPlan(meal.id)}
                className="p-1 rounded-md hover:bg-gray-50"
              >
                <Plus className="h-3 w-3 text-green-600" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Menu */}
      <div className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4 text-sm">Recommended Menu</h4>
        <div className="space-y-3">
          {recommendedMeals.map((meal, index) => (
            <div key={meal.id} className="flex items-center space-x-3">
              <ImagePlaceholder 
                width={32}
                height={32}
                text="🥗"
                bgColor={index === 0 ? "#f0fdf4" : index === 1 ? "#fef3c7" : "#fef2f2"}
                textColor={index === 0 ? "#16a34a" : index === 1 ? "#d97706" : "#dc2626"}
                className="rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {meal.name}
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <span>{meal.type}</span>
                  <span>•</span>
                  <span>{meal.calories} kcal</span>
                  <span>•</span>
                  <span>{meal.protein}g P</span>
                </div>
              </div>
              <button 
                onClick={() => handleAddToMealPlan(meal.id)}
                className="p-1 rounded-md hover:bg-gray-50"
              >
                <Plus className="h-3 w-3 text-green-600" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RightPanel
