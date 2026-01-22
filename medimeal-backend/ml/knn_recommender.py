"""
KNN-based Meal Recommendation System
Features: calories, meal type, dietary tags, health conditions compatibility
"""

import numpy as np
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics.pairwise import cosine_similarity
import json
import pickle
from typing import List, Dict, Tuple, Optional

class MealKNNRecommender:
    def __init__(self, n_neighbors: int = 5, metric: str = 'cosine'):
        self.n_neighbors = n_neighbors
        self.metric = metric
        self.model = None
        self.scaler = StandardScaler()
        self.meal_type_encoder = LabelEncoder()
        self.meals_df = None
        self.feature_columns = []
        
    def prepare_features(self, meals_data: List[Dict]) -> pd.DataFrame:
        """Convert meal data to feature matrix"""
        df = pd.DataFrame(meals_data)
        
        # Ensure required columns exist
        required_cols = ['name', 'type', 'calories', 'tags']
        for col in required_cols:
            if col not in df.columns:
                df[col] = df.get(col, [])
        
        # Fill missing values
        df['calories'] = df['calories'].fillna(df['calories'].median())
        df['tags'] = df['tags'].fillna('')
        df['allergens'] = df.get('allergens', '')
        
        # Create feature columns
        features = []
        
        # 1. Calorie features (normalized)
        features.append('calories')
        
        # 2. Meal type (one-hot encoded)
        df['type_encoded'] = self.meal_type_encoder.fit_transform(df['type'])
        features.append('type_encoded')
        
        # 3. Dietary tags (binary features)
        all_tags = set()
        for tags in df['tags']:
            if isinstance(tags, list):
                all_tags.update(tags)
            elif isinstance(tags, str):
                all_tags.update(tags.split(','))
        
        # Create binary columns for each tag
        for tag in all_tags:
            tag_col = f'tag_{tag.strip().lower().replace(" ", "_")}'
            df[tag_col] = df['tags'].apply(
                lambda x: 1 if tag in (x if isinstance(x, list) else []) else 0
            )
            features.append(tag_col)
        
        # 4. Allergen features
        all_allergens = set()
        for allergens in df['allergens']:
            if isinstance(allergens, list):
                all_allergens.update(allergens)
            elif isinstance(allergens, str):
                all_allergens.update(allergens.split(','))
        
        for allergen in all_allergens:
            allergen_col = f'allergen_{allergen.strip().lower().replace(" ", "_")}'
            df[allergen_col] = df['allergens'].apply(
                lambda x: 1 if allergen in (x if isinstance(x, list) else []) else 0
            )
            features.append(allergen_col)
        
        self.feature_columns = features
        return df[features]
    
    def fit(self, meals_data: List[Dict]):
        """Train the KNN model"""
        self.meals_df = pd.DataFrame(meals_data)
        feature_matrix = self.prepare_features(meals_data)
        
        # Scale features
        feature_matrix_scaled = self.scaler.fit_transform(feature_matrix)
        
        # Train KNN model
        self.model = NearestNeighbors(
            n_neighbors=self.n_neighbors,
            metric=self.metric,
            algorithm='auto'
        )
        self.model.fit(feature_matrix_scaled)
        
        print(f"KNN model trained on {len(meals_data)} meals with {len(self.feature_columns)} features")
    
    def recommend(self, user_profile: Dict, n_recommendations: int = 5) -> List[Dict]:
        """Generate recommendations based on user profile"""
        if self.model is None:
            raise ValueError("Model not trained. Call fit() first.")
        
        # Create user feature vector
        user_features = self._create_user_features(user_profile)
        
        # Scale user features
        user_features_scaled = self.scaler.transform([user_features])
        
        # Find nearest neighbors
        distances, indices = self.model.kneighbors(user_features_scaled)
        
        # Get recommendations
        recommendations = []
        for i, (dist, idx) in enumerate(zip(distances[0], indices[0])):
            meal = self.meals_df.iloc[idx].to_dict()
            meal['similarity_score'] = 1 - dist  # Convert distance to similarity
            meal['rank'] = i + 1
            recommendations.append(meal)
        
        return recommendations[:n_recommendations]
    
    def _create_user_features(self, user_profile: Dict) -> List[float]:
        """Create feature vector for user profile"""
        features = np.zeros(len(self.feature_columns))
        
        # Set calorie preference
        target_calories = user_profile.get('target_calories', 500)
        calories_idx = self.feature_columns.index('calories')
        features[calories_idx] = target_calories
        
        # Set meal type preference
        preferred_type = user_profile.get('preferred_meal_type', 'lunch')
        try:
            type_encoded = self.meal_type_encoder.transform([preferred_type])[0]
            type_idx = self.feature_columns.index('type_encoded')
            features[type_idx] = type_encoded
        except ValueError:
            # Unknown meal type, use default
            pass
        
        # Set dietary preferences
        dietary_preferences = user_profile.get('dietary_preferences', [])
        health_conditions = user_profile.get('health_conditions', [])
        
        for pref in dietary_preferences + health_conditions:
            tag_col = f'tag_{pref.lower().replace(" ", "_")}'
            if tag_col in self.feature_columns:
                idx = self.feature_columns.index(tag_col)
                features[idx] = 1
        
        # Set allergen restrictions
        allergies = user_profile.get('allergies', [])
        for allergy in allergies:
            allergen_col = f'allergen_{allergy.lower().replace(" ", "_")}'
            if allergen_col in self.feature_columns:
                idx = self.feature_columns.index(allergen_col)
                features[idx] = 1
        
        return features.tolist()
    
    def save_model(self, filepath: str):
        """Save trained model"""
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'meal_type_encoder': self.meal_type_encoder,
            'feature_columns': self.feature_columns,
            'meals_df': self.meals_df
        }
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str):
        """Load trained model"""
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.meal_type_encoder = model_data['meal_type_encoder']
        self.feature_columns = model_data['feature_columns']
        self.meals_df = model_data['meals_df']
        print(f"Model loaded from {filepath}")


