/**
 * Client for Python Cluster (KMeans) Recommender API
 */

const axios = require('axios');

class ClusterRecommendationService {
  constructor(clusterApiUrl = 'http://localhost:5001') {
    this.clusterApiUrl = clusterApiUrl;
  }

  async getRecommendations(userProfile) {
    try {
      const response = await axios.post(`${this.clusterApiUrl}/cluster/recommend`, {
        target_calories: userProfile.targetCalories || 500,
        preferred_meal_type: userProfile.preferredMealType || 'lunch',
        dietary_preferences: userProfile.dietaryPreferences || [],
        health_conditions: userProfile.healthConditions || [],
        allergies: userProfile.allergies || [],
        n_recommendations: userProfile.nRecommendations || 5
      });
      return response.data;
    } catch (error) {
      console.error('Cluster API Error:', error.message);
      throw new Error('Failed to get cluster recommendations');
    }
  }

  async trainModel(mealsData) {
    try {
      const response = await axios.post(`${this.clusterApiUrl}/cluster/train`, {
        meals: mealsData
      });
      return response.data;
    } catch (error) {
      console.error('Cluster Training Error:', error.message);
      throw new Error('Failed to train cluster model');
    }
  }

  async getModelInfo() {
    try {
      const response = await axios.get(`${this.clusterApiUrl}/cluster/model/info`);
      return response.data;
    } catch (error) {
      console.error('Cluster Model Info Error:', error.message);
      throw new Error('Failed to get cluster model info');
    }
  }
}

module.exports = ClusterRecommendationService;







