import { createContext, useContext, useState, useEffect, useRef } from 'react'
import axios from 'axios'
import apiClient from '../utils/api'
import { signInWithRedirect, getRedirectResult, signOut, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'

// Configure axios baseURL for all axios calls
// Vite proxy handles /api -> http://localhost:5000
axios.defaults.baseURL = '/api'
apiClient.defaults.baseURL = '/api'

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
  const [authLoading, setAuthLoading] = useState(false)
  const [lastAuthAttempt, setLastAuthAttempt] = useState(0)

  const setAuthToken = (newToken) => {
    console.log('🔐 Setting auth token:', newToken ? `${newToken.substring(0, 20)}...` : 'null')
    setToken(newToken)
    
    // Set axios defaults immediately
    if (newToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      console.log('📡 Axios Authorization header set')
    } else {
      delete axios.defaults.headers.common['Authorization']
      console.log('🧹 Axios Authorization header cleared')
    }
  }

  // Set up axios defaults (backup useEffect)
  useEffect(() => {
    console.log('🔄 useEffect: Setting axios defaults with token:', token ? `${token.substring(0, 20)}...` : 'null')
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
          const response = await axios.get('/auth/me')
          console.log('✅ Auth check successful:', response.data.data.user)
          setUser(response.data.data.user)
        } catch (error) {
          console.error('❌ Auth check failed:', error.response?.status, error.message)
          
          // Handle rate limiting gracefully
          if (error.response?.status === 429) {
            console.log('⏳ Rate limited during auth check, will retry later')
            // Don't clear token on rate limit, just wait
            setTimeout(() => {
              if (token) {
                checkAuth()
              }
            }, 5000) // Retry after 5 seconds
          } else {
            // Clear malformed token for other errors
            localStorage.removeItem('token')
            setAuthToken(null)
          }
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
      authLoading
    })
  }, [user, token, loading, authLoading])

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password })
      const { user: userData, token: userToken } = response.data.data
      
      console.log('Login response:', { userData, userToken })
      
      setUser(userData)
      setAuthToken(userToken)
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
      const response = await axios.post('/auth/register', userData)
      const { user: newUser, token: userToken } = response.data.data
      
      setUser(newUser)
      setAuthToken(userToken)
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
    setAuthToken(null)
    localStorage.removeItem('token')
    // Redirect to login after logout
    window.location.href = '/login'
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/auth/profile', profileData)
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
      const response = await axios.post('/auth/google', { credential })
      const { user: userData, token: userToken } = response.data.data
      setUser(userData)
      setAuthToken(userToken)
      localStorage.setItem('token', userToken)
      return { success: true, user: userData }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Google sign-in failed'
      }
    }
  }

  const loginWithFirebase = async (retryCount = 0) => {
    try {
      // Debounce rapid authentication attempts
      const now = Date.now()
      const timeSinceLastAttempt = now - lastAuthAttempt
      const minInterval = 2000 // 2 seconds minimum between attempts
      
      if (timeSinceLastAttempt < minInterval && retryCount === 0) {
        console.log(`⏳ Too soon since last auth attempt (${timeSinceLastAttempt}ms), waiting...`)
        await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastAttempt))
      }
      
      setLastAuthAttempt(Date.now())
      console.log('🔥 Starting Firebase authentication...')
      setAuthLoading(true)
      
      // Use popup - with better error handling
      console.log('🚀 Opening Google Sign-In popup...')
      const result = await signInWithPopup(auth, googleProvider)
      console.log('✅ Popup authentication successful:', result.user.email)
      
      // Process the result immediately
      const idToken = await result.user.getIdToken()
      console.log('📡 Sending Firebase token to backend...')
      console.log('📡 Backend URL:', axios.defaults.baseURL)
      
      const response = await axios.post('/auth/firebase', { idToken }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Backend authentication failed')
      }
      
      const { user: userData, token: userToken } = response.data.data
      
      console.log('🎉 Firebase authentication successful:', userData)
      console.log('🔑 Token received:', !!userToken)
      console.log('👤 User role:', userData?.role, 'Email:', userData?.email)
      
      // Update state atomically
      setUser(userData)
      setAuthToken(userToken)
      localStorage.setItem('token', userToken)
      setAuthLoading(false)
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('💥 Firebase login error:', error)
      console.error('📋 Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      })
      
      // Handle rate limiting with exponential backoff
      if (error.response?.status === 429 && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000 // 1s, 2s, 4s
        console.log(`⏳ Rate limited, retrying in ${delay}ms (attempt ${retryCount + 1}/3)`)
        setAuthLoading(false)
        
        await new Promise(resolve => setTimeout(resolve, delay))
        return loginWithFirebase(retryCount + 1)
      }
      
      setAuthLoading(false)
      
      // Provide more helpful error messages
      let errorMessage = 'Google sign-in failed. Please try again.'
      if (error.response?.status === 429) {
        errorMessage = 'Too many authentication attempts. Please wait a moment and try again.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return {
        success: false,
        message: errorMessage
      }
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
    isAuthenticated: !!user && !!token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
