import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Menu, Bell, User, X } from 'lucide-react'
import { useSearch } from '../../contexts/SearchContext'
import { useNotifications } from '../../contexts/NotificationContext'
import ImagePlaceholder from '../ImagePlaceholder'

const TopNavbar = ({ currentPath }) => {
  const navigate = useNavigate()
  const { searchQuery, updateSearch, clearSearch } = useSearch()
  const { unreadCount, toggleNotificationPanel } = useNotifications()

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

  const handleSearchChange = (e) => {
    const query = e.target.value
    if (currentPath === '/dashboard') {
      // For dashboard, update search in real-time
      updateSearch(query)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const query = e.target.value
    if (currentPath === '/dashboard') {
      // Update URL with search query
      const newSearchParams = new URLSearchParams(window.location.search)
      if (query.trim()) {
        newSearchParams.set('search', query.trim())
      } else {
        newSearchParams.delete('search')
      }
      navigate(`/dashboard?${newSearchParams.toString()}`, { replace: true })
    } else if (query.trim()) {
      // Otherwise, navigate to meals page with search query
      navigate(`/meals?search=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleClearSearch = () => {
    clearSearch()
    // Also clear from URL
    if (currentPath === '/dashboard') {
      const newSearchParams = new URLSearchParams(window.location.search)
      newSearchParams.delete('search')
      navigate(`/dashboard?${newSearchParams.toString()}`, { replace: true })
    }
  }

  const handleAddMenu = () => {
    // Navigate to add custom meal page or open modal
    navigate('/meals?action=add')
  }

  const handleNotifications = () => {
    toggleNotificationPanel()
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
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search menu"
              value={searchQuery || ''}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm bg-gray-50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
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
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            )}
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
