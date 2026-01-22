import { createContext, useContext, useState, useEffect, useRef } from 'react'
import calendarService from '../services/calendarService'

const EventAlertContext = createContext()

export const useEventAlerts = () => {
  const context = useContext(EventAlertContext)
  if (!context) {
    throw new Error('useEventAlerts must be used within an EventAlertProvider')
  }
  return context
}

export const EventAlertProvider = ({ children }) => {
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [todayEvents, setTodayEvents] = useState([])
  const [alertedEvents, setAlertedEvents] = useState(new Set())
  const intervalRef = useRef(null)
  const [isMonitoring, setIsMonitoring] = useState(false)

  // Check for events that need alerts
  const checkForEventAlerts = async () => {
    try {
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      
      // Get today's events
      const response = await calendarService.getEventsByDateRange(today, today)
      const events = response.data || []
      
      // Check each event for alert timing
      events.forEach(event => {
        const eventDateTime = new Date(`${event.date}T${event.time}`)
        const timeDiff = eventDateTime.getTime() - now.getTime()
        
        // Alert if event is within 5 minutes and hasn't been alerted yet
        if (timeDiff <= 5 * 60 * 1000 && timeDiff >= 0 && !alertedEvents.has(event._id)) {
          showEventAlert(event)
          setAlertedEvents(prev => new Set([...prev, event._id]))
        }
      })
      
      setTodayEvents(events)
    } catch (error) {
      console.error('Error checking for event alerts:', error)
    }
  }

  // Show browser alert for event
  const showEventAlert = (event) => {
    const eventTime = new Date(`${event.date}T${event.time}`).toLocaleString()
    
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Event Reminder: ${event.title}`, {
        body: `${event.type} scheduled for ${eventTime}`,
        icon: '/favicon.ico',
        tag: `event-${event._id}`
      })
    }
    
    // Browser alert as fallback
    alert(`🔔 Event Reminder!\n\n${event.title}\n${event.type} - ${eventTime}\n\n${event.description || ''}`)
  }

  // Get upcoming events (next 7 days)
  const fetchUpcomingEvents = async () => {
    try {
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      const response = await calendarService.getEventsByDateRange(
        today.toISOString().split('T')[0],
        nextWeek.toISOString().split('T')[0]
      )
      
      const events = response.data || []
      
      // Filter and sort upcoming events
      const upcoming = events
        .filter(event => {
          const eventDateTime = new Date(`${event.date}T${event.time}`)
          return eventDateTime > today && !event.completed
        })
        .sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`)
          const dateB = new Date(`${b.date}T${b.time}`)
          return dateA - dateB
        })
        .slice(0, 10) // Limit to 10 upcoming events
      
      setUpcomingEvents(upcoming)
    } catch (error) {
      console.error('Error fetching upcoming events:', error)
    }
  }

  // Start monitoring events
  const startEventMonitoring = () => {
    if (isMonitoring) return
    
    setIsMonitoring(true)
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    
    // Check immediately
    checkForEventAlerts()
    fetchUpcomingEvents()
    
    // Check every minute
    intervalRef.current = setInterval(() => {
      checkForEventAlerts()
      fetchUpcomingEvents()
    }, 60 * 1000) // 1 minute
  }

  // Stop monitoring events
  const stopEventMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsMonitoring(false)
  }

  // Clear alerted events (for testing)
  const clearAlertedEvents = () => {
    setAlertedEvents(new Set())
  }

  // Manual alert check (for testing)
  const triggerManualAlertCheck = () => {
    checkForEventAlerts()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const value = {
    upcomingEvents,
    todayEvents,
    alertedEvents,
    isMonitoring,
    startEventMonitoring,
    stopEventMonitoring,
    clearAlertedEvents,
    triggerManualAlertCheck,
    fetchUpcomingEvents,
    checkForEventAlerts
  }

  return (
    <EventAlertContext.Provider value={value}>
      {children}
    </EventAlertContext.Provider>
  )
}
