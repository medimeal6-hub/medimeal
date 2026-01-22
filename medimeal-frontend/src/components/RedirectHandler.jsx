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
    // Allow redirects even from login/register pages (needed for Google sign-in redirect flow)
    if (redirectAfterAuth && isAuthenticated && !loading && user && !hasRedirected.current) {
      console.log('🚀 RedirectHandler: Navigating to:', redirectAfterAuth)
      hasRedirected.current = true
      
      // Clear any existing timeout
      if (redirectTimeout) {
        clearTimeout(redirectTimeout)
        setRedirectTimeout(null)
      }
      
      // Use the destination that was already set in AuthContext
      const destination = redirectAfterAuth
      console.log('🎯 Redirecting to destination:', destination)
      console.log('👤 User role:', user.role)
      
      setRedirectAfterAuth(null) // Clear the redirect
      
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
