import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { signInWithRedirect, getRedirectResult, signOut, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [redirectAfterAuth, setRedirectAfterAuth] = useState(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [redirectTimeout, setRedirectTimeout] = useState(null)

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          console.log('🔍 Checking auth with token:', token.substring(0, 20) + '...')
          const response = await axios.get('/api/auth/me')
          console.log('✅ Auth check successful:', response.data.data.user)
          setUser(response.data.data.user)
        } catch (error) {
          console.error('❌ Auth check failed:', error.response?.status, error.message)
          // Clear malformed token
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [token])

  // Debug authentication state changes
  useEffect(() => {
    console.log('Auth state changed:', { 
      user: !!user, 
      token: !!token, 
      isAuthenticated: !!user && !!token,
      loading: loading || authLoading,
      redirectAfterAuth,
      authLoading
    })
  }, [user, token, loading, authLoading, redirectAfterAuth])

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { user: userData, token: userToken } = response.data.data
      
      console.log('Login response:', { userData, userToken })
      
      setUser(userData)
      setToken(userToken)
      localStorage.setItem('token', userToken)
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData)
      const { user: newUser, token: userToken } = response.data.data
      
      setUser(newUser)
      setToken(userToken)
      localStorage.setItem('token', userToken)
      
      return { success: true, user: newUser }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    // Redirect to login after logout
    window.location.href = '/login'
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/auth/profile', profileData)
      setUser(response.data.data.user)
      return { success: true, user: response.data.data.user }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed' 
      }
    }
  }

  const updateUserData = (userData) => {
    setUser(userData)
  }

  const loginWithGoogle = async (credential) => {
    try {
      const response = await axios.post('/api/auth/google', { credential })
      const { user: userData, token: userToken } = response.data.data
      setUser(userData)
      setToken(userToken)
      localStorage.setItem('token', userToken)
      return { success: true, user: userData }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Google sign-in failed'
      }
    }
  }

  const loginWithFirebase = async () => {
    try {
      console.log('🔥 Starting Firebase authentication...')
      console.log('🔧 Auth object:', !!auth)
      console.log('🔧 Google provider:', !!googleProvider)
      
      // Try popup first, fallback to redirect
      try {
        console.log('🚀 Trying popup authentication...')
        const result = await signInWithPopup(auth, googleProvider)
        console.log('✅ Popup authentication successful:', result.user.email)
        
        // Process the result immediately
        const idToken = await result.user.getIdToken()
        console.log('📡 Sending Firebase token to backend...')
        const response = await axios.post('/api/auth/firebase', { idToken })
        const { user: userData, token: userToken } = response.data.data
        
        console.log('🎉 Firebase authentication successful:', userData)
        console.log('🔑 Token received:', !!userToken)
        console.log('👤 User role:', userData?.role, 'Email:', userData?.email)
        
        // Update state atomically
        setUser(userData)
        setToken(userToken)
        localStorage.setItem('token', userToken)
        
        return { success: true, user: userData }
      } catch (popupError) {
        console.log('⚠️ Popup failed, trying redirect:', popupError.message)
        
        // Fallback to redirect
        console.log('🚀 Calling signInWithRedirect...')
        await signInWithRedirect(auth, googleProvider)
        console.log('✅ signInWithRedirect completed')
        return { success: true, redirecting: true }
      }
    } catch (error) {
      console.error('💥 Firebase login error:', error)
      console.error('📋 Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      })
      return {
        success: false,
        message: error.message || 'Firebase sign-in failed'
      }
    }
  }

  // Handle redirect result when user comes back from Google
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        console.log('🔍 Starting redirect result handling...')
        setAuthLoading(true)
        const result = await getRedirectResult(auth)
        
        if (result) {
          console.log('✅ Google OAuth redirect result received:', result.user.email)
          const idToken = await result.user.getIdToken()
          
          console.log('📡 Sending Firebase token to backend...')
          const response = await axios.post('/api/auth/firebase', { idToken })
          const { user: userData, token: userToken } = response.data.data
          
          console.log('🎉 Firebase authentication successful:', userData)
          console.log('🔑 Token received:', !!userToken)
          console.log('👤 User role:', userData?.role, 'Email:', userData?.email)
          
          // Update state atomically
          setUser(userData)
          setToken(userToken)
          localStorage.setItem('token', userToken)
          
          // Set redirect destination for RedirectHandler to handle
          const destination = userData?.role === 'admin' ? '/admin' : '/dashboard'
          console.log('✅ Authentication successful, setting redirect to:', destination, 'for role:', userData?.role)
          console.log('🔍 Full user data:', JSON.stringify(userData, null, 2))
          
          // Use setTimeout to ensure state updates are processed
          setTimeout(() => {
            setRedirectAfterAuth(destination)
            
            // Set a timeout to clear redirect if it doesn't happen within 5 seconds
            const timeout = setTimeout(() => {
              console.log('⚠️ Redirect timeout - clearing redirect state')
              setRedirectAfterAuth(null)
              setAuthLoading(false)
            }, 5000)
            setRedirectTimeout(timeout)
          }, 50)
        } else {
          console.log('❌ No redirect result found')
        }
      } catch (error) {
        console.error('💥 Redirect result error:', error)
        console.error('📋 Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        // Show error to user
        alert(`Authentication failed: ${error.message}. Please try again.`)
      } finally {
        setAuthLoading(false)
      }
    }

    handleRedirectResult()
  }, [])

  const logoutFirebase = async () => {
    try {
      await signOut(auth)
      logout()
    } catch (error) {
      console.error('Firebase logout error:', error)
      logout() // Fallback to regular logout
    }
  }

  const value = {
    user,
    token,
    loading: loading || authLoading,
    login,
    register,
    logout,
    updateProfile,
    updateUserData,
    loginWithGoogle,
    loginWithFirebase,
    logoutFirebase,
    isAuthenticated: !!user && !!token,
    redirectAfterAuth,
    setRedirectAfterAuth,
    redirectTimeout,
    setRedirectTimeout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
