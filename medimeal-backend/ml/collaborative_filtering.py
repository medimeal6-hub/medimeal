"""
Collaborative Filtering Recommender Class
This class definition is needed to load the trained model
"""

import numpy as np
from sklearn.preprocessing import LabelEncoder


class CollaborativeFilteringRecommender:
    """Collaborative Filtering Model for Meal Recommendations"""
    
    def __init__(self, n_factors=50, learning_rate=0.01, epochs=50):
        self.n_factors = n_factors
        self.learning_rate = learning_rate
        self.epochs = epochs
        self.user_encoder = None
        self.item_encoder = None
        self.user_factors = None
        self.item_factors = None
        self.global_bias = None
        self.n_users = None
        self.n_items = None
    
    def fit(self, interactions_df):
        """Train the collaborative filtering model"""
        self.user_encoder = LabelEncoder()
        self.item_encoder = LabelEncoder()
        
        interactions_df['user_idx'] = self.user_encoder.fit_transform(interactions_df['user_id'])
        interactions_df['item_idx'] = self.item_encoder.fit_transform(interactions_df['meal_id'])
        
        self.n_users = len(self.user_encoder.classes_)
        self.n_items = len(self.item_encoder.classes_)
        
        self.user_factors = np.random.normal(0, 0.1, (self.n_users, self.n_factors))
        self.item_factors = np.random.normal(0, 0.1, (self.n_items, self.n_factors))
        self.global_bias = interactions_df['rating'].mean()
    
    def recommend(self, user_id, n_recommendations=10):
        """Get meal recommendations for a user"""
        try:
            user_idx = self.user_encoder.transform([user_id])[0]
            scores = np.dot(self.user_factors[user_idx], self.item_factors.T)
            top_items = np.argsort(scores)[::-1][:n_recommendations]
            
            recommendations = []
            for item_idx in top_items:
                meal_id = self.item_encoder.inverse_transform([item_idx])[0]
                recommendations.append({'meal_id': meal_id, 'score': float(scores[item_idx])})
            
            return recommendations
        except Exception as e:
            print(f"Error in recommend: {str(e)}")
            return []
    
    def predict(self, user_id, meal_id):
        """Predict rating for a user-meal pair"""
        try:
            user_idx = self.user_encoder.transform([user_id])[0]
            item_idx = self.item_encoder.transform([meal_id])[0]
            
            pred = self.global_bias + np.dot(self.user_factors[user_idx], self.item_factors[item_idx])
            return float(pred)
        except:
            return float(self.global_bias) if self.global_bias is not None else 3.0
