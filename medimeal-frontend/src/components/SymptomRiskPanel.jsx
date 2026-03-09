import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Activity, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const SymptomRiskPanel = ({ userId }) => {
  const [symptomData, setSymptomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddSymptom, setShowAddSymptom] = useState(false);
  const [newSymptom, setNewSymptom] = useState({
    name: '',
    category: 'pain',
    severity: 5,
    frequency: 'once',
    duration: 60,
    description: '',
    onsetDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadSymptomData();
  }, [userId]);

  const loadSymptomData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/symptoms/risk-dashboard');
      setSymptomData(response.data.data);
    } catch (error) {
      console.error('Error loading symptom data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSymptom = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/symptoms/with-risk', newSymptom);
      setShowAddSymptom(false);
      setNewSymptom({
        name: '',
        category: 'pain',
        severity: 5,
        frequency: 'once',
        duration: 60,
        description: '',
        onsetDate: new Date().toISOString().split('T')[0]
      });
      loadSymptomData();
    } catch (error) {
      console.error('Error adding symptom:', error);
      alert('Failed to add symptom');
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'HIGH': return <XCircle className="h-5 w-5" />;
      case 'MEDIUM': return <AlertCircle className="h-5 w-5" />;
      case 'LOW': return <CheckCircle className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Symptom Risk Analysis</h3>
            <p className="text-sm text-gray-600">AI-powered symptom monitoring</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddSymptom(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          Log Symptom
        </button>
      </div>

      {/* Summary Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{symptomData?.summary?.totalActive || 0}</div>
          <div className="text-sm text-blue-600 mt-1">Active Symptoms</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
          <div className="text-2xl font-bold text-red-700">{symptomData?.summary?.highRiskCount || 0}</div>
          <div className="text-sm text-red-600 mt-1">High Risk</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-700">{symptomData?.summary?.mediumRiskCount || 0}</div>
          <div className="text-sm text-yellow-600 mt-1">Medium Risk</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="text-2xl font-bold text-orange-700">{symptomData?.summary?.totalUrgent || 0}</div>
          <div className="text-sm text-orange-600 mt-1">Urgent</div>
        </div>
      </div>

      {/* Active Symptoms with Risk */}
      {symptomData?.activeSymptoms && symptomData.activeSymptoms.length > 0 && (
        <div className="px-6 pb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Active Symptoms</h4>
          <div className="space-y-3">
            {symptomData.activeSymptoms.slice(0, 5).map((symptom) => (
              <div key={symptom._id} className={`border-2 rounded-xl p-4 ${getRiskColor(symptom.riskAssessment.riskLevel)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getRiskIcon(symptom.riskAssessment.riskLevel)}
                    <h5 className="font-semibold">{symptom.name}</h5>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50">
                      {symptom.category}
                    </span>
                    <span className="text-xs font-bold">
                      Severity: {symptom.severity}/10
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-xs mb-2">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{symptom.frequency}</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>Risk Score: {symptom.riskAssessment.riskScore}/100</span>
                  </div>
                </div>

                <div className="bg-white/60 rounded-lg p-2 text-xs">
                  <strong>Recommendation:</strong> {symptom.riskAssessment.recommendation}
                </div>

                {symptom.riskAssessment.riskFactors && symptom.riskAssessment.riskFactors.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {symptom.riskAssessment.riskFactors.map((factor, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-white/40 rounded-full">
                        {factor}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pattern Insights */}
      {symptomData?.patterns?.insights && symptomData.patterns.insights.length > 0 && (
        <div className="px-6 pb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Pattern Insights</h4>
          <div className="space-y-2">
            {symptomData.patterns.insights.map((insight, idx) => (
              <div key={idx} className={`p-3 rounded-lg border-l-4 ${
                insight.severity === 'high' ? 'bg-red-50 border-red-500' :
                insight.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'
              }`}>
                <p className="text-sm text-gray-800">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Symptom Modal */}
      {showAddSymptom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Log New Symptom</h3>
              <p className="text-sm text-gray-600 mt-1">AI will analyze risk level automatically</p>
            </div>
            
            <form onSubmit={handleAddSymptom} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Symptom Name</label>
                <input
                  type="text"
                  required
                  value={newSymptom.name}
                  onChange={(e) => setNewSymptom({...newSymptom, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Headache, Chest pain"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newSymptom.category}
                    onChange={(e) => setNewSymptom({...newSymptom, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pain">Pain</option>
                    <option value="digestive">Digestive</option>
                    <option value="respiratory">Respiratory</option>
                    <option value="cardiovascular">Cardiovascular</option>
                    <option value="neurological">Neurological</option>
                    <option value="skin">Skin</option>
                    <option value="mental-health">Mental Health</option>
                    <option value="fatigue">Fatigue</option>
                    <option value="fever">Fever</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={newSymptom.frequency}
                    onChange={(e) => setNewSymptom({...newSymptom, frequency: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="once">Once</option>
                    <option value="occasional">Occasional</option>
                    <option value="frequent">Frequent</option>
                    <option value="constant">Constant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity: {newSymptom.severity}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newSymptom.severity}
                  onChange={(e) => setNewSymptom({...newSymptom, severity: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Mild</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={newSymptom.duration}
                  onChange={(e) => setNewSymptom({...newSymptom, duration: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={newSymptom.description}
                  onChange={(e) => setNewSymptom({...newSymptom, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Additional details about the symptom..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddSymptom(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700"
                >
                  Analyze & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomRiskPanel;
