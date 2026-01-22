/**
 * Integration script to connect Python KNN API with Node.js backend
 */

const axios = require('axios');

class KNNRecommendationService {
  constructor(knnApiUrl = 'http://localhost:5001') {
    this.knnApiUrl = knnApiUrl;
  }

  async getRecommendations(userProfile) {
    try {
      const response = await axios.post(`${this.knnApiUrl}/recommend`, {
        target_calories: userProfile.targetCalories || 500,
        preferred_meal_type: userProfile.preferredMealType || 'lunch',
        dietary_preferences: userProfile.dietaryPreferences || [],
        health_conditions: userProfile.healthConditions || [],
        allergies: userProfile.allergies || [],
        n_recommendations: userProfile.nRecommendations || 5
      });

      return response.data;
    } catch (error) {
      console.error('KNN API Error:', error.message);
      throw new Error('Failed to get KNN recommendations');
    }
  }

  async trainModel(mealsData) {
    try {
      const response = await axios.post(`${this.knnApiUrl}/train`, {
        meals: mealsData
      });
      return response.data;
    } catch (error) {
      console.error('KNN Training Error:', error.message);
      throw new Error('Failed to train KNN model');
    }
  }

  async getModelInfo() {
    try {
      const response = await axios.get(`${this.knnApiUrl}/model/info`);
      return response.data;
    } catch (error) {
      console.error('KNN Model Info Error:', error.message);
      throw new Error('Failed to get model info');
    }
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${this.knnApiUrl}/health`);
      return response.data;
    } catch (error) {
      console.error('KNN Health Check Error:', error.message);
      return { status: 'unhealthy', model_loaded: false };
    }
  }
}

module.exports = KNNRecommendationService;
