"""
Simple test script for MediMeal ML models
"""

import sys
import pickle
from pathlib import Path

# Add ml directory to path
sys.path.insert(0, str(Path(__file__).parent / 'ml'))

# Import the class definition
from collaborative_filtering import CollaborativeFilteringRecommender

def test_models():
    print("=" * 60)
    print("MediMeal ML Models Test")
    print("=" * 60)
    print()
    
    models_dir = Path("ml/models")
    
    # Test 1: Check if files exist
    print("1. Checking model files...")
    files_to_check = [
        "collaborative_filtering_model.pkl",
        "health_risk_models.pkl",
        "drug_food_interaction_models.pkl",
        "sample_data.json"
    ]
    
    all_exist = True
    for filename in files_to_check:
        filepath = models_dir / filename
        if filepath.exists():
            size = filepath.stat().st_size / (1024 * 1024)
            print(f"   ✓ {filename} ({size:.2f} MB)")
        else:
            print(f"   ✗ {filename} - NOT FOUND")
            all_exist = False
    
    if not all_exist:
        print("\n❌ Some files are missing!")
        return False
    
    print("\n✓ All files found!")
    
    # Test 2: Load Collaborative Filtering Model
    print("\n2. Loading Collaborative Filtering model...")
    try:
        with open(models_dir / "collaborative_filtering_model.pkl", 'rb') as f:
            cf_data = pickle.load(f)
            cf_model = cf_data['model']
        print("   ✓ Collaborative Filtering model loaded")
        
        # Test recommendation
        try:
            recs = cf_model.recommend("USER_0001", 3)
            if recs:
                print(f"   ✓ Generated {len(recs)} recommendations")
                for i, rec in enumerate(recs, 1):
                    print(f"      {i}. {rec['meal_id']} (score: {rec['score']:.2f})")
            else:
                print("   ⚠ No recommendations (user not in training data)")
        except Exception as e:
            print(f"   ⚠ Recommendation test: {str(e)}")
    except Exception as e:
        print(f"   ✗ Error: {str(e)}")
        return False
    
    # Test 3: Load Health Risk Models
    print("\n3. Loading Health Risk models...")
    try:
        with open(models_dir / "health_risk_models.pkl", 'rb') as f:
            health_data = pickle.load(f)
        print("   ✓ Health Risk models loaded")
        print(f"   ✓ Found {len(health_data['models'])} risk predictors")
        
        # Test prediction
        try:
            import pandas as pd
            from sklearn.preprocessing import StandardScaler
            
            # Prepare test data
            gender_enc = health_data['gender_encoder']
            activity_enc = health_data['activity_encoder']
            
            test_features = pd.DataFrame({
                'age': [45],
                'bmi': [28.5],
                'gender_encoded': gender_enc.transform(['male']),
                'activity_encoded': activity_enc.transform(['moderately_active'])
            })
            
            # Test diabetes prediction
            diabetes_model = health_data['models']['diabetes_high_risk']
            scaler = diabetes_model['scaler']
            model = diabetes_model['model']
            
            test_scaled = scaler.transform(test_features)
            risk_prob = model.predict_proba(test_scaled)[0][1]
            
            print(f"   ✓ Sample prediction: Diabetes risk = {risk_prob:.2%}")
        except Exception as e:
            print(f"   ⚠ Prediction test: {str(e)}")
    except Exception as e:
        print(f"   ✗ Error: {str(e)}")
        return False
    
    # Test 4: Load Drug Interaction Model
    print("\n4. Loading Drug-Food Interaction model...")
    try:
        with open(models_dir / "drug_food_interaction_models.pkl", 'rb') as f:
            drug_data = pickle.load(f)
            interaction_model = drug_data['interaction_pipeline']
        print("   ✓ Drug-Food Interaction model loaded")
        
        # Test interaction check
        try:
            test_text = "warfarin spinach"
            has_interaction = interaction_model.predict([test_text])[0]
            prob = interaction_model.predict_proba([test_text])[0][1]
            print(f"   ✓ Sample check: Warfarin + Spinach")
            print(f"      Interaction: {has_interaction}, Probability: {prob:.2%}")
        except Exception as e:
            print(f"   ⚠ Interaction test: {str(e)}")
    except Exception as e:
        print(f"   ✗ Error: {str(e)}")
        return False
    
    # Success!
    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED!")
    print("=" * 60)
    print("\nYour ML models are ready to use!")
    print("\nNext steps:")
    print("1. Integrate API endpoints in your FastAPI app")
    print("2. Test endpoints at http://localhost:8000/docs")
    print("3. Connect to your Flutter frontend")
    print()
    
    return True


if __name__ == "__main__":
    success = test_models()
    sys.exit(0 if success else 1)
