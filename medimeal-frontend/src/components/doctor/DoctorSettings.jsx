import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { 
  User, 
  Calendar,
  Bell, 
  Save, 
  AlertCircle,
  CheckCircle
} from 'lucide-react'

const DoctorSettings = () => {
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialization: user?.specialization || '',
  })

  const [availabilityData, setAvailabilityData] = useState({
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    workingDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    }
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    appointmentAlerts: true,
    patientAlerts: true,
    systemNotifications: true
  })

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'availability', name: 'Availability', icon: Calendar },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ]

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const result = await updateProfile(profileData)
      if (result.success) {
        setMessage('Profile updated successfully!')
        setMessageType('success')
      } else {
        setMessage(result.message || 'Failed to update profile')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Failed to update profile')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleAvailabilityUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await axios.put('/doctor/profile', {
        availability: availabilityData
      })
      if (response.data.success) {
        setMessage('Availability updated successfully!')
        setMessageType('success')
      } else {
        setMessage('Failed to update availability')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Failed to update availability')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationUpdate = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await axios.put('/doctor/profile', {
        notificationPreferences: notifications
      })
      if (response.data.success) {
        setMessage('Notification preferences updated successfully!')
        setMessageType('success')
      } else {
        setMessage('Failed to update notifications')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Failed to update notifications')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const ActiveTabIcon = tabs.find(t => t.id === activeTab)?.icon || User

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your profile, availability, and notifications</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center ${
          messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {messageType === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          <span>{message}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setMessage('')
                  }}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  value={profileData.specialization}
                  onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'availability' && (
            <form onSubmit={handleAvailabilityUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Working Hours
                </label>
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={availabilityData.workingHours.start}
                      onChange={(e) => setAvailabilityData({
                        ...availabilityData,
                        workingHours: { ...availabilityData.workingHours, start: e.target.value }
                      })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Time</label>
                    <input
                      type="time"
                      value={availabilityData.workingHours.end}
                      onChange={(e) => setAvailabilityData({
                        ...availabilityData,
                        workingHours: { ...availabilityData.workingHours, end: e.target.value }
                      })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Working Days
                </label>
                <div className="space-y-2">
                  {Object.keys(availabilityData.workingDays).map((day) => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={availabilityData.workingDays[day]}
                        onChange={(e) => setAvailabilityData({
                          ...availabilityData,
                          workingDays: { ...availabilityData.workingDays, [day]: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Availability'}
              </button>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications.emailNotifications}
                    onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">Email Notifications</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications.appointmentAlerts}
                    onChange={(e) => setNotifications({ ...notifications, appointmentAlerts: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">Appointment Alerts</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications.patientAlerts}
                    onChange={(e) => setNotifications({ ...notifications, patientAlerts: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">Patient Alerts</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications.systemNotifications}
                    onChange={(e) => setNotifications({ ...notifications, systemNotifications: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">System Notifications</span>
                </label>
              </div>

              <button
                onClick={handleNotificationUpdate}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorSettings
