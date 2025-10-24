import { useEffect } from 'react'

const PerformanceMonitor = () => {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }

    // Performance monitoring
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          console.log('Page load time:', entry.loadEventEnd - entry.loadEventStart, 'ms')
        }
        if (entry.entryType === 'measure') {
          console.log('Custom measure:', entry.name, entry.duration, 'ms')
        }
      }
    })

    observer.observe({ entryTypes: ['navigation', 'measure'] })

    // Memory usage monitoring
    if ('memory' in performance) {
      const logMemoryUsage = () => {
        const memory = performance.memory
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
        })
      }

      // Log memory usage every 30 seconds
      const memoryInterval = setInterval(logMemoryUsage, 30000)
      
      return () => {
        observer.disconnect()
        clearInterval(memoryInterval)
      }
    }

    return () => observer.disconnect()
  }, [])

  return null
}

export default PerformanceMonitor
