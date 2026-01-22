import { createContext, useContext, useState, useEffect } from 'react'
import calendarService from '../services/calendarService'
import { useEventAlerts } from './EventAlertContext'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)

  // Check for events that need notifications
  const checkForEventNotifications = async () => {
    try {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      
      // Get today's events
      const response = await calendarService.getEventsByDateRange(todayStr, todayStr)
      const todayEvents = response.data || []
      
      // Create notifications for today's events
      const eventNotifications = todayEvents.map(event => ({
        id: `event-${event._id}`,
        type: 'calendar_event',
        title: `Event Today: ${event.title}`,
        message: `${event.type} at ${event.time}`,
        timestamp: new Date(),
        read: false,
        priority: event.priority || 'medium',
        eventId: event._id,
        eventData: event
      }))
      
      // Add new notifications (avoid duplicates)
      setNotifications(prev => {
        const existingIds = prev.map(n => n.id)
        const newNotifications = eventNotifications.filter(n => !existingIds.includes(n.id))
        return [...prev, ...newNotifications]
      })
      
    } catch (error) {
      console.error('Error checking for event notifications:', error)
    }
  }

  // Check for overdue events
  const checkForOverdueNotifications = async () => {
    try {
      const response = await calendarService.getOverdueEvents()
      const overdueEvents = response.data || []
      
      const overdueNotifications = overdueEvents.map(event => ({
        id: `overdue-${event._id}`,
        type: 'overdue_event',
        title: `Overdue Event: ${event.title}`,
        message: `This ${event.type} was scheduled for ${new Date(event.date).toLocaleDateString()}`,
        timestamp: new Date(),
        read: false,
        priority: 'high',
        eventId: event._id,
        eventData: event
      }))
      
      setNotifications(prev => {
        const existingIds = prev.map(n => n.id)
        const newNotifications = overdueNotifications.filter(n => !existingIds.includes(n.id))
        return [...prev, ...newNotifications]
      })
      
    } catch (error) {
      console.error('Error checking for overdue notifications:', error)
    }
  }

  // Check for upcoming events (next 24 hours)
  const checkForUpcomingNotifications = async () => {
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]
      
      const response = await calendarService.getEventsByDateRange(tomorrowStr, tomorrowStr)
      const upcomingEvents = response.data || []
      
      const upcomingNotifications = upcomingEvents.map(event => ({
        id: `upcoming-${event._id}`,
        type: 'upcoming_event',
        title: `Upcoming Event: ${event.title}`,
        message: `${event.type} tomorrow at ${event.time}`,
        timestamp: new Date(),
        read: false,
        priority: 'medium',
        eventId: event._id,
        eventData: event
      }))
      
      setNotifications(prev => {
        const existingIds = prev.map(n => n.id)
        const newNotifications = upcomingNotifications.filter(n => !existingIds.includes(n.id))
        return [...prev, ...newNotifications]
      })
      
    } catch (error) {
      console.error('Error checking for upcoming notifications:', error)
    }
  }

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  // Remove notification
  const removeNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    )
  }

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([])
  }

  // Toggle notification panel
  const toggleNotificationPanel = () => {
    setShowNotificationPanel(prev => !prev)
  }

  // Close notification panel
  const closeNotificationPanel = () => {
    setShowNotificationPanel(false)
  }

  // Update unread count when notifications change
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length
    setUnreadCount(unread)
  }, [notifications])

  // Check for notifications periodically
  useEffect(() => {
    // Check immediately
    checkForEventNotifications()
    checkForOverdueNotifications()
    checkForUpcomingNotifications()

    // Check every hour
    const interval = setInterval(() => {
      checkForEventNotifications()
      checkForOverdueNotifications()
      checkForUpcomingNotifications()
    }, 60 * 60 * 1000) // 1 hour

    return () => clearInterval(interval)
  }, [])

  // Add manual notification (for testing or other purposes)
  const addNotification = (notification) => {
    const newNotification = {
      id: `manual-${Date.now()}`,
      timestamp: new Date(),
      read: false,
      priority: 'medium',
      ...notification
    }
    
    setNotifications(prev => [newNotification, ...prev])
  }

  const value = {
    notifications,
    unreadCount,
    showNotificationPanel,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    toggleNotificationPanel,
    closeNotificationPanel,
    addNotification,
    checkForEventNotifications,
    checkForOverdueNotifications,
    checkForUpcomingNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

