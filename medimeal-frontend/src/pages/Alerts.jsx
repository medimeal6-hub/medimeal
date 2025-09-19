import { useState } from 'react'
import { AlertTriangle, CheckCircle, X, Clock, Shield, Heart, Bell, Filter } from 'lucide-react'
import alertsData from '../data/alerts.json'

const Alerts = () => {
  const [alerts, setAlerts] = useState(alertsData)
  const [filter, setFilter] = useState('All')

  const riskLevels = ['All', 'High', 'Medium', 'Low']

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'All') return true
    return alert.riskLevel === filter
  })

  const dismissAlert = (alertId) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ))
  }

  const acknowledgeAlert = (alertId) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-700',
          dot: 'bg-red-500'
        }
      case 'Medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-700',
          dot: 'bg-yellow-500'
        }
      case 'Low':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-700',
          dot: 'bg-blue-500'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-700',
          dot: 'bg-gray-500'
        }
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Drug-Food Interaction':
        return Heart
      case 'Drug-Alcohol Interaction':
        return AlertTriangle
      case 'Supplement Interaction':
        return Shield
      case 'Medication Timing':
        return Clock
      default:
        return Bell
    }
  }

  const activeAlerts = alerts.filter(alert => !alert.dismissed)
  const dismissedAlerts = alerts.filter(alert => alert.dismissed)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Medication Alerts</h2>
            <p className="text-gray-600">
              Stay informed about potential interactions and important medication information.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Bell className="h-4 w-4" />
              <span>{activeAlerts.length} active alerts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-2">
          {riskLevels.map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                filter === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {level !== 'All' && (
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  level === 'High' ? 'bg-red-500' :
                  level === 'Medium' ? 'bg-yellow-500' :
                  level === 'Low' ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
              )}
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
          <p className="text-sm text-gray-600">Important interactions and warnings</p>
        </div>

        <div className="p-6">
          {filteredAlerts.filter(alert => !alert.dismissed).length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Alerts</h3>
              <p className="text-gray-600">You're all caught up! No active alerts to review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.filter(alert => !alert.dismissed).map((alert) => {
                const colors = getRiskColor(alert.riskLevel)
                const CategoryIcon = getCategoryIcon(alert.category)
                
                return (
                  <div key={alert.id} className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center`}>
                          <CategoryIcon className={`h-4 w-4 ${colors.icon}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{alert.message}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                              {alert.riskLevel} Risk
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{alert.description}</p>
                          
                          {/* Medications */}
                          <div className="mb-3">
                            <h5 className="text-xs font-medium text-gray-600 mb-1">Affected Medications:</h5>
                            <div className="flex flex-wrap gap-1">
                              {alert.medications.map((med, index) => (
                                <span key={index} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700">
                                  {med}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Foods */}
                          <div className="mb-3">
                            <h5 className="text-xs font-medium text-gray-600 mb-1">Avoid These Foods:</h5>
                            <div className="flex flex-wrap gap-1">
                              {alert.foods.map((food, index) => (
                                <span key={index} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700">
                                  {food}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{new Date(alert.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                          title="Acknowledge"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                          title="Dismiss"
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dismissed Alerts */}
      {dismissedAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Dismissed Alerts</h3>
            <p className="text-sm text-gray-600">Previously dismissed alerts</p>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {dismissedAlerts.map((alert) => {
                const colors = getRiskColor(alert.riskLevel)
                const CategoryIcon = getCategoryIcon(alert.category)
                
                return (
                  <div key={alert.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 opacity-75">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
                        <CategoryIcon className="h-3 w-3 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-700 text-sm">{alert.message}</h4>
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                            {alert.riskLevel} Risk
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{alert.description}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Dismissed {new Date(alert.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.riskLevel === 'High' && !a.dismissed).length}
              </p>
              <p className="text-sm text-gray-600">High Risk Alerts</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.riskLevel === 'Medium' && !a.dismissed).length}
              </p>
              <p className="text-sm text-gray-600">Medium Risk Alerts</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.dismissed).length}
              </p>
              <p className="text-sm text-gray-600">Dismissed Alerts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Alerts
