"""
FastAPI endpoints for MediMeal AI models
Add these to your main FastAPI app
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from .model_loader import get_model_loader

# Create router
ml_router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])


# Request/Response Models
class RecommendationRequest(BaseModel):
    user_id: str = Field(..., description="User ID")
    n_recommendations: int = Field(10, ge=1, le=50, description="Number of recommendations")


class RecommendationResponse(BaseModel):
    user_id: str
    recommendations: List[Dict[str, Any]]
    count: int


class HealthRiskRequest(BaseModel):
    age: int = Field(..., ge=1, le=120, description="User age")
    gender: str = Field(..., description="User gender (male/female)")
    bmi: float = Field(..., ge=10, le=60, description="Body Mass Index")
    activity_level: str = Field(..., description="Activity level (sedentary/lightly_active/moderately_active/very_active)")


class HealthRiskResponse(BaseModel):
    diabetes: float = Field(..., description="Diabetes risk probability (0-1)")
    hypertension: float = Field(..., description="Hypertension risk probability (0-1)")
    heart_disease: float = Field(..., description="Heart disease risk probability (0-1)")
    risk_level: str = Field(..., description="Overall risk level")


class DrugInteractionRequest(BaseModel):
    drug: str = Field(..., description="Drug name")
    food: str = Field(..., description="Food name")


class DrugInteractionResponse(BaseModel):
    drug: str
    food: str
    has_interaction: bool
    interaction_probability: float
    warning: str


# Endpoints
@ml_router.post("/recommendations", response_model=RecommendationResponse)
async def get_meal_recommendations(request: RecommendationRequest):
    """
    Get personalized meal recommendations for a user
    
    Returns a list of recommended meals based on user preferences and history
    """
    try:
        loader = get_model_loader()
        recommendations = loader.get_meal_recommendations(
            user_id=request.user_id,
            n_recommendations=request.n_recommendations
        )
        
        return RecommendationResponse(
            user_id=request.user_id,
            recommendations=recommendations,
            count=len(recommendations)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting recommendations: {str(e)}")


@ml_router.post("/health-risk", response_model=HealthRiskResponse)
async def predict_health_risk(request: HealthRiskRequest):
    """
    Predict health risks based on user profile
    
    Returns probability scores for diabetes, hypertension, and heart disease
    """
    try:
        # Validate inputs
        if request.gender.lower() not in ['male', 'female']:
            raise HTTPException(status_code=400, detail="Gender must be 'male' or 'female'")
        
        valid_activity_levels = ['sedentary', 'lightly_active', 'moderately_active', 'very_active']
        if request.activity_level.lower() not in valid_activity_levels:
            raise HTTPException(
                status_code=400, 
                detail=f"Activity level must be one of: {', '.join(valid_activity_levels)}"
            )
        
        loader = get_model_loader()
        risks = loader.predict_health_risks(
            age=request.age,
            gender=request.gender.lower(),
            bmi=request.bmi,
            activity_level=request.activity_level.lower()
        )
        
        if not risks:
            raise HTTPException(status_code=500, detail="Failed to predict health risks")
        
        # Calculate overall risk level
        avg_risk = (risks.get('diabetes', 0) + risks.get('hypertension', 0) + risks.get('heart_disease', 0)) / 3
        
        if avg_risk < 0.3:
            risk_level = "Low"
        elif avg_risk < 0.6:
            risk_level = "Moderate"
        else:
            risk_level = "High"
        
        return HealthRiskResponse(
            diabetes=risks.get('diabetes', 0),
            hypertension=risks.get('hypertension', 0),
            heart_disease=risks.get('heart_disease', 0),
            risk_level=risk_level
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting health risk: {str(e)}")


@ml_router.post("/drug-interaction", response_model=DrugInteractionResponse)
async def check_drug_food_interaction(request: DrugInteractionRequest):
    """
    Check for potential drug-food interactions
    
    Returns whether an interaction exists and its probability
    """
    try:
        loader = get_model_loader()
        result = loader.check_drug_food_interaction(
            drug=request.drug.lower(),
            food=request.food.lower()
        )
        
        return DrugInteractionResponse(
            drug=result['drug'],
            food=result['food'],
            has_interaction=result['has_interaction'],
            interaction_probability=result['interaction_probability'],
            warning=result['warning']
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking drug interaction: {str(e)}")


@ml_router.get("/models/status")
async def get_models_status():
    """
    Get status of all loaded ML models
    
    Returns information about which models are loaded and ready
    """
    try:
        loader = get_model_loader()
        info = loader.get_model_info()
        
        return {
            "status": "ok",
            "models": {
                "meal_recommendations": {
                    "loaded": info['collaborative_filtering'],
                    "type": "Collaborative Filtering"
                },
                "health_risk_prediction": {
                    "loaded": info['health_risk_prediction'],
                    "type": "XGBoost Ensemble"
                },
                "drug_food_interaction": {
                    "loaded": info['drug_food_interaction'],
                    "type": "NLP Pipeline"
                }
            },
            "models_directory": info['models_directory']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting model status: {str(e)}")


# Example usage in main.py:
"""
from fastapi import FastAPI
from ml.api_endpoints import ml_router

app = FastAPI()
app.include_router(ml_router)
"""
