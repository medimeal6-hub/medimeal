import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, AlertTriangle, CheckCircle, XCircle, Clock, Activity, Heart, Utensils } from 'lucide-react';

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('/api/doctor/alerts');
      setAlerts(response.data.data.alerts);
      setSummary(response.data.data.summary);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      // Use mock data on error
      const mockAlerts = [
        {
          id: 'alert-1',
          type: 'non-compliance',
          severity: 'high',
          title: 'Diet Compliance Issue',
          message: 'Patient skipped 3 meals in the last 2 days',
          patientId: 'patient-1',
          patientName: 'John Doe',
          category: 'diet-plan',
          timestamp: new Date(),
          context: { planId: 'plan-1' }
        },
        {
          id: 'alert-2',
          type: 'high-risk',
          severity: 'high',
          title: 'Critical Blood Pressure',
          message: 'Patient John Doe has critical BP: 165/105 mmHg',
          patientId: 'patient-1',
          patientName: 'John Doe',
          vitalType: 'blood-pressure',
          value: '165/105',
          timestamp: new Date()
        },
        {
          id: 'alert-3',
          type: 'appointment',
          severity: 'medium',
          title: 'Upcoming Appointment',
          message: 'Appointment with Jane Smith in 2 hour(s)',
          patientId: 'patient-2',
          patientName: 'Jane Smith',
          appointmentId: 'apt-1',
          appointmentDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
          hoursUntil: 2,
          timestamp: new Date()
        },
        {
          id: 'alert-4',
          type: 'nutrition',
          severity: 'medium',
          title: 'No Meals Logged Today',
          message: 'Patient Mike Johnson has not logged any meals today despite having an active diet plan',
          patientId: 'patient-3',
          patientName: 'Mike Johnson',
          timestamp: new Date()
        },
        {
          id: 'alert-5',
          type: 'symptom',
          severity: 'high',
          title: 'Urgent Symptom',
          message: 'Patient Sarah Williams has urgent symptom: Chest Pain (Severity: 9/10)',
          patientId: 'patient-4',
          patientName: 'Sarah Williams',
          symptomName: 'Chest Pain',
          symptomSeverity: 9,
          timestamp: new Date()
        }
      ];
      setAlerts(mockAlerts);
      setSummary({
        total: 5,
        high: 3,
        medium: 2,
        low: 0,
        byType: {
          'non-compliance': 1,
          'high-risk': 1,
          'appointment': 1,
          'nutrition': 1,
          'symptom': 1
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await axios.post(`/api/doctor/alerts/${alertId}/resolve`, {});
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
      alert('Failed to resolve alert');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'non-compliance':
        return <XCircle className="w-5 h-5" />;
      case 'high-risk':
        return <AlertTriangle className="w-5 h-5" />;
      case 'appointment':
        return <Clock className="w-5 h-5" />;
      case 'nutrition':
        return <Utensils className="w-5 h-5" />;
      case 'symptom':
        return <Activity className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Alerts</div>
            <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 shadow-sm border border-red-200">
            <div className="text-sm text-red-600 mb-1">High Priority</div>
            <div className="text-2xl font-bold text-red-700">{summary.high}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 shadow-sm border border-yellow-200">
            <div className="text-sm text-yellow-600 mb-1">Medium</div>
            <div className="text-2xl font-bold text-yellow-700">{summary.medium}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200">
            <div className="text-sm text-blue-600 mb-1">Low</div>
            <div className="text-2xl font-bold text-blue-700">{summary.low}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 shadow-sm border border-purple-200">
            <div className="text-sm text-purple-600 mb-1">By Type</div>
            <div className="text-xs text-purple-700 mt-1">
              {Object.entries(summary.byType).map(([type, count]) => (
                <div key={type}>{type}: {count}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('non-compliance')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'non-compliance' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Non-Compliance
          </button>
          <button
            onClick={() => setFilter('high-risk')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'high-risk' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            High Risk
          </button>
          <button
            onClick={() => setFilter('appointment')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'appointment' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setFilter('nutrition')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'nutrition' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Nutrition
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Alerts & Notifications</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <div key={alert.id} className={`p-6 border-l-4 ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <div className={`p-2 rounded-lg mr-4 ${
                      alert.severity === 'high' ? 'bg-red-100' :
                      alert.severity === 'medium' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.severity === 'high' ? 'bg-red-200 text-red-800' :
                          alert.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-blue-200 text-blue-800'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                      <div className="text-xs text-gray-500">
                        Patient: {alert.patientName} • {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="ml-4 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Resolve
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No alerts found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsPanel;

