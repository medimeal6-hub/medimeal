import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Bell, 
  CreditCard,
  Save, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { loadScript } from '../utils/loadScript'

const Settings = () => {
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [billingLoading, setBillingLoading] = useState(false)
  const [plans, setPlans] = useState([])
  const [payments, setPayments] = useState([])

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || user?.displayName?.split(' ')[0] || '',
    lastName: user?.lastName || user?.displayName?.split(' ')[1] || '',
    email: user?.email || '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [preferences, setPreferences] = useState({
    guardianMode: false,
    emailNotifications: true,
    smsNotifications: false,
    medicationReminders: true,
    mealReminders: true
  })

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'privacy', name: 'Privacy', icon: Shield },
  ]

  const displayName = useMemo(() => {
    const fn = user?.firstName || ''
    const ln = user?.lastName || ''
    const full = `${fn} ${ln}`.trim()
    return full || user?.displayName || user?.email || 'MediMeal User'
  }, [user])

  useEffect(() => {
    // Keep form in sync when user loads after initial render
    setProfileData({
      firstName: user?.firstName || user?.displayName?.split(' ')[0] || '',
      lastName: user?.lastName || user?.displayName?.split(' ')[1] || '',
      email: user?.email || '',
    })
  }, [user])

  useEffect(() => {
    if (activeTab !== 'billing') return
    let cancelled = false

    const loadBillingData = async () => {
      try {
        setBillingLoading(true)
        const [plansRes, paymentsRes] = await Promise.all([
          axios.get('/subscription-plans'),
          axios.get('/user/payments'),
        ])
        if (cancelled) return
        setPlans(plansRes.data?.data || [])
        setPayments(paymentsRes.data?.data || [])
      } catch (e) {
        if (cancelled) return
        setMessage(e.response?.data?.message || 'Failed to load billing data')
      } finally {
        if (!cancelled) setBillingLoading(false)
      }
    }

    loadBillingData()
    return () => {
      cancelled = true
    }
  }, [activeTab])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handlePreferenceChange = (name, value) => {
    setPreferences(prev => ({ ...prev, [name]: value }))
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage('Profile updated successfully!')
      setLoading(false)
    } catch (error) {
      setMessage('Error updating profile. Please try again.')
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match')
      setLoading(false)
      return
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setLoading(false)
    } catch (error) {
      setMessage('Error changing password. Please try again.')
      setLoading(false)
    }
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>
        <p className="text-sm text-gray-600">Update your personal details and contact information.</p>
      </div>

      <form onSubmit={handleProfileSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={profileData.firstName}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={profileData.lastName}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Change Password</h3>
        <p className="text-sm text-gray-600">Update your password to keep your account secure.</p>
      </div>

      <form onSubmit={handlePasswordChange} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordInputChange}
              className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
          />
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Update Password
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Preferences</h3>
        <p className="text-sm text-gray-600">Choose how you want to be notified about important updates.</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive updates via email</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Bell className="h-5 w-5 text-green-600" />
            <div>
              <h4 className="font-medium text-gray-900">SMS Notifications</h4>
              <p className="text-sm text-gray-600">Receive urgent alerts via text message</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.smsNotifications}
              onChange={(e) => handlePreferenceChange('smsNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Bell className="h-5 w-5 text-purple-600" />
            <div>
              <h4 className="font-medium text-gray-900">Medication Reminders</h4>
              <p className="text-sm text-gray-600">Get reminded to take your medications</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.medicationReminders}
              onChange={(e) => handlePreferenceChange('medicationReminders', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Bell className="h-5 w-5 text-orange-600" />
            <div>
              <h4 className="font-medium text-gray-900">Meal Reminders</h4>
              <p className="text-sm text-gray-600">Get reminded about meal times</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.mealReminders}
              onChange={(e) => handlePreferenceChange('mealReminders', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  )

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy & Security</h3>
        <p className="text-sm text-gray-600">Control your privacy settings and data sharing preferences.</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-green-600" />
            <div>
              <h4 className="font-medium text-gray-900">Guardian Mode</h4>
              <p className="text-sm text-gray-600">Allow family members to view your health data</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.guardianMode}
              onChange={(e) => handlePreferenceChange('guardianMode', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Data Privacy</h4>
              <p className="text-sm text-blue-700">
                Your health data is encrypted and stored securely. We never share your personal information 
                with third parties without your explicit consent.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 mb-1">HIPAA Compliant</h4>
              <p className="text-sm text-green-700">
                MediMeal is fully compliant with HIPAA regulations and follows industry best practices 
                for healthcare data security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const handleBuyPlan = async (plan) => {
    try {
      setMessage('')
      setBillingLoading(true)

      await loadScript('https://checkout.razorpay.com/v1/checkout.js')
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load')
      }

      const orderRes = await axios.post('/user/payments/razorpay/order', {
        planId: plan.id,
      })

      const { keyId, order } = orderRes.data?.data || {}
      if (!keyId || !order?.id) {
        throw new Error('Failed to create Razorpay order')
      }

      const rzp = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'MediMeal',
        description: `${plan.name} plan`,
        order_id: order.id,
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        prefill: {
          name: displayName,
          email: user?.email || '',
          contact: user?.phone || user?.doctorInfo?.phoneNumber || '',
        },
        theme: {
          color: '#2563EB',
        },
        handler: async (response) => {
          try {
            await axios.post('/user/payments/razorpay/verify', {
              planId: plan.id,
              ...response,
            })
            setMessage('Payment successful! Your subscription is now active.')

            // Refresh payments list
            const paymentsRes = await axios.get('/user/payments')
            setPayments(paymentsRes.data?.data || [])
          } catch (e) {
            setMessage(e.response?.data?.message || 'Payment verification failed')
          } finally {
            setBillingLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setBillingLoading(false)
            setMessage('Payment cancelled/closed.')
          },
        },
      })

      rzp.on('payment.failed', function (resp) {
        const msg =
          resp?.error?.description ||
          resp?.error?.reason ||
          resp?.error?.code ||
          'Payment failed'
        setMessage(msg)
      })

      rzp.open()
    } catch (e) {
      setMessage(e.response?.data?.message || e.message || 'Failed to start payment')
      setBillingLoading(false)
    }
  }

  const renderBillingTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Billing</h3>
        <p className="text-sm text-gray-600">Upgrade your plan and view your payment history.</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          Note: Make sure your backend has <code className="px-1 py-0.5 bg-white rounded border">RAZORPAY_KEY_ID</code> and{' '}
          <code className="px-1 py-0.5 bg-white rounded border">RAZORPAY_KEY_SECRET</code> set in <code className="px-1 py-0.5 bg-white rounded border">medimeal-backend/.env</code>.
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Available Plans</h4>

        {billingLoading && plans.length === 0 ? (
          <div className="text-sm text-gray-600">Loading plans…</div>
        ) : plans.length === 0 ? (
          <div className="text-sm text-gray-600">
            No subscription plans found. (Create plans from the Admin “Subscription & Finance” section.)
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((p) => (
              <div key={p.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900">{p.name}</div>
                    <div className="text-sm text-gray-600">{p.description || '—'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {String(p.currency || '').toUpperCase() === 'INR' ? '₹' : ''}
                      {p.price}
                    </div>
                    <div className="text-xs text-gray-500">{p.billingPeriod}</div>
                  </div>
                </div>

                {Array.isArray(p.features) && p.features.length > 0 && (
                  <ul className="mt-3 text-sm text-gray-700 list-disc pl-5 space-y-1">
                    {p.features.slice(0, 6).map((f, idx) => (
                      <li key={`${p.id}-f-${idx}`}>{f}</li>
                    ))}
                  </ul>
                )}

                <div className="mt-4 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleBuyPlan(p)}
                    disabled={billingLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {billingLoading ? 'Please wait…' : 'Pay with Razorpay'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Recent Payments</h4>
        {billingLoading && payments.length === 0 ? (
          <div className="text-sm text-gray-600">Loading payments…</div>
        ) : payments.length === 0 ? (
          <div className="text-sm text-gray-600">No payments yet.</div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-700">Date</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-700">Amount</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-700">Provider</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-700">Status</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-700">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 10).map((pay) => (
                  <tr key={pay._id} className="border-t border-gray-200">
                    <td className="px-4 py-2 text-gray-700">
                      {pay.createdAt ? new Date(pay.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {String(pay.currency || '').toUpperCase() === 'INR' ? '₹' : ''}
                      {pay.amount}
                    </td>
                    <td className="px-4 py-2 text-gray-700">{pay.provider || '—'}</td>
                    <td className="px-4 py-2 text-gray-700">{pay.status || '—'}</td>
                    <td className="px-4 py-2 text-gray-700 font-mono text-xs">{pay.transactionId || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">
          Manage your account settings, preferences, and privacy options.
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center ${
          message.includes('successfully') 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.includes('successfully') ? (
            <CheckCircle className="h-4 w-4 mr-2" />
          ) : (
            <AlertCircle className="h-4 w-4 mr-2" />
          )}
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'billing' && renderBillingTab()}
          {activeTab === 'privacy' && renderPrivacyTab()}
        </div>
      </div>
    </div>
  )
}

export default Settings
