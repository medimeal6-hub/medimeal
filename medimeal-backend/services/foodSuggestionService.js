// Food suggestion service based on medications and dietary restrictions
class FoodSuggestionService {
  constructor() {
    // Medication-specific food recommendations
    this.medicationFoodMap = {
      // Blood pressure medications
      'metformin': {
        avoid: ['high-sugar', 'processed-carbs', 'alcohol'],
        recommend: ['low-glycemic', 'fiber-rich', 'lean-protein'],
        timing: 'with-meals',
        notes: 'Take with meals to reduce stomach upset'
      },
      'lisinopril': {
        avoid: ['high-potassium', 'salt-heavy'],
        recommend: ['moderate-potassium', 'low-sodium'],
        timing: 'morning',
        notes: 'Avoid high potassium foods like bananas and oranges'
      },
      'amlodipine': {
        avoid: ['grapefruit', 'high-fat'],
        recommend: ['low-fat', 'heart-healthy'],
        timing: 'morning',
        notes: 'Avoid grapefruit as it can increase side effects'
      },
      
      // Cholesterol medications
      'atorvastatin': {
        avoid: ['grapefruit', 'high-fat'],
        recommend: ['low-fat', 'fiber-rich'],
        timing: 'evening',
        notes: 'Take in evening, avoid grapefruit'
      },
      'simvastatin': {
        avoid: ['grapefruit', 'high-fat'],
        recommend: ['low-fat', 'heart-healthy'],
        timing: 'evening',
        notes: 'Avoid grapefruit completely'
      },
      
      // Blood thinners
      'warfarin': {
        avoid: ['vitamin-k-rich', 'alcohol'],
        recommend: ['consistent-vitamin-k', 'moderate-greens'],
        timing: 'evening',
        notes: 'Keep vitamin K intake consistent'
      },
      'aspirin': {
        avoid: ['alcohol', 'spicy'],
        recommend: ['gentle-foods', 'anti-inflammatory'],
        timing: 'morning',
        notes: 'Take with food to protect stomach'
      },
      
      // Thyroid medications
      'levothyroxine': {
        avoid: ['calcium-rich', 'iron-rich', 'fiber-rich'],
        recommend: ['simple-carbs', 'light-breakfast'],
        timing: 'morning',
        notes: 'Take on empty stomach, wait 1 hour before eating'
      },
      
      // Pain medications
      'ibuprofen': {
        avoid: ['alcohol', 'spicy', 'acidic'],
        recommend: ['gentle-foods', 'anti-inflammatory'],
        timing: 'with-meals',
        notes: 'Always take with food to protect stomach'
      },
      'acetaminophen': {
        avoid: ['alcohol'],
        recommend: ['gentle-foods'],
        timing: 'with-meals',
        notes: 'Avoid alcohol completely'
      }
    };

    // Food categories with examples
    this.foodCategories = {
      'low-glycemic': [
        'Oatmeal with berries',
        'Greek yogurt with nuts',
        'Quinoa salad',
        'Sweet potato',
        'Brown rice'
      ],
      'fiber-rich': [
        'Whole grain bread',
        'Lentils',
        'Chickpeas',
        'Broccoli',
        'Apples with skin'
      ],
      'lean-protein': [
        'Grilled chicken breast',
        'Salmon',
        'Turkey',
        'Eggs',
        'Greek yogurt'
      ],
      'low-sodium': [
        'Fresh vegetables',
        'Unsalted nuts',
        'Fresh fruits',
        'Homemade soups',
        'Herbs and spices'
      ],
      'heart-healthy': [
        'Avocado',
        'Olive oil',
        'Nuts and seeds',
        'Fatty fish',
        'Dark leafy greens'
      ],
      'anti-inflammatory': [
        'Turmeric',
        'Ginger',
        'Green tea',
        'Berries',
        'Dark chocolate'
      ],
      'gentle-foods': [
        'Banana',
        'Rice',
        'Toast',
        'Applesauce',
        'Plain yogurt'
      ]
    };

    // Meal timing suggestions
    this.mealTimingSuggestions = {
      'morning': {
        breakfast: 'Light breakfast with medication',
        lunch: 'Regular lunch',
        dinner: 'Regular dinner',
        snack: 'Afternoon snack'
      },
      'evening': {
        breakfast: 'Regular breakfast',
        lunch: 'Regular lunch',
        dinner: 'Light dinner with medication',
        snack: 'Evening snack'
      },
      'with-meals': {
        breakfast: 'Take with breakfast',
        lunch: 'Take with lunch',
        dinner: 'Take with dinner',
        snack: 'Take with largest meal'
      },
      'between-meals': {
        breakfast: 'Take 1 hour before breakfast',
        lunch: 'Take between meals',
        dinner: 'Take 1 hour after dinner',
        snack: 'Take between meals'
      }
    };
  }

  // Generate food suggestions based on user's medications and preferences
  generateSuggestions(userSurveyData) {
    const suggestions = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
      warnings: [],
      generalTips: []
    };

    const { currentMedications = [], dietaryRestrictions = [], foodPreferences = [] } = userSurveyData;

    // Process each medication
    currentMedications.forEach(med => {
      const medName = med.name.toLowerCase();
      const medInfo = this.findMedicationInfo(medName);
      
      if (medInfo) {
        // Add recommended foods
        medInfo.recommend.forEach(category => {
          if (this.foodCategories[category]) {
            suggestions[this.getMealForTiming(medInfo.timing)].push(
              ...this.foodCategories[category].slice(0, 2)
            );
          }
        });

        // Add warnings
        if (medInfo.avoid.length > 0) {
          suggestions.warnings.push({
            medication: med.name,
            avoid: medInfo.avoid,
            note: medInfo.notes
          });
        }

        // Add general tips
        suggestions.generalTips.push({
          medication: med.name,
          timing: medInfo.timing,
          tip: medInfo.notes
        });
      }
    });

