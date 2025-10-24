import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Menu, Bell, User } from 'lucide-react'
import ImagePlaceholder from '../ImagePlaceholder'

const TopNavbar = ({ currentPath }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard':
        return 'Dashboard'
      case '/prescription':
        return 'Prescription Upload'
      case '/meals':
        return 'Healthy Menu'
      case '/alerts':
        return 'Alerts'
      case '/settings':
        return 'Settings'
      default:
        return 'Dashboard'
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to meals page with search query
      navigate(`/meals?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleAddMenu = () => {
    // Navigate to add custom meal page or open modal
    navigate('/meals?action=add')
  }

  const handleNotifications = () => {
    // Navigate to alerts page
    navigate('/alerts')
  }

  const handleProfileClick = () => {
    // Navigate to settings page
    navigate('/settings')
  }

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {getPageTitle(currentPath)}
            </h1>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search menu"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm bg-gray-50"
            />
          </form>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Add Menu Button */}
          <button 
            onClick={handleAddMenu}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Add Menu
          </button>

          {/* Notifications */}
          <button 
            onClick={handleNotifications}
            className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User avatar */}
          <button 
            onClick={handleProfileClick}
            className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-1 transition-colors"
          >
            <ImagePlaceholder 
              width={32}
              height={32}
              text="👤"
              bgColor="#dbeafe"
              textColor="#2563eb"
              className="rounded-full"
            />
          </button>
        </div>
      </div>
    </header>
  )
}

export default TopNavbar
