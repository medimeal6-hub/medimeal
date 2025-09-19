// Meal image mapping utility
export const getMealImage = (meal) => {
  // Specific meal image mapping based on meal names
  const mealImageMap = {
    // Breakfast meals
    'Healthy Breakfast Bowl with Greek Yogurt and Berries': '/images/meals/meal2.png',
    'Avocado Toast with Poached Egg': '/images/meals/meal2.png',
    
    // Lunch meals
    'Grilled Turkey Breast with Steamed Asparagus and Brown Rice': '/images/meals/meal3.png',
    'Quinoa Salad with Grilled Chicken and Vegetables': '/images/meals/meal3.png',
    'Mediterranean Chicken Wrap': '/images/meals/meal3.png',
    
    // Dinner meals
    'Baked Salmon with Sweet Potato and Broccoli': '/images/meals/meal4.png',
    'Grilled Vegetable Pasta': '/images/meals/meal4.png',
    
    // Snack meals
    'Mixed Berry Smoothie Bowl': '/images/meals/meal5.png',
    'Greek Yogurt with Honey and Nuts': '/images/meals/meal5.png'
  }
  
  // Return specific image if mapped, otherwise fallback to type-based image
  return mealImageMap[meal.name] || getMealImageByType(meal.type)
}

// Fallback function for meal type-based images
export const getMealImageByType = (mealType) => {
  const typeImageMap = {
    'Breakfast': '/images/meals/meal2.png',
    'Lunch': '/images/meals/meal3.png',
    'Dinner': '/images/meals/meal4.png',
    'Snack': '/images/meals/meal5.png'
  }
  
  return typeImageMap[mealType] || '/images/meals/meal1.png'
}

// Get meal type color for UI consistency
export const getMealTypeColor = (mealType) => {
  const typeColorMap = {
    'Breakfast': 'bg-green-100 text-green-700',
    'Lunch': 'bg-orange-100 text-orange-700',
    'Dinner': 'bg-red-100 text-red-700',
    'Snack': 'bg-purple-100 text-purple-700'
  }
  
  return typeColorMap[mealType] || 'bg-gray-100 text-gray-700'
}

// Get meal difficulty color
export const getMealDifficultyColor = (difficulty) => {
  const difficultyColorMap = {
    'Easy': 'text-green-600',
    'Medium': 'text-yellow-600',
    'Hard': 'text-red-600'
  }
  
  return difficultyColorMap[difficulty] || 'text-gray-600'
}

// Get health score color based on score
export const getHealthScoreColor = (score) => {
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-yellow-600'
  if (score >= 70) return 'text-orange-600'
  return 'text-red-600'
}

export default {
  getMealImage,
  getMealImageByType,
  getMealTypeColor,
  getMealDifficultyColor,
  getHealthScoreColor
}
