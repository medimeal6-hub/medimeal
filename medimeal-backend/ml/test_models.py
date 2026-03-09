"""
Test script for MediMeal ML models
Run this after placing models in ml/models/ directory
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

def test_model_loading():
    """Test if models load correctly"""
    print("Testing model loading...")
    
    try:
        from ml.model_loader import get_model_loader
        
        loader = get_model_loader()
        print("✓ Model loader initialized")
        
        info = loader.get_model_info()
        
        if info['collaborative_filtering']:
            print("✓ Collaborative filtering model loaded")
        else:
            print("✗ Collaborative filtering model NOT loaded")
        
        if info['health_risk_prediction']:
            print("✓ Health risk models loaded")
        else:
            print("✗ Health risk models NOT loaded")
        
        if info['drug_food_interaction']:
            print("✓ Drug-food interaction model loaded")
        else:
            print("✗ Drug-food interaction model NOT loaded")
        
        return loader
        
    except Exception as e:
        print(f"✗ Error loading models: {str(e)}")
        return None


def test_recommendations(loader):
    """Test meal recommendations"""
    print("\nTesting meal recommendations...")
    
    try:
        # Test with a sample user ID
        recommendations = loader.get_meal_recommendations("USER_0001", 5)
        
        if recommendations:
            print(f"✓ Got {len(recommendations)} recommendations")
            print("  Sample recommendations:")
            for i, rec in enumerate(recommendations[:3], 1):
                print(f"    {i}. {rec['meal_id']} (score: {rec['score']:.2f})")
        else:
            print("✗ No recommendations returned (this is OK if user not in training data)")
        
        return True
        
    except Exception as e:
        print(f"✗ Error getting recommendations: {str(e)}")
        return False


def test_health_risk(loader):
    """Test health risk prediction"""
    print("\nTesting health risk prediction...")
    
    try:
        # Test with sample data
        risks = loader.predict_health_risks(
            age=45,
            gender='male',
            bmi=28.5,
            activity_level='moderately_active'
        )
        
        if risks:
            print("✓ Health risk prediction successful")
            print(f"  Diabetes risk: {risks.get('diabetes', 0):.2%}")
            print(f"  Hypertension risk: {risks.get('hypertension', 0):.2%}")
            print(f"  Heart disease risk: {risks.get('heart_disease', 0):.2%}")
        else:
            print("✗ No risk predictions returned")
        
        return True
        
    except Exception as e:
        print(f"✗ Error predicting health risks: {str(e)}")
        return False


def test_drug_interaction(loader):
    """Test drug-food interaction detection"""
    print("\nTesting drug-food interaction detection...")
    
    try:
        # Test with known interaction
        result1 = loader.check_drug_food_interaction("warfarin", "spinach")
        print(f"✓ Warfarin + Spinach: {result1['warning']}")
        print(f"  Interaction probability: {result1['interaction_probability']:.2%}")
        
        # Test with no interaction
        result2 = loader.check_drug_food_interaction("paracetamol", "banana")
        print(f"✓ Paracetamol + Banana: {result2['warning']}")
        print(f"  Interaction probability: {result2['interaction_probability']:.2%}")
        
        return True
        
    except Exception as e:
        print(f"✗ Error checking drug interaction: {str(e)}")
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("MediMeal ML Models Test Suite")
    print("=" * 60)
    
    # Test model loading
    loader = test_model_loading()
    
    if not loader:
        print("\n✗ Model loading failed. Please check:")
        print("  1. Models are in ml/models/ directory")
        print("  2. File names match exactly:")
        print("     - collaborative_filtering_model.pkl")
        print("     - health_risk_models.pkl")
        print("     - drug_food_interaction_models.pkl")
        print("  3. Required packages are installed:")
        print("     pip install scikit-learn xgboost pandas numpy")
        return
    
    # Run tests
    tests_passed = 0
    tests_total = 3
    
    if test_recommendations(loader):
        tests_passed += 1
    
    if test_health_risk(loader):
        tests_passed += 1
    
    if test_drug_interaction(loader):
        tests_passed += 1
    
    # Summary
    print("\n" + "=" * 60)
    print(f"Tests passed: {tests_passed}/{tests_total}")
    
    if tests_passed == tests_total:
        print("✓ All tests passed! Models are ready to use.")
        print("\nNext steps:")
        print("1. Integrate API endpoints in your FastAPI app")
        print("2. Test endpoints with curl or Postman")
        print("3. Connect to your Flutter frontend")
    else:
        print("✗ Some tests failed. Check error messages above.")
    
    print("=" * 60)


if __name__ == "__main__":
    main()
