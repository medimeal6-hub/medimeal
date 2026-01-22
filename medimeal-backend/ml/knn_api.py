"""
Flask API wrapper for KNN Meal Recommender
Provides REST endpoints for meal recommendations
"""

from flask import Flask, request, jsonify
import json
import os
from knn_recommender import MealKNNRecommender, create_sample_data
from cluster_recommender import MealClusterRecommender
import traceback

app = Flask(__name__)

# Global recommender instances
recommender = None
cluster_recommender = None

def initialize_recommender():
    """Initialize the KNN recommender with sample data"""
    global recommender, cluster_recommender
    try:
        recommender = MealKNNRecommender(n_neighbors=5, metric='cosine')
        cluster_recommender = MealClusterRecommender(n_clusters=8)
        
        # Try to load existing model, otherwise train with sample data
        model_path = 'meal_knn_model.pkl'
        cluster_model_path = 'meal_cluster_model.pkl'
        if os.path.exists(model_path):
            recommender.load_model(model_path)
            print("Loaded existing KNN model")
        else:
            sample_meals = create_sample_data()
            recommender.fit(sample_meals)
            recommender.save_model(model_path)
            print("Trained new KNN model with sample data")

        # Initialize cluster model
        if os.path.exists(cluster_model_path):
            cluster_recommender.load_model(cluster_model_path)
            print("Loaded existing Cluster model")
        else:
            sample_meals = create_sample_data()
            cluster_recommender.fit(sample_meals)
            cluster_recommender.save_model(cluster_model_path)
            print("Trained new Cluster model with sample data")
            
    except Exception as e:
        print(f"Error initializing recommender: {e}")
        traceback.print_exc()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': recommender is not None
    })

@app.route('/recommend', methods=['POST'])
def get_recommendations():
    """Get meal recommendations based on user profile"""
    try:
        if recommender is None:
            return jsonify({
                'success': False,
                'message': 'Recommender not initialized'
            }), 500
        
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'No JSON data provided'
            }), 400
        
        # Extract user profile
        user_profile = {
            'target_calories': data.get('target_calories', 500),
            'preferred_meal_type': data.get('preferred_meal_type', 'lunch'),
            'dietary_preferences': data.get('dietary_preferences', []),
            'health_conditions': data.get('health_conditions', []),
            'allergies': data.get('allergies', [])
        }
        
        n_recommendations = data.get('n_recommendations', 5)
        
        # Get recommendations
        recommendations = recommender.recommend(user_profile, n_recommendations)
        
        return jsonify({
            'success': True,
            'data': {
                'recommendations': recommendations,
                'user_profile': user_profile,
                'total_recommendations': len(recommendations)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error generating recommendations: {str(e)}'
        }), 500

@app.route('/train', methods=['POST'])
def train_model():
    """Retrain the model with new meal data"""
    try:
        if recommender is None:
            return jsonify({
                'success': False,
                'message': 'Recommender not initialized'
            }), 500
        
        data = request.get_json()
        if not data or 'meals' not in data:
            return jsonify({
                'success': False,
                'message': 'No meals data provided'
            }), 400
        
        meals_data = data['meals']
        if not isinstance(meals_data, list):
            return jsonify({
                'success': False,
                'message': 'Meals data must be a list'
            }), 400
        
        # Retrain model
        recommender.fit(meals_data)
        recommender.save_model('meal_knn_model.pkl')
        
        return jsonify({
            'success': True,
            'message': f'Model retrained with {len(meals_data)} meals'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error training model: {str(e)}'
        }), 500

@app.route('/model/info', methods=['GET'])
def model_info():
    """Get information about the current model"""
    try:
        if recommender is None:
            return jsonify({
                'success': False,
                'message': 'Recommender not initialized'
            }), 500
        
        info = {
            'n_neighbors': recommender.n_neighbors,
            'metric': recommender.metric,
            'feature_count': len(recommender.feature_columns),
            'meal_count': len(recommender.meals_df) if recommender.meals_df is not None else 0,
            'feature_columns': recommender.feature_columns[:10]  # First 10 features
        }
        
        return jsonify({
            'success': True,
            'data': info
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error getting model info: {str(e)}'
        }), 500

@app.route('/cluster/recommend', methods=['POST'])
def cluster_recommend():
    """Get meal recommendations using K-Means clustering"""
    try:
        if cluster_recommender is None:
            return jsonify({'success': False, 'message': 'Cluster recommender not initialized'}), 500

        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No JSON data provided'}), 400

        user_profile = {
            'target_calories': data.get('target_calories', 500),
            'preferred_meal_type': data.get('preferred_meal_type', 'lunch'),
            'dietary_preferences': data.get('dietary_preferences', []),
            'health_conditions': data.get('health_conditions', []),
            'allergies': data.get('allergies', [])
        }
        n_recommendations = data.get('n_recommendations', 5)

        recs = cluster_recommender.recommend(user_profile, n_recommendations)
        return jsonify({'success': True, 'data': {'recommendations': recs, 'user_profile': user_profile, 'total_recommendations': len(recs)}})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error generating cluster recommendations: {str(e)}'}), 500

@app.route('/cluster/train', methods=['POST'])
def cluster_train():
    """Retrain clustering model with new data"""
    try:
        if cluster_recommender is None:
            return jsonify({'success': False, 'message': 'Cluster recommender not initialized'}), 500
        data = request.get_json()
        if not data or 'meals' not in data:
            return jsonify({'success': False, 'message': 'No meals data provided'}), 400
        meals_data = data['meals']
        if not isinstance(meals_data, list):
            return jsonify({'success': False, 'message': 'Meals data must be a list'}), 400
        cluster_recommender.fit(meals_data)
        cluster_recommender.save_model('meal_cluster_model.pkl')
        return jsonify({'success': True, 'message': f'Cluster model retrained with {len(meals_data)} meals'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error training cluster model: {str(e)}'}), 500

@app.route('/cluster/model/info', methods=['GET'])
def cluster_model_info():
    try:
        if cluster_recommender is None:
            return jsonify({'success': False, 'message': 'Cluster recommender not initialized'}), 500
        info = {
            'n_clusters': cluster_recommender.n_clusters,
            'feature_count': len(cluster_recommender.feature_columns),
            'meal_count': len(cluster_recommender.meals_df) if cluster_recommender.meals_df is not None else 0,
        }
        return jsonify({'success': True, 'data': info})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error getting cluster model info: {str(e)}'}), 500

if __name__ == '__main__':
    print("Starting KNN Meal Recommender API...")
    initialize_recommender()
    app.run(host='0.0.0.0', port=5001, debug=True)

