import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { 
  Search,
  ChevronLeft
} from 'lucide-react'

// Import components
import DashboardOverview from '../components/doctor/DashboardOverview'
import Schedules from '../components/doctor/Schedules'
import Patients from '../components/doctor/Patients'
import Appointments from '../components/doctor/Appointments'
import Billing from '../components/doctor/Billing'
import Echarts from '../components/doctor/Echarts'
import MorrisCharts from '../components/doctor/MorrisCharts'
import HelpCenter from '../components/doctor/HelpCenter'

const DoctorDashboard = () => {
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview />
      case 'schedules':
        return <Schedules />
      case 'patients':
        return <Patients />
      case 'appointments':
        return <Appointments />
      case 'billing':
        return <Billing />
      case 'echarts':
        return <Echarts />
      case 'morris-charts':
        return <MorrisCharts />
      case 'help-center':
        return <HelpCenter />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Mediczen™</span>
            <ChevronLeft className="w-4 h-4 text-gray-400 ml-2" />
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">MAIN</div>
            
            <button 
              onClick={() => setActiveSection('dashboard')}
              className={`flex items-center px-3 py-2 rounded-lg w-full text-left ${
                activeSection === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-5 h-5 mr-3">📊</div>
              Dashboard
            </button>
            
            <button 
              onClick={() => setActiveSection('schedules')}
              className={`flex items-center px-3 py-2 rounded-lg w-full text-left ${
                activeSection === 'schedules' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-5 h-5 mr-3">📅</div>
              Schedules
            </button>
            
            <button 
              onClick={() => setActiveSection('patients')}
              className={`flex items-center px-3 py-2 rounded-lg w-full text-left ${
                activeSection === 'patients' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-5 h-5 mr-3">👥</div>
              Patients
            </button>
            
            <button 
              onClick={() => setActiveSection('appointments')}
              className={`flex items-center px-3 py-2 rounded-lg w-full text-left ${
                activeSection === 'appointments' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-5 h-5 mr-3">📋</div>
              Appointments
            </button>
            
            <button 
              onClick={() => setActiveSection('billing')}
              className={`flex items-center px-3 py-2 rounded-lg w-full text-left ${
                activeSection === 'billing' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-5 h-5 mr-3">💰</div>
              Billing
            </button>

            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 mt-8">DATA VISUALIZATION</div>
            
            <button 
              onClick={() => setActiveSection('echarts')}
              className={`flex items-center px-3 py-2 rounded-lg w-full text-left ${
                activeSection === 'echarts' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-5 h-5 mr-3">📈</div>
              Echarts
            </button>
            
            <button 
              onClick={() => setActiveSection('morris-charts')}
              className={`flex items-center px-3 py-2 rounded-lg w-full text-left ${
                activeSection === 'morris-charts' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-5 h-5 mr-3">📊</div>
              Morris Charts
            </button>

            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 mt-8">SUPPORT</div>
            
            <button 
              onClick={() => setActiveSection('help-center')}
              className={`flex items-center px-3 py-2 rounded-lg w-full text-left ${
                activeSection === 'help-center' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-5 h-5 mr-3">❓</div>
              Help Center
            </button>
            
            <button className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg w-full text-left">
              <div className="w-5 h-5 mr-3">⚙️</div>
              Settings
            </button>
            
            <button 
              onClick={logout}
              className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full text-left mt-2"
            >
              <div className="w-5 h-5 mr-3">🚪</div>
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {renderContent()}
      </div>
    </div>
  )
}

export default DoctorDashboard


