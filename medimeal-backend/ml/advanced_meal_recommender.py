"""
Advanced Meal Recommendation System using Multiple ML Algorithms
Designed for Google Colab training and deployment
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score
import xgboost as xgb
import lightgbm as lgb
from catboost import CatBoostRegressor
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import pickle
import warnings
warnings.filterwarnings('ignore')

class AdvancedMealRecommender:
    """
    Multi-algorithm meal recommendation system with ensemble learning
    """
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.feature_columns = []
        self.is_trained = False
        
    def prepare_features(self, meals_df, users_df=None):
        """Prepare comprehensive feature matrix for training"""
        
        # Meal features
        meal_features = meals_df[['calories', 'protein', 'carbs', 'fats', 'fiber', 
                                 'sodium', 'sugar', 'nutritional_score', 'glycemic_index',
                                 'inflammation_score', 'prep_time', 'cost_estimate']].copy()
        
        # Encode categorical features
        le_type = LabelEncoder()
        le_cuisine = LabelEncoder()
        
        meal_features['type_encoded'] = le_type.fit_transform(meals_df['type'])
        meal_features['cuisine_encoded'] = le_cuisine.fit_transform(meals_df['cuisine'])
        
        # Store encoders
        self.encoders['type'] = le_type
        self.encoders['cuisine'] = le_cuisine
        
        # One-hot encode dietary tags
        all_tags = set()
        for tags in meals_df['tags']:
            if isinstance(tags, list):
                all_tags.update(tags)
        
        for tag in all_tags:
            meal_features[f'tag_{tag}'] = meals_df['tags'].apply(
                lambda x: 1 if tag in x else 0
            )
        
        # One-hot encode allergens
        all_allergens = set()
        for allergens in meals_df['allergens']:
            if isinstance(allergens, list):
                all_allergens.update(allergens)
        
        for allergen in all_allergens:
            meal_features[f'allergen_{allergen}'] = meals_df['allergens'].apply(
                lambda x: 1 if allergen in x else 0
            )
        
        self.feature_columns = meal_features.columns.tolist()
        return meal_features
    
    def create_training_data(self, meals_df, users_df, n_samples=5000):
        """Create training data by simulating user-meal interactions"""
        
        training_data = []
        
        for _ in range(n_samples):
            # Random user and meal
            user = users_df.sample(1).iloc[0]
            meal = meals_df.sample(1).iloc[0]
            
            # Calculate compatibility score (0-100)
            score = self._calculate_compatibility(user, meal)
            
            # Create feature vector
            features = {
                # User features
                'user_age': user['age'],
                'user_bmi': user['bmi'],
                'user_target_calories': user['target_calories'],
                'user_activity_level': self._encode_activity(user['activity_level']),
                'user_bp_systolic': user['bp_systolic'],
                'user_blood_sugar': user['blood_sugar'],
                'user_stress_level': user['stress_level'],
                
                # Meal features
                'meal_calories': meal['calories'],
                'meal_protein': meal['protein'],
                'meal_carbs': meal['carbs'],
                'meal_fats': meal['fats'],
                'meal_fiber': meal['fiber'],
                'meal_sodium': meal['sodium'],
                'meal_nutritional_score': meal['nutritional_score'],
                'meal_glycemic_index': meal['glycemic_index'],
                
                # Compatibility features
                'calorie_match': abs(meal['calories'] - user['target_calories']/4) / (user['target_calories']/4),
                'health_compatibility': self._health_compatibility(user, meal),
                'dietary_match': self._dietary_match(user, meal),
                'allergen_conflict': self._allergen_conflict(user, meal),
                
                # Target
                'compatibility_score': score
            }
            
            training_data.append(features)
        
        return pd.DataFrame(training_data)
    
    def _calculate_compatibility(self, user, meal):
        """Calculate user-meal compatibility score"""
        score = 50  # Base score
        
        # Calorie matching
        calorie_diff = abs(meal['calories'] - user['target_calories']/4)
        score += max(0, 20 - calorie_diff/20)
        
        # Health condition compatibility
        if 'diabetes' in user['health_conditions']:
            if meal['glycemic_index'] < 55:
                score += 15
            elif meal['glycemic_index'] > 70:
                score -= 20
        
        if 'hypertension' in user['health_conditions']:
            if meal['sodium'] < 500:
                score += 10
            elif meal['sodium'] > 1500:
                score -= 15
        
        # Dietary preferences
        for pref in user['dietary_preferences']:
            if pref in meal['tags']:
                score += 10
        
        # Allergen conflicts
        for allergy in user['allergies']:
            if allergy in meal['allergens']:
                score -= 30
        
        # Nutritional quality
        score += meal['nutritional_score'] * 0.2
        
        return max(0, min(100, score))
    
    def _encode_activity(self, activity):
        """Encode activity level to numeric"""
        mapping = {'sedentary': 1, 'lightly_active': 2, 'moderately_active': 3, 
                  'very_active': 4, 'extremely_active': 5}
        return mapping.get(activity, 2)
    
    def _health_compatibility(self, user, meal):
        """Calculate health-based compatibility"""
        score = 0
        if 'diabetes' in user['health_conditions'] and 'diabetic-friendly' in meal['tags']:
            score += 1
        if 'hypertension' in user['health_conditions'] and 'low-sodium' in meal['tags']:
            score += 1
        if 'heart_disease' in user['health_conditions'] and 'heart-healthy' in meal['tags']:
            score += 1
        return score
    
    def _dietary_match(self, user, meal):
        """Calculate dietary preference match"""
        matches = 0
        for pref in user['dietary_preferences']:
            if pref in meal['tags']:
                matches += 1
        return matches
    
    def _allergen_conflict(self, user, meal):
        """Check for allergen conflicts"""
        conflicts = 0
        for allergy in user['allergies']:
            if allergy in meal['allergens']:
                conflicts += 1
        return conflicts
    
    def train_models(self, training_df):
        """Train multiple ML models"""
        
        # Prepare features and target
        feature_cols = [col for col in training_df.columns if col != 'compatibility_score']
        X = training_df[feature_cols]
        y = training_df['compatibility_score']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        self.scalers['main'] = scaler
        
        # Train multiple models
        models_to_train = {
            'random_forest': RandomForestRegressor(n_estimators=100, random_state=42),
            'xgboost': xgb.XGBRegressor(n_estimators=100, random_state=42),
            'lightgbm': lgb.LGBMRegressor(n_estimators=100, random_state=42),
            'catboost': CatBoostRegressor(iterations=100, random_state=42, verbose=False),
            'neural_network': MLPRegressor(hidden_layer_sizes=(100, 50), random_state=42, max_iter=500)
        }
        
        results = {}
        
        for name, model in models_to_train.items():
            print(f"Training {name}...")
            
            if name == 'neural_network':
                model.fit(X_train_scaled, y_train)
                y_pred = model.predict(X_test_scaled)
            else:
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
            
            # Evaluate
            mse = mean_squared_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            results[name] = {
                'model': model,
                'mse': mse,
                'r2': r2,
                'rmse': np.sqrt(mse)
            }
            
            print(f"{name} - RMSE: {np.sqrt(mse):.3f}, R²: {r2:.3f}")
        
        self.models = {name: result['model'] for name, result in results.items()}
        self.is_trained = True
        
        return results
    
    def create_deep_learning_model(self, input_dim):
        """Create advanced neural network for meal recommendation"""
        
        model = keras.Sequential([
            layers.Dense(256, activation='relu', input_shape=(input_dim,)),
            layers.Dropout(0.3),
            layers.Dense(128, activation='relu'),
            layers.Dropout(0.2),
            layers.Dense(64, activation='relu'),
            layers.Dropout(0.1),
            layers.Dense(32, activation='relu'),
            layers.Dense(1, activation='sigmoid')  # Output 0-1, scale to 0-100
        ])
        
        model.compile(
            optimizer='adam',
            loss='mse',
            metrics=['mae']
        )
        
        return model
    
    def train_deep_model(self, training_df, epochs=100):
        """Train deep learning model"""
        
        feature_cols = [col for col in training_df.columns if col != 'compatibility_score']
        X = training_df[feature_cols]
        y = training_df['compatibility_score'] / 100.0  # Normalize to 0-1
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        if 'deep' not in self.scalers:
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            self.scalers['deep'] = scaler
        else:
            scaler = self.scalers['deep']
            X_train_scaled = scaler.transform(X_train)
        
        X_test_scaled = scaler.transform(X_test)
        
        # Create and train model
        model = self.create_deep_learning_model(X_train.shape[1])
        
        # Callbacks
        early_stopping = keras.callbacks.EarlyStopping(
            monitor='val_loss', patience=10, restore_best_weights=True
        )
        
        reduce_lr = keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss', factor=0.2, patience=5, min_lr=0.0001
        )
        
        # Train
        history = model.fit(
            X_train_scaled, y_train,
            validation_data=(X_test_scaled, y_test),
            epochs=epochs,
            batch_size=32,
            callbacks=[early_stopping, reduce_lr],
            verbose=1
        )
        
        self.models['deep_learning'] = model
        
        # Evaluate
        y_pred = model.predict(X_test_scaled) * 100  # Scale back to 0-100
        y_test_scaled = y_test * 100
        
        mse = mean_squared_error(y_test_scaled, y_pred)
        r2 = r2_score(y_test_scaled, y_pred)
        
        print(f"Deep Learning Model - RMSE: {np.sqrt(mse):.3f}, R²: {r2:.3f}")
        
        return history, {'mse': mse, 'r2': r2, 'rmse': np.sqrt(mse)}
    
    def ensemble_predict(self, user_features, meal_features):
        """Make predictions using ensemble of models"""
        
        if not self.is_trained:
            raise ValueError("Models not trained yet!")
        
        # Prepare feature vector
        feature_vector = np.array([
            user_features['age'], user_features['bmi'], user_features['target_calories'],
            self._encode_activity(user_features['activity_level']),
            user_features['bp_systolic'], user_features['blood_sugar'], user_features['stress_level'],
            meal_features['calories'], meal_features['protein'], meal_features['carbs'],
            meal_features['fats'], meal_features['fiber'], meal_features['sodium'],
            meal_features['nutritional_score'], meal_features['glycemic_index'],
            # Add compatibility features
            abs(meal_features['calories'] - user_features['target_calories']/4) / (user_features['target_calories']/4),
            0, 0, 0  # Placeholder for health, dietary, allergen compatibility
        ]).reshape(1, -1)
        
        predictions = {}
        
        # Get predictions from all models
        for name, model in self.models.items():
            if name == 'deep_learning':
                scaled_features = self.scalers['deep'].transform(feature_vector)
                pred = model.predict(scaled_features)[0][0] * 100
            elif name == 'neural_network':
                scaled_features = self.scalers['main'].transform(feature_vector)
                pred = model.predict(scaled_features)[0]
            else:
                pred = model.predict(feature_vector)[0]
            
            predictions[name] = pred
        
        # Ensemble prediction (weighted average)
        weights = {
            'random_forest': 0.2,
            'xgboost': 0.25,
            'lightgbm': 0.2,
            'catboost': 0.15,
            'neural_network': 0.1,
            'deep_learning': 0.1
        }
        
        ensemble_score = sum(predictions[name] * weights.get(name, 0.1) 
                           for name in predictions.keys())
        
        return {
            'ensemble_score': ensemble_score,
            'individual_predictions': predictions
        }
    
    def save_models(self, filepath_prefix):
        """Save all trained models"""
        
        # Save traditional ML models
        for name, model in self.models.items():
            if name != 'deep_learning':
                with open(f"{filepath_prefix}_{name}.pkl", 'wb') as f:
                    pickle.dump(model, f)
        
        # Save deep learning model
        if 'deep_learning' in self.models:
            self.models['deep_learning'].save(f"{filepath_prefix}_deep_learning.h5")
        
        # Save scalers and encoders
        with open(f"{filepath_prefix}_scalers.pkl", 'wb') as f:
            pickle.dump(self.scalers, f)
        
        with open(f"{filepath_prefix}_encoders.pkl", 'wb') as f:
            pickle.dump(self.encoders, f)
        
        print(f"✅ All models saved with prefix: {filepath_prefix}")
    
    def load_models(self, filepath_prefix):
        """Load all trained models"""
        
        # Load traditional ML models
        model_names = ['random_forest', 'xgboost', 'lightgbm', 'catboost', 'neural_network']
        
        for name in model_names:
            try:
                with open(f"{filepath_prefix}_{name}.pkl", 'rb') as f:
                    self.models[name] = pickle.load(f)
            except FileNotFoundError:
                print(f"Warning: {name} model not found")
        
        # Load deep learning model
        try:
            self.models['deep_learning'] = keras.models.load_model(f"{filepath_prefix}_deep_learning.h5")
        except:
            print("Warning: Deep learning model not found")
        
        # Load scalers and encoders
        try:
            with open(f"{filepath_prefix}_scalers.pkl", 'rb') as f:
                self.scalers = pickle.load(f)
            
            with open(f"{filepath_prefix}_encoders.pkl", 'rb') as f:
                self.encoders = pickle.load(f)
        except FileNotFoundError:
            print("Warning: Scalers/encoders not found")
        
        self.is_trained = len(self.models) > 0
        print(f"✅ Loaded {len(self.models)} models")


# Example usage for Google Colab
def train_advanced_recommender_colab():
    """
    Complete training pipeline for Google Colab
    """
    
    print("🚀 Starting Advanced Meal Recommender Training...")
    
    # This would be called after generating the datasets in Colab
    # recommender = AdvancedMealRecommender()
    # training_data = recommender.create_training_data(meals_df, users_df, n_samples=10000)
    # results = recommender.train_models(training_data)
    # deep_results = recommender.train_deep_model(training_data)
    # recommender.save_models('/content/medimeal_models')
    
    return "Training pipeline ready for Colab execution!"

if __name__ == "__main__":
    print(train_advanced_recommender_colab())