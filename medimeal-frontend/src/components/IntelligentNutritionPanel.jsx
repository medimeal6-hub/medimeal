import { useState, useEffect } from 'react';
import { Brain, Target, TrendingUp, Zap, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const IntelligentNutritionPanel = ({ userId }) => {
  const [nutritionPlan, setNutritionPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadNutritionPlan();
  }, [userId]);

  const loadNutritionPlan = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/nutrition/personalized-plan');
      setNutritionPlan(response.data.data);
    } catch (error) {
      console.error('Error loading nutrition plan:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!nutritionPlan) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
        <p className="text-gray-600">Unable to load nutrition plan</p>
      </div>
    );
  }

  const { nutritionalNeeds, restrictions, insights, mealRecommendations } = nutritionPlan;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Intelligent Nutrition Plan</h3>
            <p className="text-sm text-gray-600">AI-powered personalized recommendations</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 flex space-x-2 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'overview'
              ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('macros')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'macros'
              ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Macros
        </button>
        <button
          onClick={() => setActiveTab('restrictions')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'restrictions'
              ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Restrictions
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'insights'
              ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Insights
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Calorie Targets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">Target Calories</span>
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-900">{nutritionalNeeds.targetCalories}</div>
                <div className="text-xs text-blue-600 mt-1">kcal/day</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-700">BMR</span>
                  <Zap className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-900">{nutritionalNeeds.bmr}</div>
                <div className="text-xs text-green-600 mt-1">kcal/day</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-700">TDEE</span>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-900">{nutritionalNeeds.tdee}</div>
                <div className="text-xs text-purple-600 mt-1">kcal/day</div>
              </div>
            </div>

            {/* Quick Macro Overview */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Daily Macro Targets</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{nutritionalNeeds.macros.protein}g</div>
                  <div className="text-xs text-gray-600 mt-1">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{nutritionalNeeds.macros.carbs}g</div>
                  <div className="text-xs text-gray-600 mt-1">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{nutritionalNeeds.macros.fats}g</div>
                  <div className="text-xs text-gray-600 mt-1">Fats</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Macros Tab */}
        {activeTab === 'macros' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-orange-900">Protein</h4>
                <span className="text-2xl font-bold text-orange-700">{nutritionalNeeds.macros.protein}g</span>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full" style={{width: '25%'}}></div>
              </div>
              <p className="text-sm text-orange-700 mt-2">25% of total calories</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-yellow-900">Carbohydrates</h4>
                <span className="text-2xl font-bold text-yellow-700">{nutritionalNeeds.macros.carbs}g</span>
              </div>
              <div className="w-full bg-yellow-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full" style={{width: '45%'}}></div>
              </div>
              <p className="text-sm text-yellow-700 mt-2">45% of total calories</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-blue-900">Fats</h4>
                <span className="text-2xl font-bold text-blue-700">{nutritionalNeeds.macros.fats}g</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full" style={{width: '30%'}}></div>
              </div>
              <p className="text-sm text-blue-700 mt-2">30% of total calories</p>
            </div>

            {/* Micronutrients */}
            {nutritionalNeeds.micronutrients && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mt-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Micronutrient Guidelines</h4>
                <div className="space-y-2">
                  {Object.entries(nutritionalNeeds.micronutrients).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-medium text-gray-900">
                        {value.min && `Min: ${value.min}${value.unit}`}
                        {value.max && `Max: ${value.max}${value.unit}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Restrictions Tab */}
        {activeTab === 'restrictions' && (
          <div className="space-y-4">
            {restrictions.avoid && restrictions.avoid.length > 0 && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <h4 className="text-sm font-semibold text-red-900 mb-3 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Foods to Avoid
                </h4>
                <div className="flex flex-wrap gap-2">
                  {restrictions.avoid.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {restrictions.prefer && restrictions.prefer.length > 0 && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Recommended Foods
                </h4>
                <div className="flex flex-wrap gap-2">
                  {restrictions.prefer.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {restrictions.dietaryTags && restrictions.dietaryTags.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Dietary Preferences
                </h4>
                <div className="flex flex-wrap gap-2">
                  {restrictions.dietaryTags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-3">
            {insights && insights.length > 0 ? (
              insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-l-4 ${
                    insight.priority === 'high'
                      ? 'bg-red-50 border-red-500'
                      : insight.priority === 'medium'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`mt-0.5 ${
                      insight.priority === 'high' ? 'text-red-600' :
                      insight.priority === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>
                      {insight.type === 'warning' ? <AlertTriangle className="h-5 w-5" /> :
                       insight.type === 'recommendation' ? <TrendingUp className="h-5 w-5" /> :
                       <Info className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        {insight.category}
                      </div>
                      <p className="text-sm text-gray-800">{insight.message}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Info className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No specific insights at this time</p>
                <p className="text-sm mt-1">Your nutrition plan looks balanced!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IntelligentNutritionPanel;
