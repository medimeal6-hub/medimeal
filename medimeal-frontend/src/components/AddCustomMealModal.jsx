import { useState } from 'react'
import { X, Upload, AlertTriangle, CheckCircle, Plus, Minus } from 'lucide-react'

const AddCustomMealModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Breakfast',
    description: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    difficulty: 'Easy',
    prepTime: '',
    servings: '',
    ingredients: [''],
    instructions: '',
    allergens: [],
    dietary: [],
    image: null
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
  const difficulties = ['Easy', 'Medium', 'Hard']
  const allergenOptions = ['Nuts', 'Dairy', 'Gluten', 'Soy', 'Eggs', 'Fish', 'Shellfish']
  const dietaryOptions = ['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Low-Carb', 'High-Protein', 'Low-Fat']

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index] = value
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }))
  }

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }))
  }

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        ingredients: newIngredients
      }))
    }
  }

  const handleAllergenToggle = (allergen) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }))
  }

  const handleDietaryToggle = (dietary) => {
    setFormData(prev => ({
      ...prev,
      dietary: prev.dietary.includes(dietary)
        ? prev.dietary.filter(d => d !== dietary)
        : [...prev.dietary, dietary]
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Meal name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.calories || formData.calories <= 0) {
      newErrors.calories = 'Valid calorie count is required'
    }

    if (!formData.protein || formData.protein < 0) {
      newErrors.protein = 'Valid protein amount is required'
    }

    if (!formData.carbs || formData.carbs < 0) {
      newErrors.carbs = 'Valid carb amount is required'
    }

    if (!formData.fats || formData.fats < 0) {
      newErrors.fats = 'Valid fat amount is required'
    }

    if (!formData.prepTime || formData.prepTime <= 0) {
      newErrors.prepTime = 'Valid prep time is required'
    }

    if (!formData.servings || formData.servings <= 0) {
      newErrors.servings = 'Valid serving count is required'
    }

    const validIngredients = formData.ingredients.filter(ing => ing.trim())
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required'
    }

    if (!formData.instructions.trim()) {
      newErrors.instructions = 'Instructions are required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate health score based on nutritional values
      const healthScore = Math.min(100, Math.max(0, 
        Math.round(
          (formData.protein * 4 + formData.carbs * 2 + formData.fats * 1) / 
          (formData.calories / 10) * 10
        )
      ))

      const mealData = {
        ...formData,
        calories: parseInt(formData.calories),
        protein: parseFloat(formData.protein),
        carbs: parseFloat(formData.carbs),
        fats: parseFloat(formData.fats),
        prepTime: parseInt(formData.prepTime),
        servings: parseInt(formData.servings),
        ingredients: formData.ingredients.filter(ing => ing.trim()),
        healthScore,
        rating: 4.5, // Default rating for custom meals
        status: 'Safe', // Default status
        conflictReason: '',
        id: Date.now().toString(), // Generate unique ID
        createdAt: new Date().toISOString()
      }

      await onSubmit(mealData)
      
      // Reset form
      setFormData({
        name: '',
        type: 'Breakfast',
        description: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        difficulty: 'Easy',
        prepTime: '',
        servings: '',
        ingredients: [''],
        instructions: '',
        allergens: [],
        dietary: [],
        image: null
      })
      
      onClose()
    } catch (error) {
      console.error('Error submitting meal:', error)
      setErrors({ submit: 'Failed to add meal. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Custom Meal</h2>
            <p className="text-gray-600 mt-1">Create your own healthy meal recipe</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter meal name"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                {mealTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe your meal..."
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Nutritional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutritional Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calories *
                </label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => handleInputChange('calories', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    errors.calories ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.calories && (
                  <p className="text-red-600 text-sm mt-1">{errors.calories}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Protein (g) *
                </label>
                <input
                  type="number"
                  value={formData.protein}
                  onChange={(e) => handleInputChange('protein', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    errors.protein ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
                {errors.protein && (
                  <p className="text-red-600 text-sm mt-1">{errors.protein}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carbs (g) *
                </label>
                <input
                  type="number"
                  value={formData.carbs}
                  onChange={(e) => handleInputChange('carbs', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    errors.carbs ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
                {errors.carbs && (
                  <p className="text-red-600 text-sm mt-1">{errors.carbs}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fats (g) *
                </label>
                <input
                  type="number"
                  value={formData.fats}
                  onChange={(e) => handleInputChange('fats', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    errors.fats ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
                {errors.fats && (
                  <p className="text-red-600 text-sm mt-1">{errors.fats}</p>
                )}
              </div>
            </div>
          </div>

          {/* Preparation Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preparation Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prep Time (min) *
                </label>
                <input
                  type="number"
                  value={formData.prepTime}
                  onChange={(e) => handleInputChange('prepTime', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    errors.prepTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.prepTime && (
                  <p className="text-red-600 text-sm mt-1">{errors.prepTime}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servings *
                </label>
                <input
                  type="number"
                  value={formData.servings}
                  onChange={(e) => handleInputChange('servings', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                    errors.servings ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="1"
                />
                {errors.servings && (
                  <p className="text-red-600 text-sm mt-1">{errors.servings}</p>
                )}
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ingredients *</h3>
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Ingredient
              </button>
            </div>
            <div className="space-y-3">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder={`Ingredient ${index + 1}`}
                  />
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.ingredients && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {errors.ingredients}
              </p>
            )}
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions *
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                errors.instructions ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Step-by-step cooking instructions..."
            />
            {errors.instructions && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {errors.instructions}
              </p>
            )}
          </div>

          {/* Allergens and Dietary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Allergens</h3>
              <div className="flex flex-wrap gap-2">
                {allergenOptions.map(allergen => (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => handleAllergenToggle(allergen)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.allergens.includes(allergen)
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {allergen}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Dietary Preferences</h3>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map(dietary => (
                  <button
                    key={dietary}
                    type="button"
                    onClick={() => handleDietaryToggle(dietary)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.dietary.includes(dietary)
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {dietary}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Image (Optional)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="meal-image"
              />
              <label
                htmlFor="meal-image"
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Upload className="h-4 w-4 mr-2 text-gray-600" />
                Choose Image
              </label>
              {formData.image && (
                <span className="text-sm text-gray-600">
                  {formData.image.name}
                </span>
              )}
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding Meal...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Add Meal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddCustomMealModal
