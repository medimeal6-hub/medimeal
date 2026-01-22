import { useEffect } from 'react'
import { useEventAlerts } from '../contexts/EventAlertContext'

const EventMonitoringInitializer = () => {
  const { startEventMonitoring } = useEventAlerts()

  useEffect(() => {
    // Start monitoring events when the app loads
    startEventMonitoring()
  }, [startEventMonitoring])

  return null // This component doesn't render anything
}

export default EventMonitoringInitializer
