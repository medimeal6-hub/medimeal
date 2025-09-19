import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, user, token } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Check if user is authenticated - use both user state and token presence
  const userAuthenticated = isAuthenticated && user && token
  
  if (!userAuthenticated) {
    return <Navigate to="/login" />
  }
  
  // Check role-based access
  if (roles && roles.length > 0 && user && !roles.includes(user.role)) {
    return <Navigate to="/" />
  }
  return children
}

export default ProtectedRoute
