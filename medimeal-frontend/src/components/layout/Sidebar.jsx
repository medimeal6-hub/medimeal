import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  LayoutDashboard, 
  Calendar,
  Utensils, 
  BookOpen,
  BarChart3,
  Dumbbell,
  Brain,
  Bell, 
  Settings, 
  LogOut,
  Heart,
  Sparkles,
  Upload,
  CalendarClock
} from 'lucide-react'

const Sidebar = () => {
  const { logout } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Appointments', href: '/dashboard/appointments', icon: CalendarClock },
    { name: 'Healthy Menu', href: '/meals', icon: Utensils },
    { name: 'Recommendations', href: '/dashboard/recommendations', icon: Sparkles },
    { name: 'Prescription OCR', href: '/dashboard/prescription', icon: Upload },
    { name: 'Meal Plan', href: '/meal-plan', icon: BookOpen },
    { name: 'Progress', href: '/progress', icon: BarChart3 },
    { name: 'Exercises', href: '/exercises', icon: Dumbbell },
    { name: 'Insights', href: '/insights', icon: Brain },
    { name: 'Alerts', href: '/alerts', icon: Bell },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Heart className="h-5 w-5 text-white fill-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">MediMeal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`h-5 w-5 mr-3 ${
                isActive ? 'text-green-600' : 'text-gray-400'
              }`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer with Logout */}
      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3 text-gray-400" />
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar