import { memo } from 'react'

const AdvancedFilters = memo(({ 
  advancedFilters, 
  setAdvancedFilters, 
  showAdvancedFilter 
}) => {
  if (!showAdvancedFilter) return null

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Calories</label>
          <input
            type="number"
            value={advancedFilters.maxCalories}
            onChange={(e) => setAdvancedFilters(prev => ({ ...prev, maxCalories: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="e.g., 500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Min Protein (g)</label>
          <input
            type="number"
            value={advancedFilters.minProtein}
            onChange={(e) => setAdvancedFilters(prev => ({ ...prev, minProtein: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="e.g., 20"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Cook Time (min)</label>
          <input
            type="number"
            value={advancedFilters.maxCookTime}
            onChange={(e) => setAdvancedFilters(prev => ({ ...prev, maxCookTime: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="e.g., 30"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
          <select
            value={advancedFilters.difficulty[0] || ''}
            onChange={(e) => setAdvancedFilters(prev => ({ 
              ...prev, 
              difficulty: e.target.value ? [e.target.value] : [] 
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">Any</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>
    </div>
  )
})

AdvancedFilters.displayName = 'AdvancedFilters'

export default AdvancedFilters
