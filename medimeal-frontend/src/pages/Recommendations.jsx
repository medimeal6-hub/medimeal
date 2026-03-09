import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Brain, Sparkles, TrendingUp, Shield, Activity } from 'lucide-react';
import SymptomRiskPanel from '../components/SymptomRiskPanel';
import IntelligentNutritionPanel from '../components/IntelligentNutritionPanel';

const Recommendations = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('nutrition');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI-Powered Health Intelligence</h1>
              <p className="text-blue-100 mt-2">
                Intelligent Nutrition Personalization & Symptom Risk Modeling
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-6 w-6 text-yellow-300" />
                <div>
                  <div className="text-2xl font-bold">AI-Driven</div>
                  <div className="text-sm text-blue-100">Personalized Insights</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-green-300" />
                <div>
                  <div className="text-2xl font-bold">Risk Analysis</div>
                  <div className="text-sm text-blue-100">Symptom Monitoring</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-3">
                <Activity className="h-6 w-6 text-pink-300" />
                <div>
                  <div className="text-2xl font-bold">Real-Time</div>
                  <div className="text-sm text-blue-100">Health Tracking</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-8 flex space-x-2">
          <button
            onClick={() => setActiveSection('nutrition')}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'nutrition'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Intelligent Nutrition</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveSection('symptoms')}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'symptoms'
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Symptom Risk Analysis</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveSection('both')}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
              activeSection === 'both'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Complete Overview</span>
            </div>
          </button>
        </div>

        {/* Research Paper Info Banner */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Research Implementation: Unified Healthcare ERP Ecosystem
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                This system implements the research paper: <span className="font-semibold">"Intelligent Nutrition Personalization 
                and Symptom Risk Modeling within a Unified Healthcare ERP Ecosystem"</span>. The platform combines AI-driven 
                nutrition recommendations with symptom risk prediction to deliver personalized, preventive healthcare.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5"></div>
                  <span className="text-gray-700">
                    <strong>Nutrition Engine:</strong> KNN-based meal recommendations using medical conditions, allergies, and caloric needs
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5"></div>
                  <span className="text-gray-700">
                    <strong>Risk Modeling:</strong> Multi-factor symptom analysis with severity prediction and clinical alerts
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5"></div>
                  <span className="text-gray-700">
                    <strong>ERP Integration:</strong> Unified patient, doctor, dietitian, and admin workflows
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                  <span className="text-gray-700">
                    <strong>Preventive Care:</strong> Early detection and personalized interventions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        {activeSection === 'nutrition' && (
          <div className="space-y-8">
            <IntelligentNutritionPanel userId={user?._id} />
          </div>
        )}

        {activeSection === 'symptoms' && (
          <div className="space-y-8">
            <SymptomRiskPanel userId={user?._id} />
          </div>
        )}

        {activeSection === 'both' && (
          <div className="space-y-8">
            <IntelligentNutritionPanel userId={user?._id} />
            <SymptomRiskPanel userId={user?._id} />
          </div>
        )}

        {/* Key Features Section */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Key Research Implementation Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Nutrition Engine</h3>
              <p className="text-sm text-gray-700">
                Machine learning algorithms analyze your health profile to generate personalized meal plans with optimal macro and micronutrient distribution.
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Symptom Risk Modeling</h3>
              <p className="text-sm text-gray-700">
                Multi-factor risk assessment using severity, duration, frequency, and medical history to predict symptom urgency and recommend actions.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Clinical Integration</h3>
              <p className="text-sm text-gray-700">
                Seamless data flow between patients, doctors, and dietitians within a unified ERP system for coordinated care delivery.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Pattern Recognition</h3>
              <p className="text-sm text-gray-700">
                Identifies recurring symptoms and dietary patterns to provide proactive health insights and early intervention recommendations.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Personalization</h3>
              <p className="text-sm text-gray-700">
                Considers medical conditions, allergies, lifestyle, and health goals to deliver truly individualized nutrition and health guidance.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
              <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-Time Monitoring</h3>
              <p className="text-sm text-gray-700">
                Continuous tracking of symptoms and nutrition adherence with automated alerts for healthcare providers when intervention is needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
