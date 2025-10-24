import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const RedirectHandler = () => {
  const { redirectAfterAuth, setRedirectAfterAuth, isAuthenticated, loading, user, redirectTimeout, setRedirectTimeout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const hasRedirected = useRef(false)

  useEffect(() => {
    console.log('🔄 RedirectHandler effect triggered:', { 
      redirectAfterAuth, 
      isAuthenticated, 
      loading,
      user: !!user,
      userRole: user?.role,
      currentPath: location.pathname,
      shouldRedirect: redirectAfterAuth && isAuthenticated && !loading && !hasRedirected.current
    })
    
    // Only redirect if we have a redirect destination, user is authenticated, not loading, and haven't redirected yet
    // Don't redirect if user is trying to access login/register pages directly
    if (redirectAfterAuth && isAuthenticated && !loading && user && !hasRedirected.current) {
      // Skip redirect if user is on login/register pages (let them stay there)
      if (location.pathname === '/login' || location.pathname === '/register') {
        console.log('🚫 User is on auth page, skipping redirect')
        setRedirectAfterAuth(null) // Clear the redirect
        return
      }
      
      console.log('🚀 RedirectHandler: Navigating to:', redirectAfterAuth)
      hasRedirected.current = true
      
      // Clear any existing timeout
      if (redirectTimeout) {
        clearTimeout(redirectTimeout)
        setRedirectTimeout(null)
      }
      
      setRedirectAfterAuth(null) // Clear the redirect
      
      // Direct users to appropriate destination
      let destination = redirectAfterAuth
      if (user.role === 'admin') {
        destination = '/admin'
        console.log('👑 Admin user, redirecting to admin dashboard:', destination)
      } else if (user.role === 'doctor') {
        destination = '/doctor'
        console.log('👨‍⚕️ Doctor user, redirecting to doctor dashboard:', destination)
      } else {
        destination = '/dashboard'
        console.log('👤 Regular user, redirecting to dashboard:', destination)
      }
      
      console.log('🎯 Final destination:', destination)
      
      // Use setTimeout to ensure the state update completes before navigation
      setTimeout(() => {
        navigate(destination, { replace: true })
      }, 100)
    }
  }, [redirectAfterAuth, setRedirectAfterAuth, navigate, isAuthenticated, loading, user, location.pathname])

  // Reset the redirect flag when the redirect destination changes
  useEffect(() => {
    if (redirectAfterAuth) {
      hasRedirected.current = false
    }
  }, [redirectAfterAuth])

  return null // This component doesn't render anything
}

export default RedirectHandler
