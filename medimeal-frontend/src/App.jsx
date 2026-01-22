import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminDashboard from './pages/AdminDashboard'
import Dashboard from './pages/Dashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import HealthyMenu from './pages/HealthyMenu'
import Calendar from './pages/Calendar'
import MealPlan from './pages/MealPlan'
import Progress from './pages/Progress'
import Exercises from './pages/Exercises'
import Insights from './pages/Insights'
import PrescriptionUpload from './pages/PrescriptionUpload'
import Meals from './pages/Meals'
import Recommendations from './pages/Recommendations'
import Alerts from './pages/Alerts'
import Settings from './pages/Settings'
import UserAppointments from './pages/UserAppointments'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import RedirectHandler from './components/RedirectHandler'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="relative min-h-screen">
          {/* Content */}
          <div className="relative">
            <RedirectHandler />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/doctor" 
                element={
                  <ProtectedRoute roles={["doctor"]}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              {/* Dashboard Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="recommendations" element={<Recommendations />} />
                <Route path="healthy-menu" element={<HealthyMenu />} />
                <Route path="prescription" element={<PrescriptionUpload />} />
                <Route path="meals" element={<Meals />} />
                <Route path="appointments" element={<UserAppointments />} />
                <Route path="alerts" element={<Alerts />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              {/* Calendar Route */}
              <Route 
                path="/calendar" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Calendar />} />
              </Route>
              
              {/* Meal Plan Route */}
              <Route 
                path="/meal-plan" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<MealPlan />} />
              </Route>
              
              {/* Progress Route */}
              <Route 
                path="/progress" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Progress />} />
              </Route>
              
              {/* Exercises Route */}
              <Route 
                path="/exercises" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Exercises />} />
              </Route>
              
              {/* Insights Route */}
              <Route 
                path="/insights" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Insights />} />
              </Route>
              
              {/* Direct Routes for Dashboard Pages */}
              <Route 
                path="/prescription" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<PrescriptionUpload />} />
              </Route>
              
              <Route 
                path="/meals" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Meals />} />
              </Route>
              
              <Route 
                path="/alerts" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Alerts />} />
              </Route>
              
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Settings />} />
              </Route>
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
