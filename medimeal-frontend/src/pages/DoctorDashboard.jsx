import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { 
  Search,
  Heart
} from 'lucide-react'

// Import components
import DashboardOverview from '../components/doctor/DashboardOverview'
import ClinicalAssistant from '../components/doctor/ClinicalAssistant'
import Schedules from '../components/doctor/Schedules'
import Patients from '../components/doctor/Patients'
import Appointments from '../components/doctor/Appointments'
// Clinical Intelligence Components
import ClinicalInsights from '../components/doctor/ClinicalInsights'
import PatientTimeline from '../components/doctor/PatientTimeline'
import AlertsPanel from '../components/doctor/AlertsPanel'
import DietPlanReview from '../components/doctor/DietPlanReview'
import DoctorSettings from '../components/doctor/DoctorSettings'

const DoctorDashboard = () => {
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview />
      case 'clinical-assistant':
        return <ClinicalAssistant />
      case 'schedules':
        return <Schedules />
      case 'patients':
        return <Patients />
      case 'appointments':
        return <Appointments />
      case 'clinical-insights':
        return <ClinicalInsights patientId={null} />
      case 'patient-timeline':
        return <PatientTimeline patientId={null} />
      case 'alerts':
        return <AlertsPanel />
      case 'diet-plans':
        return <DietPlanReview />
      case 'settings':
        return <DoctorSettings />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-56 bg-white shadow-lg z-20 overflow-y-auto">
        <div className="p-4">
          {/* Logo */}
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-2">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">MediMeal</span>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">MAIN</div>
            
            <button 
              onClick={() => setActiveSection('dashboard')}
              className={`flex items-center px-2 py-1.5 rounded-lg w-full text-left text-sm ${
                activeSection === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-4 h-4 mr-2 text-base">📊</div>
              Dashboard
            </button>
            
            <button 
              onClick={() => setActiveSection('clinical-assistant')}
              className={`flex items-center px-2 py-1.5 rounded-lg w-full text-left text-sm ${
                activeSection === 'clinical-assistant' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-4 h-4 mr-2 text-base">🤖</div>
              <span className="truncate">Clinical Assistant</span>
            </button>
            
            <button 
              onClick={() => setActiveSection('schedules')}
              className={`flex items-center px-2 py-1.5 rounded-lg w-full text-left text-sm ${
                activeSection === 'schedules' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-4 h-4 mr-2 text-base">📅</div>
              Schedules
            </button>
            
            <button 
              onClick={() => setActiveSection('patients')}
              className={`flex items-center px-2 py-1.5 rounded-lg w-full text-left text-sm ${
                activeSection === 'patients' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-4 h-4 mr-2 text-base">👥</div>
              Patients
            </button>
            
            <button 
              onClick={() => setActiveSection('appointments')}
              className={`flex items-center px-2 py-1.5 rounded-lg w-full text-left text-sm ${
                activeSection === 'appointments' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-4 h-4 mr-2 text-base">📋</div>
              Appointments
            </button>

            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-2">CLINICAL</div>
            
            <button 
              onClick={() => setActiveSection('clinical-insights')}
              className={`flex items-center px-2 py-1.5 rounded-lg w-full text-left text-sm ${
                activeSection === 'clinical-insights' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-4 h-4 mr-2 text-base">🧠</div>
              <span className="truncate">Insights</span>
            </button>
            
            <button 
              onClick={() => setActiveSection('patient-timeline')}
              className={`flex items-center px-2 py-1.5 rounded-lg w-full text-left text-sm ${
                activeSection === 'patient-timeline' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-4 h-4 mr-2 text-base">📅</div>
              <span className="truncate">Timeline</span>
            </button>
            
            <button 
              onClick={() => setActiveSection('alerts')}
              className={`flex items-center px-2 py-1.5 rounded-lg w-full text-left text-sm ${
                activeSection === 'alerts' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-4 h-4 mr-2 text-base">🔔</div>
              <span className="truncate">Alerts</span>
            </button>
            
            <button 
              onClick={() => setActiveSection('diet-plans')}
              className={`flex items-center px-2 py-1.5 rounded-lg w-full text-left text-sm ${
                activeSection === 'diet-plans' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-4 h-4 mr-2 text-base">🍽️</div>
              <span className="truncate">Diet Plans</span>
            </button>

            
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-2">SUPPORT</div>
            
            <button 
              onClick={() => setActiveSection('settings')}
              className={`flex items-center px-2 py-1.5 rounded-lg w-full text-left text-sm ${
                activeSection === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-4 h-4 mr-2 text-base">⚙️</div>
              Settings
            </button>
            
            <button 
              onClick={logout}
              className="flex items-center px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-lg w-full text-left text-sm mt-1"
            >
              <div className="w-4 h-4 mr-2 text-base">🚪</div>
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-56 p-8">
        {renderContent()}
      </div>
    </div>
  )
}

export default DoctorDashboard