    // Apply dietary restrictions
    this.applyDietaryRestrictions(suggestions, dietaryRestrictions);

    // Apply food preferences
    this.applyFoodPreferences(suggestions, foodPreferences);

    // Remove duplicates and limit suggestions
    Object.keys(suggestions).forEach(meal => {
      if (Array.isArray(suggestions[meal])) {
        suggestions[meal] = [...new Set(suggestions[meal])].slice(0, 3);
      }
    });

    return suggestions;
  }

  // Find medication information (case-insensitive search)
  findMedicationInfo(medicationName) {
    const normalizedName = medicationName.toLowerCase();
    
    // Direct match
    if (this.medicationFoodMap[normalizedName]) {
      return this.medicationFoodMap[normalizedName];
    }

    // Partial match
    for (const [key, value] of Object.entries(this.medicationFoodMap)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return value;
      }
    }

    return null;
  }

  // Get appropriate meal for medication timing
  getMealForTiming(timing) {
    switch (timing) {
      case 'morning':
        return 'breakfast';
      case 'afternoon':
        return 'lunch';
      case 'evening':
        return 'dinner';
      case 'night':
        return 'snack';
      case 'with-meals':
        return 'breakfast'; // Default to breakfast
      case 'between-meals':
        return 'snack';
      default:
        return 'breakfast';
    }
  }

  // Apply dietary restrictions
  applyDietaryRestrictions(suggestions, restrictions) {
    restrictions.forEach(restriction => {
      switch (restriction) {
        case 'vegetarian':
          // Remove meat suggestions
          Object.keys(suggestions).forEach(meal => {
            if (Array.isArray(suggestions[meal])) {
              suggestions[meal] = suggestions[meal].filter(food => 
                !food.toLowerCase().includes('chicken') &&
                !food.toLowerCase().includes('turkey') &&
                !food.toLowerCase().includes('salmon') &&
                !food.toLowerCase().includes('meat')
              );
            }
          });
          break;
        case 'vegan':
          // Remove all animal products
          Object.keys(suggestions).forEach(meal => {
            if (Array.isArray(suggestions[meal])) {
              suggestions[meal] = suggestions[meal].filter(food => 
                !food.toLowerCase().includes('yogurt') &&
                !food.toLowerCase().includes('eggs') &&
                !food.toLowerCase().includes('milk') &&
                !food.toLowerCase().includes('cheese')
              );
            }
          });
          break;
        case 'gluten-free':
          // Remove gluten-containing foods
          Object.keys(suggestions).forEach(meal => {
            if (Array.isArray(suggestions[meal])) {
              suggestions[meal] = suggestions[meal].filter(food => 
                !food.toLowerCase().includes('bread') &&
                !food.toLowerCase().includes('wheat') &&
                !food.toLowerCase().includes('barley')
              );
            }
          });
          break;
        case 'dairy-free':
          // Remove dairy products
          Object.keys(suggestions).forEach(meal => {
            if (Array.isArray(suggestions[meal])) {
              suggestions[meal] = suggestions[meal].filter(food => 
                !food.toLowerCase().includes('yogurt') &&
                !food.toLowerCase().includes('milk') &&
                !food.toLowerCase().includes('cheese')
              );
            }
          });
          break;
        case 'low-sodium':
          // Add low-sodium foods
          suggestions.breakfast.push('Unsalted nuts', 'Fresh fruits');
          suggestions.lunch.push('Fresh vegetables', 'Homemade salads');
          suggestions.dinner.push('Herb-seasoned dishes', 'Fresh herbs');
          break;
        case 'diabetic-friendly':
          // Focus on low-glycemic foods
          suggestions.breakfast.push('Steel-cut oats', 'Berries');
          suggestions.lunch.push('Quinoa salad', 'Leafy greens');
          suggestions.dinner.push('Lean protein', 'Non-starchy vegetables');
          break;
      }
    });
  }

  // Apply food preferences
  applyFoodPreferences(suggestions, preferences) {
    preferences.forEach(preference => {
      switch (preference) {
        case 'spicy':
          suggestions.lunch.push('Spiced dishes', 'Curry');
          suggestions.dinner.push('Spicy stir-fry', 'Hot sauce');
          break;
        case 'mild':
          suggestions.breakfast.push('Plain oatmeal', 'Mild yogurt');
          suggestions.lunch.push('Simple salads', 'Mild soups');
          break;
        case 'fresh':
          suggestions.breakfast.push('Fresh fruits', 'Raw vegetables');
          suggestions.lunch.push('Fresh salads', 'Raw nuts');
          suggestions.dinner.push('Fresh herbs', 'Raw vegetables');
          break;
        case 'cooked':
          suggestions.breakfast.push('Cooked oatmeal', 'Scrambled eggs');
          suggestions.lunch.push('Steamed vegetables', 'Cooked grains');
          suggestions.dinner.push('Roasted vegetables', 'Cooked proteins');
          break;
      }
    });
  }

  // Get meal timing recommendations
  getMealTimingRecommendations(medications) {
    const recommendations = {};
    
    medications.forEach(med => {
      const medInfo = this.findMedicationInfo(med.name.toLowerCase());
      if (medInfo) {
        recommendations[med.name] = {
          timing: medInfo.timing,
          suggestions: this.mealTimingSuggestions[medInfo.timing] || {},
          note: medInfo.notes
        };
      }
    });

    return recommendations;
  }
}

module.exports = new FoodSuggestionService();