def create_sample_data() -> List[Dict]:
    """Create comprehensive meal data for training"""
    return [
        # BREAKFAST MEALS
        {
            'name': 'Oatmeal with Berries',
            'type': 'breakfast',
            'calories': 320,
            'tags': ['vegetarian', 'diabetic-friendly', 'mediterranean', 'high-fiber'],
            'allergens': ['gluten']
        },
        {
            'name': 'Greek Yogurt + Nuts',
            'type': 'breakfast',
            'calories': 280,
            'tags': ['mediterranean', 'high-protein', 'low-carb'],
            'allergens': ['dairy', 'nuts']
        },
        {
            'name': 'Veggie Omelette',
            'type': 'breakfast',
            'calories': 350,
            'tags': ['keto', 'low-sodium', 'high-protein', 'gluten-free'],
            'allergens': ['eggs']
        },
        {
            'name': 'Avocado Toast',
            'type': 'breakfast',
            'calories': 290,
            'tags': ['vegetarian', 'mediterranean', 'healthy-fats'],
            'allergens': ['gluten']
        },
        {
            'name': 'Smoothie Bowl',
            'type': 'breakfast',
            'calories': 250,
            'tags': ['vegan', 'gluten-free', 'antioxidants'],
            'allergens': []
        },
        {
            'name': 'Pancakes with Syrup',
            'type': 'breakfast',
            'calories': 420,
            'tags': ['vegetarian', 'comfort-food'],
            'allergens': ['gluten', 'eggs', 'dairy']
        },
        {
            'name': 'Chia Pudding',
            'type': 'breakfast',
            'calories': 180,
            'tags': ['vegan', 'gluten-free', 'high-fiber', 'omega-3'],
            'allergens': []
        },
        {
            'name': 'Breakfast Burrito',
            'type': 'breakfast',
            'calories': 480,
            'tags': ['high-protein', 'comfort-food'],
            'allergens': ['gluten', 'eggs', 'dairy']
        },
        {
            'name': 'Quinoa Porridge',
            'type': 'breakfast',
            'calories': 310,
            'tags': ['vegetarian', 'gluten-free', 'high-protein', 'diabetic-friendly'],
            'allergens': []
        },
        {
            'name': 'Protein Smoothie',
            'type': 'breakfast',
            'calories': 220,
            'tags': ['high-protein', 'low-carb', 'quick'],
            'allergens': ['dairy']
        },

        # LUNCH MEALS
        {
            'name': 'Grilled Chicken Salad',
            'type': 'lunch',
            'calories': 450,
            'tags': ['keto', 'low-sodium', 'high-protein', 'gluten-free'],
            'allergens': []
        },
        {
            'name': 'Dal, Brown Rice, Salad',
            'type': 'lunch',
            'calories': 520,
            'tags': ['vegetarian', 'diabetic-friendly', 'indian', 'high-fiber'],
            'allergens': []
        },
        {
            'name': 'Paneer Tikka + Quinoa',
            'type': 'lunch',
            'calories': 540,
            'tags': ['vegetarian', 'mediterranean', 'high-protein'],
            'allergens': ['dairy']
        },
        {
            'name': 'Turkey Sandwich',
            'type': 'lunch',
            'calories': 380,
            'tags': ['high-protein', 'comfort-food'],
            'allergens': ['gluten']
        },
        {
            'name': 'Lentil Soup',
            'type': 'lunch',
            'calories': 320,
            'tags': ['vegetarian', 'vegan', 'high-fiber', 'low-fat'],
            'allergens': []
        },
        {
            'name': 'Fish Tacos',
            'type': 'lunch',
            'calories': 420,
            'tags': ['mediterranean', 'high-protein', 'omega-3'],
            'allergens': ['fish', 'gluten']
        },
        {
            'name': 'Buddha Bowl',
            'type': 'lunch',
            'calories': 480,
            'tags': ['vegan', 'gluten-free', 'antioxidants', 'high-fiber'],
            'allergens': []
        },
        {
            'name': 'Chicken Wrap',
            'type': 'lunch',
            'calories': 390,
            'tags': ['high-protein', 'low-carb'],
            'allergens': ['gluten']
        },
        {
            'name': 'Vegetable Stir-fry',
            'type': 'lunch',
            'calories': 350,
            'tags': ['vegetarian', 'vegan', 'low-fat', 'antioxidants'],
            'allergens': []
        },
        {
            'name': 'Caesar Salad',
            'type': 'lunch',
            'calories': 320,
            'tags': ['vegetarian', 'low-carb'],
            'allergens': ['dairy', 'eggs']
        },

        # DINNER MEALS
        {
            'name': 'Baked Salmon + Veggies',
            'type': 'dinner',
            'calories': 520,
            'tags': ['mediterranean', 'low-sodium', 'high-protein', 'omega-3'],
            'allergens': ['fish']
        },
        {
            'name': 'Tofu Stir-fry',
            'type': 'dinner',
            'calories': 480,
            'tags': ['vegan', 'gluten-free', 'high-protein'],
            'allergens': ['soy']
        },
        {
            'name': 'Roti + Dal + Sabji',
            'type': 'dinner',
            'calories': 560,
            'tags': ['vegetarian', 'indian', 'high-fiber'],
            'allergens': ['gluten']
        },
        {
            'name': 'Grilled Steak',
            'type': 'dinner',
            'calories': 580,
            'tags': ['keto', 'high-protein', 'iron-rich'],
            'allergens': []
        },
        {
            'name': 'Pasta Primavera',
            'type': 'dinner',
            'calories': 450,
            'tags': ['vegetarian', 'comfort-food'],
            'allergens': ['gluten', 'dairy']
        },
        {
            'name': 'Chicken Curry',
            'type': 'dinner',
            'calories': 520,
            'tags': ['high-protein', 'indian', 'anti-inflammatory'],
            'allergens': []
        },
        {
            'name': 'Vegetable Lasagna',
            'type': 'dinner',
            'calories': 480,
            'tags': ['vegetarian', 'comfort-food', 'high-fiber'],
            'allergens': ['gluten', 'dairy', 'eggs']
        },
        {
            'name': 'Grilled Fish',
            'type': 'dinner',
            'calories': 380,
            'tags': ['mediterranean', 'high-protein', 'omega-3', 'low-fat'],
            'allergens': ['fish']
        },
        {
            'name': 'Mushroom Risotto',
            'type': 'dinner',
            'calories': 420,
            'tags': ['vegetarian', 'comfort-food', 'antioxidants'],
            'allergens': ['dairy']
        },
        {
            'name': 'Beef Stir-fry',
            'type': 'dinner',
            'calories': 450,
            'tags': ['high-protein', 'iron-rich', 'low-carb'],
            'allergens': []
        },

        # SNACKS
        {
            'name': 'Apple + Peanut Butter',
            'type': 'snack',
            'calories': 220,
            'tags': ['vegetarian', 'high-fiber', 'healthy-fats'],
            'allergens': ['nuts']
        },
        {
            'name': 'Greek Yogurt',
            'type': 'snack',
            'calories': 150,
            'tags': ['high-protein', 'probiotics', 'low-carb'],
            'allergens': ['dairy']
        },
        {
            'name': 'Mixed Nuts',
            'type': 'snack',
            'calories': 200,
            'tags': ['vegetarian', 'healthy-fats', 'high-protein'],
            'allergens': ['nuts']
        },
        {
            'name': 'Hummus + Veggies',
            'type': 'snack',
            'calories': 180,
            'tags': ['vegetarian', 'vegan', 'high-fiber', 'mediterranean'],
            'allergens': []
        },
        {
            'name': 'Protein Bar',
            'type': 'snack',
            'calories': 250,
            'tags': ['high-protein', 'convenient'],
            'allergens': ['nuts']
        },
        {
            'name': 'Trail Mix',
            'type': 'snack',
            'calories': 190,
            'tags': ['vegetarian', 'healthy-fats', 'antioxidants'],
            'allergens': ['nuts']
        },
        {
            'name': 'Cheese + Crackers',
            'type': 'snack',
            'calories': 210,
            'tags': ['high-protein', 'calcium-rich'],
            'allergens': ['dairy', 'gluten']
        },
        {
            'name': 'Fruit Smoothie',
            'type': 'snack',
            'calories': 160,
            'tags': ['vegetarian', 'antioxidants', 'vitamin-c'],
            'allergens': []
        },
        {
            'name': 'Dark Chocolate',
            'type': 'snack',
            'calories': 140,
            'tags': ['vegetarian', 'antioxidants', 'mood-booster'],
            'allergens': ['dairy']
        },
        {
            'name': 'Rice Cakes + Avocado',
            'type': 'snack',
            'calories': 170,
            'tags': ['vegetarian', 'gluten-free', 'healthy-fats'],
            'allergens': []
        },

        # DIABETIC-FRIENDLY MEALS
        {
            'name': 'Quinoa Salad',
            'type': 'lunch',
            'calories': 380,
            'tags': ['vegetarian', 'diabetic-friendly', 'gluten-free', 'high-fiber'],
            'allergens': []
        },
        {
            'name': 'Grilled Chicken Breast',
            'type': 'dinner',
            'calories': 320,
            'tags': ['diabetic-friendly', 'high-protein', 'low-carb', 'low-fat'],
            'allergens': []
        },
        {
            'name': 'Steamed Vegetables',
            'type': 'dinner',
            'calories': 120,
            'tags': ['vegetarian', 'vegan', 'diabetic-friendly', 'low-calorie'],
            'allergens': []
        },
        {
            'name': 'Berries + Yogurt',
            'type': 'snack',
            'calories': 130,
            'tags': ['diabetic-friendly', 'antioxidants', 'probiotics'],
            'allergens': ['dairy']
        },

        # HEART-HEALTHY MEALS
        {
            'name': 'Mediterranean Bowl',
            'type': 'lunch',
            'calories': 450,
            'tags': ['mediterranean', 'heart-healthy', 'omega-3', 'antioxidants'],
            'allergens': []
        },
        {
            'name': 'Oatmeal + Walnuts',
            'type': 'breakfast',
            'calories': 340,
            'tags': ['heart-healthy', 'omega-3', 'high-fiber', 'vegetarian'],
            'allergens': ['gluten', 'nuts']
        },
        {
            'name': 'Baked Cod',
            'type': 'dinner',
            'calories': 280,
            'tags': ['heart-healthy', 'omega-3', 'high-protein', 'low-fat'],
            'allergens': ['fish']
        },

        # KETO MEALS
        {
            'name': 'Keto Avocado Bowl',
            'type': 'lunch',
            'calories': 420,
            'tags': ['keto', 'low-carb', 'healthy-fats', 'vegetarian'],
            'allergens': []
        },
        {
            'name': 'Bacon + Eggs',
            'type': 'breakfast',
            'calories': 380,
            'tags': ['keto', 'high-protein', 'low-carb'],
            'allergens': ['eggs']
        },
        {
            'name': 'Cauliflower Rice',
            'type': 'dinner',
            'calories': 150,
            'tags': ['keto', 'low-carb', 'vegetarian', 'gluten-free'],
            'allergens': []
        },

        # VEGAN MEALS
        {
            'name': 'Vegan Buddha Bowl',
            'type': 'lunch',
            'calories': 480,
            'tags': ['vegan', 'gluten-free', 'antioxidants', 'high-fiber'],
            'allergens': []
        },
        {
            'name': 'Vegan Curry',
            'type': 'dinner',
            'calories': 450,
            'tags': ['vegan', 'anti-inflammatory', 'high-fiber'],
            'allergens': []
        },
        {
            'name': 'Vegan Smoothie',
            'type': 'breakfast',
            'calories': 200,
            'tags': ['vegan', 'antioxidants', 'vitamin-c'],
            'allergens': []
        },

        # HIGH-PROTEIN MEALS
        {
            'name': 'Protein Power Bowl',
            'type': 'lunch',
            'calories': 520,
            'tags': ['high-protein', 'muscle-building', 'post-workout'],
            'allergens': []
        },
        {
            'name': 'Egg White Scramble',
            'type': 'breakfast',
            'calories': 180,
            'tags': ['high-protein', 'low-fat', 'muscle-building'],
            'allergens': ['eggs']
        },
        {
            'name': 'Grilled Turkey',
            'type': 'dinner',
            'calories': 350,
            'tags': ['high-protein', 'low-fat', 'muscle-building'],
            'allergens': []
        },

        # LOW-SODIUM MEALS
        {
            'name': 'Herb-Crusted Fish',
            'type': 'dinner',
            'calories': 320,
            'tags': ['low-sodium', 'heart-healthy', 'high-protein'],
            'allergens': ['fish']
        },
        {
            'name': 'Fresh Garden Salad',
            'type': 'lunch',
            'calories': 180,
            'tags': ['low-sodium', 'low-calorie', 'vegetarian'],
            'allergens': []
        },

        # GLUTEN-FREE MEALS
        {
            'name': 'Gluten-Free Pasta',
            'type': 'dinner',
            'calories': 420,
            'tags': ['gluten-free', 'vegetarian', 'comfort-food'],
            'allergens': ['eggs']
        },
        {
            'name': 'Rice Bowl',
            'type': 'lunch',
            'calories': 450,
            'tags': ['gluten-free', 'vegetarian', 'high-carb'],
            'allergens': []
        },

        # ANTI-INFLAMMATORY MEALS
        {
            'name': 'Turmeric Golden Milk',
            'type': 'snack',
            'calories': 120,
            'tags': ['anti-inflammatory', 'vegetarian', 'medicinal'],
            'allergens': ['dairy']
        },
        {
            'name': 'Ginger Salmon',
            'type': 'dinner',
            'calories': 380,
            'tags': ['anti-inflammatory', 'omega-3', 'high-protein'],
            'allergens': ['fish']
        },

        # INDIAN BREAKFAST ITEMS
        {
            'name': 'Idli with Sambar',
            'type': 'breakfast',
            'calories': 280,
            'tags': ['indian', 'vegetarian', 'gluten-free', 'fermented', 'probiotics'],
            'allergens': []
        },
        {
            'name': 'Dosa with Coconut Chutney',
            'type': 'breakfast',
            'calories': 320,
            'tags': ['indian', 'vegetarian', 'gluten-free', 'fermented'],
            'allergens': []
        },
        {
            'name': 'Upma',
            'type': 'breakfast',
            'calories': 250,
            'tags': ['indian', 'vegetarian', 'gluten-free', 'low-fat'],
            'allergens': []
        },
        {
            'name': 'Poha',
            'type': 'breakfast',
            'calories': 200,
            'tags': ['indian', 'vegetarian', 'gluten-free', 'light'],
            'allergens': []
        },
        {
            'name': 'Paratha with Curd',
            'type': 'breakfast',
            'calories': 380,
            'tags': ['indian', 'vegetarian', 'comfort-food'],
            'allergens': ['gluten', 'dairy']
        },
        {
            'name': 'Aloo Paratha',
            'type': 'breakfast',
            'calories': 420,
            'tags': ['indian', 'vegetarian', 'comfort-food', 'potato'],
            'allergens': ['gluten']
        },
        {
            'name': 'Chole Bhature',
            'type': 'breakfast',
            'calories': 580,
            'tags': ['indian', 'vegetarian', 'high-protein', 'spicy'],
            'allergens': ['gluten']
        },
        {
            'name': 'Masala Chai',
            'type': 'breakfast',
            'calories': 80,
            'tags': ['indian', 'vegetarian', 'antioxidants', 'warming'],
            'allergens': ['dairy']
        },
        {
            'name': 'Besan Chilla',
            'type': 'breakfast',
            'calories': 180,
            'tags': ['indian', 'vegetarian', 'gluten-free', 'high-protein'],
            'allergens': []
        },
        {
            'name': 'Vada with Sambar',
            'type': 'breakfast',
            'calories': 320,
            'tags': ['indian', 'vegetarian', 'gluten-free', 'fried'],
            'allergens': []
        },

        # INDIAN LUNCH ITEMS
        {
            'name': 'Rajma Chawal',
            'type': 'lunch',
            'calories': 480,
            'tags': ['indian', 'vegetarian', 'high-protein', 'comfort-food'],
            'allergens': []
        },
        {
            'name': 'Chole Chawal',
            'type': 'lunch',
            'calories': 520,
            'tags': ['indian', 'vegetarian', 'high-protein', 'spicy'],
            'allergens': []
        },
        {
            'name': 'Dal Makhani with Rice',
            'type': 'lunch',
            'calories': 450,
            'tags': ['indian', 'vegetarian', 'high-protein', 'creamy'],
            'allergens': ['dairy']
        },
        {
            'name': 'Biryani',
            'type': 'lunch',
            'calories': 650,
            'tags': ['indian', 'high-protein', 'aromatic', 'festive'],
            'allergens': []
        },
        {
            'name': 'Vegetable Biryani',
            'type': 'lunch',
            'calories': 580,
            'tags': ['indian', 'vegetarian', 'aromatic', 'festive'],
            'allergens': []
        },
        {
            'name': 'Thali',
            'type': 'lunch',
            'calories': 600,
            'tags': ['indian', 'vegetarian', 'balanced', 'traditional'],
            'allergens': ['gluten', 'dairy']
        },
        {
            'name': 'Sambar Rice',
            'type': 'lunch',
            'calories': 380,
            'tags': ['indian', 'vegetarian', 'gluten-free', 'south-indian'],
            'allergens': []
        },
        {
            'name': 'Curd Rice',
            'type': 'lunch',
            'calories': 320,
            'tags': ['indian', 'vegetarian', 'gluten-free', 'cooling', 'probiotics'],
            'allergens': ['dairy']
        },
        {
            'name': 'Pulao',
            'type': 'lunch',
            'calories': 420,
            'tags': ['indian', 'vegetarian', 'aromatic', 'mild'],
            'allergens': []
        },
        {
            'name': 'Khichdi',
            'type': 'lunch',
            'calories': 350,
            'tags': ['indian', 'vegetarian', 'gluten-free', 'digestive', 'comfort-food'],
            'allergens': []
        },

        # INDIAN DINNER ITEMS
        {
            'name': 'Butter Chicken with Naan',
            'type': 'dinner',
            'calories': 720,
            'tags': ['indian', 'high-protein', 'creamy', 'popular'],
            'allergens': ['dairy', 'gluten']
        },
        {
            'name': 'Palak Paneer with Roti',
            'type': 'dinner',
            'calories': 480,
            'tags': ['indian', 'vegetarian', 'iron-rich', 'healthy'],
            'allergens': ['dairy', 'gluten']
        },
        {
            'name': 'Chicken Curry with Rice',
            'type': 'dinner',
            'calories': 520,
            'tags': ['indian', 'high-protein', 'spicy', 'traditional'],
            'allergens': []
        },
        {
            'name': 'Mutton Curry',
            'type': 'dinner',
            'calories': 580,
            'tags': ['indian', 'high-protein', 'iron-rich', 'spicy'],
            'allergens': []
        },
        {
            'name': 'Fish Curry',
            'type': 'dinner',
            'calories': 450,
            'tags': ['indian', 'high-protein', 'omega-3', 'spicy'],
            'allergens': ['fish']
        },
        {
            'name': 'Aloo Gobi',
            'type': 'dinner',
            'calories': 280,
            'tags': ['indian', 'vegetarian', 'low-calorie', 'vitamin-c'],
            'allergens': []
        },
        {
            'name': 'Baingan Bharta',
            'type': 'dinner',
            'calories': 220,
            'tags': ['indian', 'vegetarian', 'low-calorie', 'antioxidants'],
            'allergens': []
        },
        {
            'name': 'Dal Tadka',
            'type': 'dinner',
            'calories': 320,
            'tags': ['indian', 'vegetarian', 'high-protein', 'comfort-food'],
            'allergens': []
        },
        {
            'name': 'Chicken Tikka Masala',
            'type': 'dinner',
            'calories': 480,
            'tags': ['indian', 'high-protein', 'creamy', 'popular'],
            'allergens': ['dairy']
        },
        {
            'name': 'Malai Kofta',
            'type': 'dinner',
            'calories': 520,
            'tags': ['indian', 'vegetarian', 'creamy', 'festive'],
            'allergens': ['dairy']
        },

        # INDIAN SNACKS
        {
            'name': 'Samosa',
            'type': 'snack',
            'calories': 280,
            'tags': ['indian', 'vegetarian', 'fried', 'spicy'],
            'allergens': ['gluten']
        },
        {
            'name': 'Pakora',
            'type': 'snack',
            'calories': 220,
            'tags': ['indian', 'vegetarian', 'fried', 'gluten-free'],
            'allergens': []
        },
        {
            'name': 'Dhokla',
            'type': 'snack',
            'calories': 180,
            'tags': ['indian', 'vegetarian', 'gluten-free', 'fermented', 'probiotics'],
            'allergens': []
        },
        {
            'name': 'Bhel Puri',
            'type': 'snack',
            'calories': 200,
            'tags': ['indian', 'vegetarian', 'gluten-free', 'street-food'],
            'allergens': []
        },
        {
            'name': 'Pani Puri',
            'type': 'snack',
            'calories': 120,
            'tags': ['indian', 'vegetarian', 'gluten-free', 'street-food', 'refreshing'],
            'allergens': []
        },
        {
            'name': 'Chaat',
            'type': 'snack',
            'calories': 250,
            'tags': ['indian', 'vegetarian', 'street-food', 'tangy'],
            'allergens': []
        },
        {
            'name': 'Kachori',
            'type': 'snack',
            'calories': 320,
            'tags': ['indian', 'vegetarian', 'fried', 'spicy'],
            'allergens': ['gluten']
        },
        {
            'name': 'Namkeen',
            'type': 'snack',
            'calories': 150,
            'tags': ['indian', 'vegetarian', 'savory', 'crunchy'],
            'allergens': []
        },
        {
            'name': 'Lassi',
            'type': 'snack',
            'calories': 200,
            'tags': ['indian', 'vegetarian', 'probiotics', 'cooling'],
            'allergens': ['dairy']
        },
        {
            'name': 'Jalebi',
            'type': 'snack',
            'calories': 350,
            'tags': ['indian', 'vegetarian', 'sweet', 'festive'],
            'allergens': ['gluten']
        },

        # INDIAN SWEETS
        {
            'name': 'Gulab Jamun',
            'type': 'snack',
            'calories': 280,
            'tags': ['indian', 'vegetarian', 'sweet', 'festive'],
            'allergens': ['dairy']
        },
        {
            'name': 'Rasgulla',
            'type': 'snack',
            'calories': 120,
            'tags': ['indian', 'vegetarian', 'sweet', 'light'],
            'allergens': ['dairy']
        },
        {
            'name': 'Kheer',
            'type': 'snack',
            'calories': 300,
            'tags': ['indian', 'vegetarian', 'sweet', 'comfort-food'],
            'allergens': ['dairy']
        },
        {
            'name': 'Halwa',
            'type': 'snack',
            'calories': 320,
            'tags': ['indian', 'vegetarian', 'sweet', 'nutritious'],
            'allergens': []
        },
        {
            'name': 'Barfi',
            'type': 'snack',
            'calories': 200,
            'tags': ['indian', 'vegetarian', 'sweet', 'festive'],
            'allergens': ['dairy']
        },

        # REGIONAL INDIAN SPECIALTIES
        {
            'name': 'Hyderabadi Biryani',
            'type': 'lunch',
            'calories': 680,
            'tags': ['indian', 'hyderabadi', 'high-protein', 'aromatic', 'spicy'],
            'allergens': []
        },
        {
            'name': 'Kerala Fish Curry',
            'type': 'dinner',
            'calories': 420,
            'tags': ['indian', 'kerala', 'high-protein', 'coconut', 'spicy'],
            'allergens': ['fish']
        },
        {
            'name': 'Punjabi Dal Makhani',
            'type': 'dinner',
            'calories': 480,
            'tags': ['indian', 'punjabi', 'vegetarian', 'high-protein', 'creamy'],
            'allergens': ['dairy']
        },
        {
            'name': 'Gujarati Thali',
            'type': 'lunch',
            'calories': 550,
            'tags': ['indian', 'gujarati', 'vegetarian', 'balanced', 'sweet-sour'],
            'allergens': ['gluten', 'dairy']
        },
        {
            'name': 'Bengali Fish Curry',
            'type': 'dinner',
            'calories': 380,
            'tags': ['indian', 'bengali', 'high-protein', 'mustard', 'spicy'],
            'allergens': ['fish']
        },
        {
            'name': 'Rajasthani Dal Baati',
            'type': 'dinner',
            'calories': 620,
            'tags': ['indian', 'rajasthani', 'vegetarian', 'high-protein', 'traditional'],
            'allergens': ['gluten']
        },
        {
            'name': 'Tamil Sambar',
            'type': 'lunch',
            'calories': 280,
            'tags': ['indian', 'tamil', 'vegetarian', 'gluten-free', 'tangy'],
            'allergens': []
        },
        {
            'name': 'Maharashtrian Misal Pav',
            'type': 'lunch',
            'calories': 480,
            'tags': ['indian', 'maharashtrian', 'vegetarian', 'spicy', 'street-food'],
            'allergens': ['gluten']
        },

        # HEALTHY INDIAN OPTIONS
        {
            'name': 'Moong Dal Khichdi',
            'type': 'lunch',
            'calories': 320,
            'tags': ['indian', 'vegetarian', 'gluten-free', 'digestive', 'protein-rich'],
            'allergens': []
        },
        {
            'name': 'Sprouts Salad',
            'type': 'lunch',
            'calories': 180,
            'tags': ['indian', 'vegetarian', 'gluten-free', 'high-protein', 'raw'],
            'allergens': []
        },
        {
            'name': 'Coconut Water',
            'type': 'snack',
            'calories': 50,
            'tags': ['indian', 'vegetarian', 'gluten-free', 'electrolytes', 'natural'],
            'allergens': []
        },
        {
            'name': 'Green Chutney',
            'type': 'snack',
            'calories': 30,
            'tags': ['indian', 'vegetarian', 'gluten-free', 'antioxidants', 'digestive'],
            'allergens': []
        },
        {
            'name': 'Turmeric Milk',
            'type': 'snack',
            'calories': 100,
            'tags': ['indian', 'vegetarian', 'anti-inflammatory', 'medicinal', 'warming'],
            'allergens': ['dairy']
        }
    ]


if __name__ == "__main__":
    # Example usage
    print("Training KNN Meal Recommender...")
    
    # Create and train model
    recommender = MealKNNRecommender(n_neighbors=3, metric='cosine')
    sample_meals = create_sample_data()
    recommender.fit(sample_meals)
    
    # Test recommendations
    user_profile = {
        'target_calories': 500,
        'preferred_meal_type': 'lunch',
        'dietary_preferences': ['vegetarian', 'diabetic-friendly'],
        'health_conditions': ['diabetes'],
        'allergies': ['nuts']
    }
    
    recommendations = recommender.recommend(user_profile, n_recommendations=3)
    
    print("\nRecommendations:")
    for rec in recommendations:
        print(f"{rec['rank']}. {rec['name']} ({rec['type']}) - {rec['calories']} cal - Score: {rec['similarity_score']:.3f}")
    
    # Save model
    recommender.save_model('meal_knn_model.pkl')
