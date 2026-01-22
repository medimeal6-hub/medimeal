import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Heart, ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    // Basic validation
    if (!email) {
      setError('Please enter your email address')
      setLoading(false)
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const response = await axios.post('/auth/forgot-password', { email })
      
      if (response.data.success) {
        setMessage(response.data.message)
        setEmailSent(true)
      } else {
        setError(response.data.message || 'Failed to send reset email')
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset email')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Login */}
        <div className="mb-4">
          <Link 
            to="/login" 
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors group text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">MediMeal</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Forgot Password?</h1>
            <p className="text-sm text-gray-600">
              {emailSent 
                ? "We've sent you a reset link" 
                : "Enter your email to receive a password reset link"
              }
            </p>
          </div>

          {/* Form */}
          <div className="px-6 pb-6">
            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-red-700 text-sm">{error}</div>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-gray-900 placeholder-gray-500"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Reset Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            ) : (
              /* Success Message */
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Check Your Email</h3>
                  <p className="text-sm text-gray-600">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    The link will expire in 1 hour. Check your spam folder if you don't see it.
                  </p>
                </div>

                <div className="space-y-2">
                  <Link 
                    to="/login" 
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors text-sm"
                  >
                    Back to Login
                  </Link>
                  <button
                    onClick={() => {
                      setEmailSent(false)
                      setEmail('')
                      setMessage('')
                      setError('')
                    }}
                    className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg font-medium transition-colors text-sm"
                  >
                    Try Different Email
                  </button>
                </div>
              </div>
            )}

            {/* Help Text */}
            {!emailSent && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Remember your password?{' '}
                  <Link 
                    to="/login" 
                    className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Secure & Private
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Link Expires in 1 Hour
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
