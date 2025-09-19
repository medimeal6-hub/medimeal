import { memo, useState } from 'react'
import { X, Save } from 'lucide-react'

const MealModal = memo(({ 
  showAddCustomMeal, 
  setShowAddCustomMeal, 
  newMeal, 
  setNewMeal, 
  handleAddCustomMeal 
}) => {
  if (!showAddCustomMeal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Add Custom Meal</h3>
          <button
            onClick={() => setShowAddCustomMeal(false)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleAddCustomMeal(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meal Name</label>
              <input
                type="text"
                value={newMeal.name}
                onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
              <select
                value={newMeal.type}
                onChange={(e) => setNewMeal(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
              <input
                type="number"
                value={newMeal.calories}
                onChange={(e) => setNewMeal(prev => ({ ...prev, calories: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Protein (g)</label>
              <input
                type="number"
                value={newMeal.protein}
                onChange={(e) => setNewMeal(prev => ({ ...prev, protein: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Carbs (g)</label>
              <input
                type="number"
                value={newMeal.carbs}
                onChange={(e) => setNewMeal(prev => ({ ...prev, carbs: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fats (g)</label>
              <input
                type="number"
                value={newMeal.fats}
                onChange={(e) => setNewMeal(prev => ({ ...prev, fats: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={newMeal.difficulty}
                onChange={(e) => setNewMeal(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cook Duration</label>
              <input
                type="text"
                value={newMeal.cookDuration}
                onChange={(e) => setNewMeal(prev => ({ ...prev, cookDuration: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 25 min"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Steps</label>
              <input
                type="number"
                value={newMeal.steps}
                onChange={(e) => setNewMeal(prev => ({ ...prev, steps: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={newMeal.description}
              onChange={(e) => setNewMeal(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows={3}
              required
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowAddCustomMeal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Add Meal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
})

MealModal.displayName = 'MealModal'

export default MealModal
