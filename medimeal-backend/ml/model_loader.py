"""
MediMeal AI Model Loader
Loads and manages all trained ML models
"""

import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging
import sys

# Add ml directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

# Import the collaborative filtering class
from collaborative_filtering import CollaborativeFilteringRecommender

logger = logging.getLogger(__name__)

class MediMealModelLoader:
    """Centralized model loader for all MediMeal AI models"""
    
    def __init__(self, models_dir: str = "ml/models"):
        self.models_dir = Path(models_dir)
        self.cf_model = None
        self.health_models = None
        self.drug_interaction_model = None
        self._load_all_models()
    
    def _load_all_models(self):
        """Load all trained models from disk"""
        try:
            # Load Collaborative Filtering Model
            cf_path = self.models_dir / "collaborative_filtering_model.pkl"
            if cf_path.exists():
                with open(cf_path, 'rb') as f:
                    cf_data = pickle.load(f)
                    self.cf_model = cf_data['model']
                    logger.info("✓ Collaborative filtering model loaded")
            else:
                logger.warning(f"Collaborative filtering model not found at {cf_path}")
            
            # Load Health Risk Models
            health_path = self.models_dir / "health_risk_models.pkl"
            if health_path.exists():
                with open(health_path, 'rb') as f:
                    self.health_models = pickle.load(f)
                    logger.info("✓ Health risk models loaded")
            else:
                logger.warning(f"Health risk models not found at {health_path}")
            
            # Load Drug-Food Interaction Model
            drug_path = self.models_dir / "drug_food_interaction_models.pkl"
            if drug_path.exists():
                with open(drug_path, 'rb') as f:
                    drug_data = pickle.load(f)
                    self.drug_interaction_model = drug_data['interaction_pipeline']
                    logger.info("✓ Drug-food interaction model loaded")
            else:
                logger.warning(f"Drug interaction model not found at {drug_path}")
            
            logger.info("All available models loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            raise
    
    def get_meal_recommendations(
        self, 
        user_id: str, 
        n_recommendations: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get personalized meal recommendations for a user
        
        Args:
            user_id: User identifier
            n_recommendations: Number of recommendations to return
            
        Returns:
            List of recommended meals with scores
        """
        if not self.cf_model:
            logger.error("Collaborative filtering model not loaded")
            return []
        
        try:
            recommendations = self.cf_model.recommend(user_id, n_recommendations)
            return recommendations
        except Exception as e:
            logger.error(f"Error getting recommendations: {str(e)}")
            return []
    
    def predict_health_risks(
        self,
        age: int,
        gender: str,
        bmi: float,
        activity_level: str
    ) -> Dict[str, float]:
        """
        Predict health risks for a user
        
        Args:
            age: User age
            gender: User gender ('male' or 'female')
            bmi: Body Mass Index
            activity_level: Activity level ('sedentary', 'lightly_active', 'moderately_active', 'very_active')
            
        Returns:
            Dictionary with risk probabilities for diabetes, hypertension, heart disease
        """
        if not self.health_models:
            logger.error("Health risk models not loaded")
            return {}
        
        try:
            # Prepare features
            gender_encoded = self.health_models['gender_encoder'].transform([gender])[0]
            activity_encoded = self.health_models['activity_encoder'].transform([activity_level])[0]
            
            features = pd.DataFrame({
                'age': [age],
                'bmi': [bmi],
                'gender_encoded': [gender_encoded],
                'activity_encoded': [activity_encoded]
            })
            
            # Get predictions for each risk type
            risks = {}
            for risk_type, model_data in self.health_models['models'].items():
                scaler = model_data['scaler']
                model = model_data['model']
                
                features_scaled = scaler.transform(features)
                risk_prob = model.predict_proba(features_scaled)[0][1]
                
                # Clean up risk type name
                risk_name = risk_type.replace('_high_risk', '')
                risks[risk_name] = float(risk_prob)
            
            return risks
            
        except Exception as e:
            logger.error(f"Error predicting health risks: {str(e)}")
            return {}
    
    def check_drug_food_interaction(
        self,
        drug: str,
        food: str
    ) -> Dict[str, Any]:
        """
        Check for potential drug-food interactions
        
        Args:
            drug: Drug name
            food: Food name
            
        Returns:
            Dictionary with interaction status and probability
        """
        if not self.drug_interaction_model:
            logger.error("Drug interaction model not loaded")
            return {'has_interaction': False, 'probability': 0.0}
        
        try:
            test_text = f"{drug} {food}"
            has_interaction = self.drug_interaction_model.predict([test_text])[0]
            interaction_prob = self.drug_interaction_model.predict_proba([test_text])[0][1]
            
            return {
                'drug': drug,
                'food': food,
                'has_interaction': bool(has_interaction),
                'interaction_probability': float(interaction_prob),
                'warning': 'Potential interaction detected' if has_interaction else 'No known interaction'
            }
            
        except Exception as e:
            logger.error(f"Error checking drug interaction: {str(e)}")
            return {'has_interaction': False, 'probability': 0.0, 'error': str(e)}
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about loaded models"""
        return {
            'collaborative_filtering': self.cf_model is not None,
            'health_risk_prediction': self.health_models is not None,
            'drug_food_interaction': self.drug_interaction_model is not None,
            'models_directory': str(self.models_dir)
        }


# Global model loader instance
_model_loader: Optional[MediMealModelLoader] = None


def get_model_loader() -> MediMealModelLoader:
    """Get or create the global model loader instance"""
    global _model_loader
    if _model_loader is None:
        _model_loader = MediMealModelLoader()
    return _model_loader


# Convenience functions
def get_recommendations(user_id: str, n: int = 10) -> List[Dict[str, Any]]:
    """Get meal recommendations for a user"""
    loader = get_model_loader()
    return loader.get_meal_recommendations(user_id, n)


def predict_health_risks(age: int, gender: str, bmi: float, activity_level: str) -> Dict[str, float]:
    """Predict health risks for a user"""
    loader = get_model_loader()
    return loader.predict_health_risks(age, gender, bmi, activity_level)


def check_drug_interaction(drug: str, food: str) -> Dict[str, Any]:
    """Check for drug-food interactions"""
    loader = get_model_loader()
    return loader.check_drug_food_interaction(drug, food)
