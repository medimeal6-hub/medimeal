import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Bell, 
  X, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  ChevronRight,
  Trash2,
  Eye,
  EyeOff,
  Play,
  Pause
} from 'lucide-react'
import { useNotifications } from '../contexts/NotificationContext'
import { useEventAlerts } from '../contexts/EventAlertContext'

const NotificationPanel = () => {
  const navigate = useNavigate()
  const panelRef = useRef(null)
  const {
    notifications,
    unreadCount,
    showNotificationPanel,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    closeNotificationPanel
  } = useNotifications()

  // Get event alert context
  let eventAlerts = null
  try {
    eventAlerts = useEventAlerts()
  } catch (error) {
    // EventAlertContext not available
  }

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        closeNotificationPanel()
      }
    }

    if (showNotificationPanel) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotificationPanel, closeNotificationPanel])

  const getNotificationIcon = (type, priority) => {
    switch (type) {
      case 'calendar_event':
        return <Calendar className="h-4 w-4 text-blue-600" />
      case 'overdue_event':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'upcoming_event':
        return <Clock className="h-4 w-4 text-orange-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-l-green-500 bg-green-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id)
    
    // Navigate to calendar if it's an event notification
    if (notification.type.includes('event')) {
      navigate('/calendar')
    }
    
    closeNotificationPanel()
  }

  const sortedNotifications = [...notifications].sort((a, b) => {
    // Sort by priority first (high, medium, low), then by timestamp
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const aPriority = priorityOrder[a.priority] || 0
    const bPriority = priorityOrder[b.priority] || 0
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority
    }
    
    return new Date(b.timestamp) - new Date(a.timestamp)
  })

  if (!showNotificationPanel) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 z-50 flex justify-end">
      <div 
        ref={panelRef}
        className="w-96 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={closeNotificationPanel}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Upcoming Events Section */}
        {eventAlerts && eventAlerts.upcomingEvents && eventAlerts.upcomingEvents.length > 0 && (
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                Upcoming Events
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => eventAlerts.startEventMonitoring()}
                  className={`p-1 rounded ${eventAlerts.isMonitoring ? 'text-green-600' : 'text-gray-400'}`}
                  title={eventAlerts.isMonitoring ? 'Monitoring Active' : 'Start Monitoring'}
                >
                  {eventAlerts.isMonitoring ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {eventAlerts.upcomingEvents.slice(0, 3).map((event) => {
                const eventDateTime = new Date(`${event.date}T${event.time}`)
                const timeUntil = eventDateTime.getTime() - new Date().getTime()
                const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60))
                const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60))
                
                return (
                  <div
                    key={event._id}
                    className="flex items-center justify-between p-2 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100"
                    onClick={() => navigate('/calendar')}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {hoursUntil > 0 ? `${hoursUntil}h ${minutesUntil}m` : `${minutesUntil}m`} • {event.type}
                      </p>
                    </div>
                    <ChevronRight className="h-3 w-3 text-gray-400" />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {sortedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Bell className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-1">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Trash2 className="h-3 w-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {sortedNotifications.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={clearAllNotifications}
              className="w-full text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear all notifications
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationPanel

