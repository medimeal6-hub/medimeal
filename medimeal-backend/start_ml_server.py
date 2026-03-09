"""
Start MediMeal ML API Server
Simple FastAPI server for ML predictions
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
from pathlib import Path
import pickle
import pandas as pd

# Add ml directory to path
sys.path.insert(0, str(Path(__file__).parent / 'ml'))
from collaborative_filtering import CollaborativeFilteringRecommender

app = FastAPI(title="MediMeal ML API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global models
models = {}

@app.on_event("startup")
async def load_models():
    global models
    models_dir = Path(__file__).parent / "ml" / "models"
    
    # Load CF Model
    with open(models_dir / "collaborative_filtering_model.pkl", 'rb') as f:
        models['cf'] = pickle.load(f)['model']
    
    # Load Health Models
    with open(models_dir / "health_risk_models.pkl", 'rb') as f:
        models['health'] = pickle.load(f)
    
    # Load Drug Model
    with open(models_dir / "drug_food_interaction_models.pkl", 'rb') as f:
        models['drug'] = pickle.load(f)['interaction_pipeline']
    
    print("✅ All models loaded!")

# Request models
class RecommendationRequest(BaseModel):
    user_id: str
    n_recommendations: int = 10

class HealthRiskRequest(BaseModel):
    age: int
    gender: str
    bmi: float
    activity_level: str

class DrugInteractionRequest(BaseModel):
    drug: str
    food: str

# Endpoints
@app.get("/")
def root():
    return {"status": "ok", "message": "MediMeal ML API"}

@app.post("/api/ml/recommendations")
def get_recommendations(req: RecommendationRequest):
    try:
        recs = models['cf'].recommend(req.user_id, req.n_recommendations)
        return {"success": True, "recommendations": recs}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/api/ml/health-risk")
def predict_health_risk(req: HealthRiskRequest):
    try:
        health = models['health']
        gender_enc = health['gender_encoder']
        activity_enc = health['activity_encoder']
        
        features = pd.DataFrame({
            'age': [req.age],
            'bmi': [req.bmi],
            'gender_encoded': gender_enc.transform([req.gender.lower()]),
            'activity_encoded': activity_enc.transform([req.activity_level.lower()])
        })
        
        risks = {}
        for risk_type, model_data in health['models'].items():
            scaler = model_data['scaler']
            model = model_data['model']
            features_scaled = scaler.transform(features)
            risk_prob = model.predict_proba(features_scaled)[0][1]
            risk_name = risk_type.replace('_high_risk', '')
            risks[risk_name] = float(risk_prob)
        
        avg_risk = sum(risks.values()) / len(risks)
        risk_level = "Low" if avg_risk < 0.3 else "Moderate" if avg_risk < 0.6 else "High"
        
        return {"success": True, "risks": risks, "risk_level": risk_level}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/api/ml/drug-interaction")
def check_drug_interaction(req: DrugInteractionRequest):
    try:
        text = f"{req.drug.lower()} {req.food.lower()}"
        has_interaction = bool(models['drug'].predict([text])[0])
        prob = float(models['drug'].predict_proba([text])[0][1])
        warning = "Potential interaction detected" if has_interaction else "No known interaction"
        
        return {
            "success": True,
            "has_interaction": has_interaction,
            "interaction_probability": prob,
            "warning": warning
        }
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/api/ml/models/status")
def get_status():
    return {
        "status": "ok",
        "models_loaded": len(models),
        "models": {
            "recommendations": 'cf' in models,
            "health_risk": 'health' in models,
            "drug_interaction": 'drug' in models
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting MediMeal ML API on http://localhost:5000")
    uvicorn.run(app, host="0.0.0.0", port=5000)
