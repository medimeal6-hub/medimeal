import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import PatientAssignmentModal from '../components/PatientAssignmentModal'
import { 
  LogOut, 
  Search, 
  Bell, 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Plus,
  Filter,
  RefreshCw,
  TrendingUp,
  Activity,
  MessageSquare,
  Utensils,
  BookOpen,
  BarChart3,
  Dumbbell,
  Heart,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  FileText,
  Zap,
  ClipboardList,
  Camera,
  PieChart,
  Settings,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  Target,
  TrendingDown,
  Users2,
  Pill,
  Apple,
  AlertOctagon,
  Info,
  Download,
  Upload,
  Star,
  Award,
  Calendar as CalendarIcon,
  Clock,
  Clock as ClockIcon,
  MapPin,
  Phone,
  Mail,
  Globe,
  Lock,
  Unlock,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  User,
  CreditCard,
  GraduationCap,
  Building2,
  Languages,
  DollarSign,
  Briefcase,
  CheckCircle2,
  EyeOff,
  Copy
} from 'lucide-react'
import { Brain } from 'lucide-react'
import KnnDemo from '../components/ml/KnnDemo'
import NaiveBayesDemo from '../components/ml/NaiveBayesDemo'
import DecisionTreeDemo from '../components/ml/DecisionTreeDemo'
import SvmDemo from '../components/ml/SvmDemo'
import NeuralNetDemo from '../components/ml/NeuralNetDemo'
// Enterprise-level Admin Components
import SystemAnalytics from '../components/admin/SystemAnalytics'
import SubscriptionFinance from '../components/admin/SubscriptionFinance'
import SecurityCompliance from '../components/admin/SecurityCompliance'

const AdminDashboard = () => {
  const { logout, user, token, isAuthenticated } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [doctorForm, setDoctorForm] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    specialization: '',
    phoneNumber: '',
    licenseNumber: '',
    hospitalAffiliation: '',
    yearsOfExperience: '',
    bio: '',
    languages: [],
    consultationFee: '',
    availability: 'full-time',
    emergencyContact: '',
    emergencyPhone: ''
  })
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false)
  const [isPatientAssignmentOpen, setIsPatientAssignmentOpen] = useState(false)
  const [patientAssignments, setPatientAssignments] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [doctorFormErrors, setDoctorFormErrors] = useState({})
  const [isSubmittingDoctor, setIsSubmittingDoctor] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [generatedCredentials, setGeneratedCredentials] = useState(null)
  const [copySuccess, setCopySuccess] = useState('')
  const [isViewDoctorOpen, setIsViewDoctorOpen] = useState(false)
  const [isEditDoctorOpen, setIsEditDoctorOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)

  // Ensure axios defaults are set with the authorization header
  useEffect(() => {
    console.log('=== AdminDashboard Mount ===')
    console.log('User:', user)
    console.log('Token:', token ? `${token.substring(0, 20)}...` : 'None')
    console.log('IsAuthenticated:', isAuthenticated)
    console.log('Axios Authorization header:', axios.defaults.headers.common['Authorization'])
    
    // Set axios defaults immediately when component mounts
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      console.log('✅ Axios Authorization header set in AdminDashboard')
    } else {
      console.warn('⚠️ No token available in AdminDashboard')
    }
  }, [token])

  const [activeSection, setActiveSection] = useState('dashboard')
  const [prescriptions, setPrescriptions] = useState([])
  const [meals, setMeals] = useState([])
  const [conflicts, setConflicts] = useState([])
  const [alerts, setAlerts] = useState([])
  const [guardians, setGuardians] = useState([])
  const [doctors, setDoctors] = useState([])
  const [reports, setReports] = useState([])
  const [mythBusters, setMythBusters] = useState([])
  const [analytics, setAnalytics] = useState({
    dietCompliance: 85,
    conflictTrends: [12, 8, 15, 10, 7, 9, 11],
    userEngagement: [78, 82, 85, 88, 90, 87, 89]
  })
  const [activeMlTab, setActiveMlTab] = useState('knn')
  // Enterprise compliance & system analytics state
  const [complianceOverview, setComplianceOverview] = useState(null)
  const [complianceViolations, setComplianceViolations] = useState([])
  const [systemMetrics, setSystemMetrics] = useState([])
  const [complianceLoading, setComplianceLoading] = useState(false)
  // Staff verification & credentialing
  const [pendingStaff, setPendingStaff] = useState([])
  const [staffLoading, setStaffLoading] = useState(false)
  // AI Food & Nutrition DB (admin view)
  const [foodItems, setFoodItems] = useState([])
  const [foodLoading, setFoodLoading] = useState(false)
  // Subscriptions & revenue
  const [subscriptions, setSubscriptions] = useState([])
  const [revenueStats, setRevenueStats] = useState(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)
  // Security & audit
  const [auditLogs, setAuditLogs] = useState([])
  const [securityAlerts, setSecurityAlerts] = useState([])
  const [securityLoading, setSecurityLoading] = useState(false)

  const TabButton = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
        active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    prescriptions: 0,
    conflicts: 0,
    meals: 0,
    activeDoctors: 0
  })

  // Sample data for demonstration
  const sampleData = {
    prescriptions: [
      {
        id: 1,
        patientName: 'John Smith',
        doctorName: 'Dr. Sarah Johnson',
        medicines: ['Metformin 500mg', 'Warfarin 5mg', 'Aspirin 81mg'],
        uploadDate: '2024-01-15',
        status: 'verified',
        conflicts: ['Warfarin + Aspirin: High bleeding risk']
      },
      {
        id: 2,
        patientName: 'Emily Davis',
        doctorName: 'Dr. Michael Brown',
        medicines: ['Lisinopril 10mg', 'Metformin 1000mg'],
        uploadDate: '2024-01-14',
        status: 'pending',
        conflicts: []
      }
    ],
    meals: [
      {
        id: 1,
        name: 'Grilled Chicken Salad',
        calories: 320,
        protein: 28,
        carbs: 12,
        fats: 18,
        image: '/images/meals/meal1.png',
        status: 'safe',
        addedBy: 'John Smith',
        addedDate: '2024-01-15'
      },
      {
        id: 2,
        name: 'Spicy Curry Rice',
        calories: 450,
        protein: 15,
        carbs: 65,
        fats: 12,
        image: '/images/meals/meal2.png',
        status: 'moderate_risk',
        addedBy: 'Emily Davis',
        addedDate: '2024-01-14'
      },
      {
        id: 3,
        name: 'Quinoa Buddha Bowl',
        calories: 380,
        protein: 18,
        carbs: 45,
        fats: 14,
        image: '/images/meals/meal3.png',
        status: 'safe',
        addedBy: 'Mike Wilson',
        addedDate: '2024-01-13'
      }
    ],
    conflicts: [
      {
        id: 1,
        medicines: ['Warfarin', 'Aspirin'],
        riskLevel: 'high',
        description: 'Combined use increases bleeding risk significantly',
        severity: 'Critical',
        recommendation: 'Consult healthcare provider immediately'
      },
      {
        id: 2,
        medicines: ['Metformin', 'Alcohol'],
        riskLevel: 'high',
        description: 'Alcohol can increase risk of lactic acidosis',
        severity: 'High',
        recommendation: 'Avoid alcohol consumption'
      },
      {
        id: 3,
        medicines: ['Calcium', 'Iron'],
        riskLevel: 'moderate',
        description: 'Calcium can reduce iron absorption',
        severity: 'Moderate',
        recommendation: 'Take 2 hours apart'
      }
    ],
    alerts: [
      {
        id: 1,
        type: 'critical',
        title: 'Critical Conflict Detected',
        message: 'Warfarin + Aspirin interaction detected',
        timestamp: '2 minutes ago',
        patient: 'John Smith'
      },
      {
        id: 2,
        type: 'warning',
        title: 'New Prescription Uploaded',
        message: 'Dr. Smith - Patient ID: 12345',
        timestamp: '15 minutes ago',
        patient: 'Emily Davis'
      },
      {
        id: 3,
        type: 'info',
        title: 'Meal Analysis Complete',
        message: 'Grilled Chicken Salad - Safe',
        timestamp: '1 hour ago',
        patient: 'John Smith'
      }
    ],
    guardians: [
      {
        id: 1,
        name: 'Mary Johnson',
        email: 'mary.johnson@email.com',
        relationship: 'Mother',
        wardName: 'John Smith',
        status: 'active',
        permissions: ['view_medications', 'receive_alerts']
      },
      {
        id: 2,
        name: 'Robert Davis',
        email: 'robert.davis@email.com',
        relationship: 'Son',
        wardName: 'Emily Davis',
        status: 'active',
        permissions: ['full_access']
      }
    ],
    doctors: [
      {
        id: 1,
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        specialization: 'Cardiology',
        status: 'active',
        patientsCount: 45,
        lastActive: '2 hours ago'
      },
      {
        id: 2,
        name: 'Dr. Michael Brown',
        email: 'michael.brown@hospital.com',
        specialization: 'Endocrinology',
        status: 'active',
        patientsCount: 32,
        lastActive: '1 hour ago'
      }
    ],
    mythBusters: [
      {
        id: 1,
        myth: 'Eating grapefruit with medications is always safe',
        fact: 'Grapefruit can interact with many medications, affecting their effectiveness',
        status: 'verified',
        category: 'Food-Drug Interactions'
      },
      {
        id: 2,
        myth: 'Natural supplements are always safe with prescription drugs',
        fact: 'Many supplements can interact with medications and cause serious side effects',
        status: 'verified',
        category: 'Supplements'
      }
    ],
    reports: [
      {
        id: 1,
        title: 'Monthly Conflict Report',
        type: 'conflicts',
        generatedDate: '2024-10-27',
        period: 'December 2023',
        status: 'completed'
      },
      {
        id: 2,
        title: 'User Engagement Analytics',
        type: 'analytics',
        generatedDate: '2024-10-26',
        period: 'Q4 2023',
        status: 'completed'
      }
    ]
  }

  // Data fetching functions - ensure axios header is set before making requests
  const fetchUsers = async () => {
    try {
      // Double-check that axios header is set
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        console.log('🔧 Axios header set in fetchUsers')
      }
      
      setLoading(true)
      const res = await axios.get('/admin/users')
      setUsers(res.data.data || [])
    } catch (e) {
      console.error('❌ Failed to load users:', e.response?.status, e.message)
      setError('Failed to load users')
      // Use sample data if API fails
      setUsers([
        {
          _id: '1',
          fullName: 'John Smith',
          email: 'john.smith@email.com',
          role: 'user',
          isActive: true,
          specialization: ''
        },
        {
          _id: '2',
          fullName: 'Emily Davis',
          email: 'emily.davis@email.com',
          role: 'user',
          isActive: true,
          specialization: ''
        },
        {
          _id: '3',
          fullName: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@hospital.com',
          role: 'doctor',
          isActive: true,
          specialization: 'Cardiology'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientAssignments = async () => {
    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      
      setLoading(true)
      const res = await axios.get('/admin/patient-assignments')
      setPatientAssignments(res.data.data || [])
    } catch (e) {
      console.error('❌ Failed to load patient assignments:', e.response?.status, e.message)
      setError('Failed to load patient assignments')
      // Use sample data if API fails
      setPatientAssignments([
        {
          id: '1',
          patientName: 'John Doe',
          doctorName: 'Dr. Jane Smith',
          wardNumber: '#123456',
          priority: 'high',
          status: 'active',
          startDate: new Date().toISOString(),
          diagnosis: 'Chest pain, possible cardiac issue'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Apply the same fix to all other data fetching functions
  const fetchPrescriptions = async () => {
    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      setLoading(true)
      const res = await axios.get('/admin/prescriptions')
      setPrescriptions(res.data.data || [])
    } catch (e) {
      setPrescriptions(sampleData.prescriptions)
    } finally {
      setLoading(false)
    }
  }

  const fetchMeals = async () => {
    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      const res = await axios.get('/admin/meals')
      setMeals(res.data.data || [])
    } catch (e) {
      setMeals(sampleData.meals)
    }
  }

  const fetchConflicts = async () => {
    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      const res = await axios.get('/admin/conflicts')
      setConflicts(res.data.data || [])
    } catch (e) {
      setConflicts(sampleData.conflicts)
    }
  }

  const fetchAlerts = async () => {
    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      const res = await axios.get('/admin/alerts')
      setAlerts(res.data.data || [])
    } catch (e) {
      setAlerts(sampleData.alerts)
    }
  }

  const fetchGuardians = async () => {
    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      const res = await axios.get('/admin/guardians')
      setGuardians(res.data.data || [])
    } catch (e) {
      setGuardians(sampleData.guardians)
    }
  }

  const fetchDoctors = async () => {
    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      const res = await axios.get('/admin/doctors')
      setDoctors(res.data.data || [])
    } catch (e) {
      setDoctors(sampleData.doctors)
    }
  }

  // AI Clinical Compliance & System Analytics
  const fetchComplianceData = async () => {
    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }

      setComplianceLoading(true)

      const [overviewRes, violationsRes, metricsRes] = await Promise.all([
        axios.get('/admin/compliance/overview'),
        axios.get('/admin/compliance/violations', { params: { limit: 50 } }),
        axios.get('/admin/analytics/system-metrics', { params: { limit: 50 } })
      ])

      setComplianceOverview(overviewRes.data.data || null)
      setComplianceViolations(violationsRes.data.data || [])
      setSystemMetrics(metricsRes.data.data || [])
    } catch (e) {
      console.error('❌ Failed to load compliance analytics:', e.response?.status, e.message)
      setError('Failed to load compliance analytics')
    } finally {
      setComplianceLoading(false)
    }
  }

  const fetchReports = async () => {
    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      setLoading(true)
      const res = await axios.get('/admin/reports')
      setReports(res.data.data || [])
    } catch (e) {
      setReports(sampleData.reports)
    } finally {
      setLoading(false)
    }
  }

  const fetchMythBusters = async () => {
    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      setLoading(true)
      const res = await axios.get('/admin/myth-busters')
      setMythBusters(res.data.data || [])
    } catch (e) {
      setMythBusters(sampleData.mythBusters)
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardStats = async () => {
    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      const res = await axios.get('/admin/dashboard-stats')
      setDashboardStats(res.data.data || {})
    } catch (e) {
      setDashboardStats({
        totalUsers: users.length,
        prescriptions: sampleData.prescriptions.length,
        conflicts: sampleData.conflicts.length,
        meals: sampleData.meals.length,
        activeDoctors: sampleData.doctors.length
      })
    }
  }

  // Staff Verification & Credentialing
  const fetchPendingStaff = async () => {
    // Mock data for demonstration
    const mockPendingStaff = [
      {
        _id: '1',
        userId: {
          firstName: 'Dr. Priya',
          lastName: 'Sharma',
          email: 'priya.sharma@medimeal.com'
        },
        role: 'doctor',
        licenseNumber: 'MD-2024-001234',
        expiryDate: new Date('2025-12-31'),
        verificationStatus: 'pending',
        documentUrl: 'https://example.com/license1.pdf',
        submittedAt: new Date('2024-01-15')
      },
      {
        _id: '2',
        userId: {
          firstName: 'Dr. Rajesh',
          lastName: 'Kumar',
          email: 'rajesh.kumar@medimeal.com'
        },
        role: 'doctor',
        licenseNumber: 'MD-2024-002456',
        expiryDate: new Date('2026-03-15'),
        verificationStatus: 'pending',
        documentUrl: 'https://example.com/license2.pdf',
        submittedAt: new Date('2024-01-18')
      },
      {
        _id: '3',
        userId: {
          firstName: 'Anita',
          lastName: 'Patel',
          email: 'anita.patel@medimeal.com'
        },
        role: 'dietitian',
        licenseNumber: 'RD-2024-000789',
        expiryDate: new Date('2025-08-20'),
        verificationStatus: 'pending',
        documentUrl: 'https://example.com/license3.pdf',
        submittedAt: new Date('2024-01-20')
      },
      {
        _id: '4',
        userId: {
          firstName: 'Dr. Vikram',
          lastName: 'Singh',
          email: 'vikram.singh@medimeal.com'
        },
        role: 'doctor',
        licenseNumber: 'MD-2024-003567',
        expiryDate: new Date('2026-06-30'),
        verificationStatus: 'pending',
        documentUrl: 'https://example.com/license4.pdf',
        submittedAt: new Date('2024-01-22')
      },
      {
        _id: '5',
        userId: {
          firstName: 'Meera',
          lastName: 'Desai',
          email: 'meera.desai@medimeal.com'
        },
        role: 'dietitian',
        licenseNumber: 'RD-2024-001234',
        expiryDate: new Date('2025-11-10'),
        verificationStatus: 'pending',
        documentUrl: 'https://example.com/license5.pdf',
        submittedAt: new Date('2024-01-25')
      },
      {
        _id: '6',
        userId: {
          firstName: 'Dr. Arjun',
          lastName: 'Menon',
          email: 'arjun.menon@medimeal.com'
        },
        role: 'doctor',
        licenseNumber: 'MD-2024-004890',
        expiryDate: new Date('2027-01-15'),
        verificationStatus: 'pending',
        documentUrl: 'https://example.com/license6.pdf',
        submittedAt: new Date('2024-01-28')
      }
    ]

    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      setStaffLoading(true)
      const res = await axios.get('/api/admin/staff/pending')
      // Use API data if available, otherwise use mock data
      const apiData = res.data.data || []
      setPendingStaff(apiData.length > 0 ? apiData : mockPendingStaff)
    } catch (e) {
      console.error('❌ Failed to load pending staff:', e.response?.status, e.message)
      // Use mock data when API fails
      setPendingStaff(mockPendingStaff)
    } finally {
      setStaffLoading(false)
    }
  }

  const handleVerifyStaff = async (record) => {
    try {
      await axios.post('/admin/staff/verify', {
        userId: record.userId._id,
        role: record.role,
        licenseNumber: record.licenseNumber || record.userId?.doctorInfo?.licenseNumber,
        documentUrl: record.documentUrl,
        expiryDate: record.expiryDate,
        notes: record.notes
      })
      await fetchPendingStaff()
    } catch (e) {
      console.error('❌ Verify staff failed:', e.response?.status, e.message)
      setError('Failed to verify staff')
    }
  }

  const handleRejectStaff = async (record, reason = 'Rejected by admin') => {
    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      const userId = record?.userId?._id || record?._id
      await axios.post('/api/admin/staff/reject', {
        userId,
        reason
      })
      setError('')
      await fetchPendingStaff()
    } catch (e) {
      console.error('❌ Reject staff failed:', e.response?.status, e.message)
      setError('Failed to reject staff')
    }
  }

  // AI Food & Nutrition DB
  const fetchFoodItems = async () => {
    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      setFoodLoading(true)
      const res = await axios.get('/admin/food')
      setFoodItems(res.data.data || [])
    } catch (e) {
      console.error('❌ Failed to load food items:', e.response?.status, e.message)
      setError('Failed to load food items')
    } finally {
      setFoodLoading(false)
    }
  }

  // Subscriptions & revenue
  const fetchSubscriptionsAndRevenue = async () => {
    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      setSubscriptionLoading(true)
      const [subsRes, revRes] = await Promise.all([
        axios.get('/admin/subscriptions'),
        axios.get('/admin/revenue')
      ])
      setSubscriptions(subsRes.data.data || [])
      setRevenueStats(revRes.data.data || null)
    } catch (e) {
      console.error('❌ Failed to load subscription analytics:', e.response?.status, e.message)
      setError('Failed to load subscription analytics')
    } finally {
      setSubscriptionLoading(false)
    }
  }

  // Security & audit
  const fetchSecurityData = async () => {
    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      setSecurityLoading(true)
      const [auditRes, alertsRes] = await Promise.all([
        axios.get('/admin/audit-logs', { params: { limit: 100 } }),
        axios.get('/admin/security-alerts')
      ])
      setAuditLogs(auditRes.data.data || [])
      setSecurityAlerts(alertsRes.data.data || [])
    } catch (e) {
      console.error('❌ Failed to load security analytics:', e.response?.status, e.message)
      setError('Failed to load security analytics')
    } finally {
      setSecurityLoading(false)
    }
  }

  // Load data based on active section
  useEffect(() => {
    fetchUsers()
    fetchDashboardStats()
  }, [])

  useEffect(() => {
    switch (activeSection) {
      case 'patient-assignments':
        fetchPatientAssignments()
        break
      case 'compliance':
        fetchComplianceData()
        break
      case 'staff':
        fetchPendingStaff()
        break
      case 'food-admin':
        fetchFoodItems()
        break
      case 'subscriptions':
        fetchSubscriptionsAndRevenue()
        break
      case 'security':
        fetchSecurityData()
        break
      case 'system-analytics':
      case 'subscription-finance':
      case 'security-compliance':
        // These components fetch their own data
        break
      case 'prescriptions':
        fetchPrescriptions()
        break
      case 'meals':
        fetchMeals()
        break
      case 'conflicts':
        fetchConflicts()
        break
      case 'alerts':
        fetchAlerts()
        break
      case 'guardians':
        fetchGuardians()
        break
      case 'doctors':
        fetchDoctors()
        break
      case 'reports':
        fetchReports()
        break
      case 'mythbuster':
        fetchMythBusters()
        break
      default:
        break
    }
  }, [activeSection])

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Exclude admins from the list
      if (u.role === 'admin') return false
      const matchesSearch = `${u.fullName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
      const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter
      const matchesStatus = statusFilter === 'all' ? true : (!!u.isActive === (statusFilter === 'active'))
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, search, roleFilter, statusFilter])

  const stats = useMemo(() => {
    const total = users.length
    const doctors = users.filter(u => u.role === 'doctor').length
    const admins = users.filter(u => u.role === 'admin').length
    const active = users.filter(u => u.isActive).length
    return { total, doctors, admins, active }
  }, [users])

  // Comprehensive validation functions
  const validateField = (name, value) => {
    const errors = { ...doctorFormErrors }
    
    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          errors.firstName = 'First name is required'
        } else if (!/^[A-Za-z\s]+$/.test(value)) {
          errors.firstName = 'First name must contain only letters'
        } else if (value.trim().length < 2) {
          errors.firstName = 'First name must be at least 2 characters'
        } else {
          delete errors.firstName
        }
        break
        
      case 'lastName':
        if (!value.trim()) {
          errors.lastName = 'Last name is required'
        } else if (!/^[A-Za-z\s]+$/.test(value)) {
          errors.lastName = 'Last name must contain only letters'
        } else if (value.trim().length < 2) {
          errors.lastName = 'Last name must be at least 2 characters'
        } else {
          delete errors.lastName
        }
        break
        
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address'
        } else if (!/\.(org|in|com)$/.test(value.toLowerCase())) {
          errors.email = 'Email must end with .org, .in, or .com'
        } else {
          delete errors.email
        }
        break
        
      case 'password':
        if (!value) {
          errors.password = 'Password is required'
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(value)) {
          errors.password = 'Password must be at least 6 characters with uppercase, lowercase, and number'
        } else {
          delete errors.password
        }
        break
        
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Please confirm your password'
        } else if (value !== doctorForm.password) {
          errors.confirmPassword = 'Passwords do not match'
        } else {
          delete errors.confirmPassword
        }
        break
        
      case 'phoneNumber':
        if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
          errors.phoneNumber = 'Please enter a valid phone number'
        } else {
          delete errors.phoneNumber
        }
        break
        
      case 'licenseNumber':
        if (!value.trim()) {
          errors.licenseNumber = 'Medical license number is required'
        } else if (value.trim().length < 5) {
          errors.licenseNumber = 'License number must be at least 5 characters'
        } else {
          delete errors.licenseNumber
        }
        break
        
      case 'yearsOfExperience':
        if (value && (isNaN(value) || parseInt(value) < 0 || parseInt(value) > 50)) {
          errors.yearsOfExperience = 'Please enter a valid number of years (0-50)'
        } else {
          delete errors.yearsOfExperience
        }
        break
        
      case 'consultationFee':
        if (value && (isNaN(value) || parseFloat(value) < 0)) {
          errors.consultationFee = 'Please enter a valid consultation fee'
        } else {
          delete errors.consultationFee
        }
        break
    }
    
    setDoctorFormErrors(errors)
  }

  const validateStep = (step) => {
    console.log('Validating step:', step)
    console.log('Current form data:', doctorForm)
    const errors = {}
    
    switch (step) {
      case 1: // Personal Information
        // Validate firstName
        if (!doctorForm.firstName.trim()) {
          errors.firstName = 'First name is required'
        } else if (!/^[A-Za-z\s]+$/.test(doctorForm.firstName)) {
          errors.firstName = 'First name must contain only letters'
        } else if (doctorForm.firstName.trim().length < 2) {
          errors.firstName = 'First name must be at least 2 characters'
        }
        
        // Validate lastName
        if (!doctorForm.lastName.trim()) {
          errors.lastName = 'Last name is required'
        } else if (!/^[A-Za-z\s]+$/.test(doctorForm.lastName)) {
          errors.lastName = 'Last name must contain only letters'
        } else if (doctorForm.lastName.trim().length < 2) {
          errors.lastName = 'Last name must be at least 2 characters'
        }
        
        // Validate email
        if (!doctorForm.email.trim()) {
          errors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doctorForm.email)) {
          errors.email = 'Please enter a valid email address'
        } else if (!/\.(org|in|com)$/.test(doctorForm.email.toLowerCase())) {
          errors.email = 'Email must end with .org, .in, or .com'
        }
        
        // Validate password
        if (!doctorForm.password) {
          errors.password = 'Password is required'
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(doctorForm.password)) {
          errors.password = 'Password must be at least 6 characters with uppercase, lowercase, and number'
        }
        
        // Validate confirmPassword
        if (!doctorForm.confirmPassword) {
          errors.confirmPassword = 'Please confirm your password'
        } else if (doctorForm.confirmPassword !== doctorForm.password) {
          errors.confirmPassword = 'Passwords do not match'
        }
        break
        
      case 2: // Professional Information
        // Validate specialization
        if (!doctorForm.specialization) {
          errors.specialization = 'Medical specialization is required'
        }
        
        // Validate licenseNumber
        if (!doctorForm.licenseNumber.trim()) {
          errors.licenseNumber = 'Medical license number is required'
        } else if (doctorForm.licenseNumber.trim().length < 5) {
          errors.licenseNumber = 'License number must be at least 5 characters'
        }
        
        // Validate yearsOfExperience
        if (doctorForm.yearsOfExperience && (isNaN(doctorForm.yearsOfExperience) || parseInt(doctorForm.yearsOfExperience) < 0 || parseInt(doctorForm.yearsOfExperience) > 50)) {
          errors.yearsOfExperience = 'Please enter a valid number of years (0-50)'
        }
        break
        
      case 3: // Contact & Additional Info
        // Validate phoneNumber (optional but if provided, must be valid)
        if (doctorForm.phoneNumber && !/^[\+]?[1-9][\d]{0,15}$/.test(doctorForm.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
          errors.phoneNumber = 'Please enter a valid phone number'
        }
        
        // hospitalAffiliation is optional, no validation needed
        break
    }
    
    // Update the errors state
    setDoctorFormErrors(errors)
    
    console.log('Validation errors for step', step, ':', errors)
    console.log('Is step valid:', Object.keys(errors).length === 0)
    
    // Return true if no errors
    return Object.keys(errors).length === 0
  }

  const handleDoctorFormChange = (field, value) => {
    setDoctorForm(prev => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  const handleDoctorSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmittingDoctor(true)

    // Final validation
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      setIsSubmittingDoctor(false)
      return
    }

    try {
      const submitData = {
        firstName: doctorForm.firstName,
        lastName: doctorForm.lastName,
        email: doctorForm.email,
        password: doctorForm.password,
        specialization: doctorForm.specialization,
        // Additional fields for future backend enhancement
        phoneNumber: doctorForm.phoneNumber,
        licenseNumber: doctorForm.licenseNumber,
        hospitalAffiliation: doctorForm.hospitalAffiliation,
        yearsOfExperience: doctorForm.yearsOfExperience ? parseInt(doctorForm.yearsOfExperience) : undefined,
        bio: doctorForm.bio,
        languages: doctorForm.languages,
        consultationFee: doctorForm.consultationFee ? parseFloat(doctorForm.consultationFee) : undefined,
        availability: doctorForm.availability,
        emergencyContact: doctorForm.emergencyContact,
        emergencyPhone: doctorForm.emergencyPhone
      }
      
      const response = await axios.post('/admin/doctors', submitData)
      
      // Store credentials for display
      setGeneratedCredentials({
        email: doctorForm.email,
        password: doctorForm.password,
        doctorName: `${doctorForm.firstName} ${doctorForm.lastName}`,
        specialization: doctorForm.specialization,
        doctorId: response.data.data.user._id
      })
      
      // Reset form and close modal
      resetDoctorForm()
      setIsAddDoctorOpen(false)
      fetchUsers()
      
      // Show credentials modal
      setShowCredentialsModal(true)
      setError('') // Clear any previous errors
      
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to add doctor')
    } finally {
      setIsSubmittingDoctor(false)
    }
  }

  // Specialization options
  const specializationOptions = [
    'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 'Hematology',
    'Infectious Disease', 'Nephrology', 'Neurology', 'Oncology', 'Orthopedics',
    'Pediatrics', 'Psychiatry', 'Pulmonology', 'Radiology', 'Rheumatology',
    'Urology', 'Anesthesiology', 'Emergency Medicine', 'Family Medicine',
    'Internal Medicine', 'Obstetrics & Gynecology', 'Ophthalmology', 'Pathology',
    'Physical Medicine', 'Preventive Medicine', 'Surgery', 'Dietician', 'Nutritionist'
  ]

  const languageOptions = [
    'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati',
    'Kannada', 'Malayalam', 'Punjabi', 'Urdu', 'Spanish', 'French', 'German',
    'Chinese', 'Japanese', 'Arabic'
  ]

  const availabilityOptions = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'consultant', label: 'Consultant' },
    { value: 'visiting', label: 'Visiting' }
  ]

  const nextStep = () => {
    console.log('Next step clicked, current step:', currentStep)
    console.log('Form data:', doctorForm)
    console.log('Current errors:', doctorFormErrors)
    
    const isValid = validateStep(currentStep)
    console.log('Step validation result:', isValid)
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
      console.log('Moving to next step')
    } else {
      console.log('Validation failed, staying on current step')
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  // Copy to clipboard with success feedback
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(`${type} copied!`)
      setTimeout(() => setCopySuccess(''), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
      setCopySuccess('Copy failed')
      setTimeout(() => setCopySuccess(''), 2000)
    }
  }

  // Generate secure password for doctor
  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*'
    
    let password = ''
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += symbols[Math.floor(Math.random() * symbols.length)]
    
    // Fill the rest randomly
    const allChars = uppercase + lowercase + numbers + symbols
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  const resetDoctorForm = () => {
    setDoctorForm({ 
      firstName: '', 
      lastName: '', 
      email: '', 
      password: '', 
      confirmPassword: '',
      specialization: '',
      phoneNumber: '',
      licenseNumber: '',
      hospitalAffiliation: '',
      yearsOfExperience: '',
      bio: '',
      languages: [],
      consultationFee: '',
      availability: 'full-time',
      emergencyContact: '',
      emergencyPhone: ''
    })
    setDoctorFormErrors({})
    setCurrentStep(1)
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  // Reset form when modal opens
  useEffect(() => {
    if (isAddDoctorOpen) {
      resetDoctorForm()
    }
  }, [isAddDoctorOpen])

  const updateRole = async (userId, role) => {
    try {
      const confirm = window.confirm('Change user role to ' + role + '?')
      if (!confirm) return
      await axios.patch(`/api/admin/users/${userId}/role`, { role })
      fetchUsers()
    } catch (e) {
      setError('Failed to update role')
    }
  }

  const updateStatus = async (userId, isActive) => {
    try {
      const confirm = window.confirm((isActive ? 'Activate' : 'Deactivate') + ' this user?')
      if (!confirm) return
      await axios.patch(`/api/admin/users/${userId}/status`, { isActive })
      fetchUsers()
    } catch (e) {
      setError('Failed to update status')
    }
  }

  const deleteUser = async (userId) => {
    try {
      const confirm = window.confirm('Are you sure you want to permanently remove this user? This action cannot be undone.')
      if (!confirm) return
      
      setLoading(true)
      await axios.delete(`/api/users/${userId}`)
      await fetchUsers()
      // Optional: Add success toast/alert if needed, but fetchUsers updating the list is usually enough feedback
    } catch (e) {
      console.error('Delete user error:', e)
      setError('Failed to delete user')
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-[260px]'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col flex-shrink-0 overflow-y-auto`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span className="text-base font-semibold text-gray-900">MediMeal</span>
                <p className="text-[10px] text-gray-500">AI Platform</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          <div className="space-y-1">
            <button 
              onClick={() => setActiveSection('dashboard')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeSection === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              {!sidebarCollapsed && <span className="font-medium text-xs">Dashboard</span>}
            </button>
            
            <button 
              onClick={() => setActiveSection('compliance')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeSection === 'compliance' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-xs">Compliance & Analytics</span>}
            </button>
            
            <button 
              onClick={() => setActiveSection('users')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeSection === 'users' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-xs">Users</span>}
            </button>
            
            <button 
              onClick={() => setActiveSection('staff')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeSection === 'staff' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-xs">Staff Verification</span>}
            </button>
            
            <button 
              onClick={() => setActiveSection('patient-assignments')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeSection === 'patient-assignments' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-xs">Patient Assignments</span>}
            </button>
            
            {/* Patient Assignment Actions */}
            {!sidebarCollapsed && activeSection === 'patient-assignments' && (
              <div className="ml-3 space-y-1.5">
                <button
                  onClick={() => setIsPatientAssignmentOpen(true)}
                  className="flex items-center space-x-2 w-full px-2 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs"
                >
                  <UserPlus className="w-3 h-3" />
                  <span className="text-[11px]">Assign Patient</span>
                </button>
                <button
                  onClick={() => fetchPatientAssignments()}
                  className="flex items-center space-x-2 w-full px-2 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span className="text-[11px]">Refresh Assignments</span>
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setActiveSection('guardians')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeSection === 'guardians' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-xs">Guardians</span>}
            </button>
            
            <button 
              onClick={() => setActiveSection('prescriptions')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeSection === 'prescriptions' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-xs">Prescriptions</span>}
            </button>
            
            {/* Meals sidebar entry removed */}
            
            <button 
              onClick={() => setActiveSection('food-admin')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeSection === 'food-admin' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Utensils className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-xs">Food Database</span>}
            </button>
            
            <button 
              onClick={() => setActiveSection('conflicts')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeSection === 'conflicts' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-xs">Food-Drug Conflicts</span>}
            </button>
            
            <button 
              onClick={() => setActiveSection('doctors')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeSection === 'doctors' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-xs">Doctors/Dieticians</span>}
            </button>
            
            {/* Doctor Management Actions */}
            {!sidebarCollapsed && activeSection === 'doctors' && (
              <div className="ml-3 space-y-1.5">
                <button
                  onClick={() => setIsAddDoctorOpen(true)}
                  className="flex items-center space-x-2 w-full px-2 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span className="text-[11px]">Add Doctor</span>
                </button>
                <button
                  onClick={() => setIsPatientAssignmentOpen(true)}
                  className="flex items-center space-x-2 w-full px-2 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs"
                >
                  <UserPlus className="w-3 h-3" />
                  <span className="text-[11px]">Assign Patient</span>
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setActiveSection('alerts')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeSection === 'alerts' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bell className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-xs">Alerts & Notifications</span>}
            </button>
            
            <button 
              onClick={() => setActiveSection('mythbuster')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeSection === 'mythbuster' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Zap className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-xs">Myth-Buster Panel</span>}
            </button>
            
            <button 
              onClick={() => setActiveSection('reports')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeSection === 'reports' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <PieChart className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-xs">Reports</span>}
            </button>

            {/* Enterprise-Level Features */}
            <div className="pt-3 mt-3 border-t border-gray-200">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase">
                {!sidebarCollapsed && 'ENTERPRISE FEATURES'}
              </div>
            </div>

            <button 
              onClick={() => setActiveSection('system-analytics')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeSection === 'system-analytics' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-xs">System Analytics</span>}
            </button>

            <button 
              onClick={() => setActiveSection('subscription-finance')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeSection === 'subscription-finance' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-xs">Subscription & Finance</span>}
            </button>

            <button 
              onClick={() => setActiveSection('security-compliance')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeSection === 'security-compliance' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-xs">Security & Compliance</span>}
            </button>

            <button 
              onClick={() => setActiveSection('subscriptions')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeSection === 'subscriptions' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-xs">Subscriptions (Legacy)</span>}
            </button>

            <button 
              onClick={() => setActiveSection('security')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeSection === 'security' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Lock className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-xs">Security & Audit (Legacy)</span>}
            </button>

            <button 
              onClick={() => setActiveSection('ml-demos')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeSection === 'ml-demos' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Brain className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-xs">ML MODEL</span>}
            </button>
            
            <button 
              onClick={() => setActiveSection('settings')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activeSection === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-xs">Settings</span>}
            </button>
          </div>
        </nav>


        {/* Logout */}
        <div className="p-3 border-t border-gray-200">
          <button 
            onClick={logout}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span className="text-xs">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-gray-800">
                      {activeSection === 'dashboard' && 'Dashboard Overview'}
                      {activeSection === 'compliance' && 'Clinical Compliance & System Analytics'}
                      {activeSection === 'users' && 'User Management'}
                      {activeSection === 'staff' && 'Staff Verification & Credentialing'}
                      {activeSection === 'patient-assignments' && 'Patient Assignments'}
                      {activeSection === 'guardians' && 'Guardian Management'}
                      {activeSection === 'prescriptions' && 'Prescriptions'}
                      {/* Meals header removed */}
                      {activeSection === 'food-admin' && 'AI Food & Nutrition Database'}
                      {activeSection === 'conflicts' && 'Food-Drug Conflicts'}
                      {activeSection === 'doctors' && 'Doctors & Dieticians'}
                      {activeSection === 'alerts' && 'Alerts & Notifications'}
                      {activeSection === 'mythbuster' && 'Myth-Buster Panel'}
                      {activeSection === 'reports' && 'Analytics & Reports'}
                      {activeSection === 'system-analytics' && 'System Analytics'}
                      {activeSection === 'subscription-finance' && 'Subscription & Finance'}
                      {activeSection === 'security-compliance' && 'Security & Compliance'}
                      {activeSection === 'subscriptions' && 'Subscription & Financial Management'}
                      {activeSection === 'security' && 'Security & Audit Logs'}
                      {activeSection === 'ml-demos' && 'ML MODEL'}
                      {activeSection === 'settings' && 'System Settings'}
                    </h1>
                    <div className="hidden lg:flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-500 font-medium">Admin Control Center</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {activeSection === 'dashboard' && 'Real-time insights and system overview'}
                    {activeSection === 'compliance' && 'AI-powered clinical compliance, violations, and system health analytics'}
                    {activeSection === 'users' && 'Manage user accounts and permissions'}
                    {activeSection === 'staff' && 'Verify and manage medical staff credentials'}
                    {activeSection === 'patient-assignments' && 'Assign patients to doctors and dietitians'}
                    {activeSection === 'guardians' && 'Guardian account management'}
                    {activeSection === 'prescriptions' && 'View and manage prescriptions'}
                    {/* Meals subheader removed */}
                    {activeSection === 'food-admin' && 'Curate the master AI food & nutrition database'}
                    {activeSection === 'conflicts' && 'Drug interaction monitoring'}
                    {activeSection === 'doctors' && 'Healthcare professional management'}
                    {activeSection === 'alerts' && 'System alerts and notifications'}
                    {activeSection === 'mythbuster' && 'Nutrition myth verification'}
                    {activeSection === 'reports' && 'Comprehensive analytics dashboard'}
                    {activeSection === 'system-analytics' && 'User growth, appointments, diet success, and AI accuracy metrics'}
                    {activeSection === 'subscription-finance' && 'Subscription plans, revenue tracking, payments, and commission management'}
                    {activeSection === 'security-compliance' && 'Audit logs, login history, data access logs, and GDPR/HIPAA compliance flags'}
                    {activeSection === 'subscriptions' && 'Plans, revenue, and user subscription lifecycle'}
                    {activeSection === 'security' && 'Security alerts and detailed audit trails'}
                    {activeSection === 'ml-demos' && 'Explore model demos with mock results'}
                    {activeSection === 'settings' && 'Platform configuration and settings'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 flex-shrink-0">
              <div className="relative w-80 max-w-[40%]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.fullName?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{user?.fullName || 'Admin'}</p>
                  <p className="text-xs text-gray-500">System Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50 space-y-6 max-w-full">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* ML MODEL Section */}
          {activeSection === 'ml-demos' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="font-semibold text-gray-800">Model Selection</div>
                  <div className="flex flex-wrap gap-2">
                    <TabButton label="KNN" active={activeMlTab === 'knn'} onClick={() => setActiveMlTab('knn')} />
                    <TabButton label="Naïve Bayes" active={activeMlTab === 'nb'} onClick={() => setActiveMlTab('nb')} />
                    <TabButton label="Decision Tree" active={activeMlTab === 'dt'} onClick={() => setActiveMlTab('dt')} />
                    <TabButton label="SVM" active={activeMlTab === 'svm'} onClick={() => setActiveMlTab('svm')} />
                    <TabButton label="Neural Net" active={activeMlTab === 'nn'} onClick={() => setActiveMlTab('nn')} />
                  </div>
                </div>
                <div className="p-4">
                  {activeMlTab === 'knn' && <KnnDemo />}
                  {activeMlTab === 'nb' && <NaiveBayesDemo />}
                  {activeMlTab === 'dt' && <DecisionTreeDemo />}
                  {activeMlTab === 'svm' && <SvmDemo />}
                  {activeMlTab === 'nn' && <NeuralNetDemo />}
                </div>
              </div>
            </div>
          )}

          {/* Clinical Compliance & System Analytics */}
          {activeSection === 'compliance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Compliance Severity Overview */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Compliance Severity</h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Distribution of violations across severity levels
                      </p>
                    </div>
                    <AlertOctagon className="w-6 h-6 text-red-500" />
                  </div>
                  {complianceOverview ? (
                    <div className="space-y-3">
                      {['high', 'medium', 'low'].map(level => {
                        const entry = (complianceOverview.bySeverity || []).find(
                          s => (s._id || '').toLowerCase() === level
                        )
                        const count = entry?.count || 0
                        const total = (complianceOverview.bySeverity || []).reduce(
                          (acc, s) => acc + (s.count || 0),
                          0
                        ) || 1
                        const percent = Math.round((count / total) * 100)
                        const color =
                          level === 'high'
                            ? 'bg-red-500'
                            : level === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        return (
                          <div key={level}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium text-gray-700 capitalize">{level}</span>
                              <span className="text-gray-500">
                                {count} ({percent}%)
                              </span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`${color} h-2 rounded-full transition-all`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {complianceLoading ? 'Loading compliance data...' : 'No compliance data available yet.'}
                    </p>
                  )}
                </div>

                {/* Compliance Heatmap (per-user scores) */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Compliance Heatmap</h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Users sorted by compliance score (lower scores = higher risk)
                      </p>
                    </div>
                    <Target className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-2 pr-4 text-gray-500 font-medium">User</th>
                          <th className="py-2 pr-4 text-gray-500 font-medium">Violations</th>
                          <th className="py-2 pr-4 text-gray-500 font-medium">Impact</th>
                          <th className="py-2 pr-4 text-gray-500 font-medium">Compliance Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(complianceOverview?.perUser || []).map((row, idx) => {
                          const score = row.complianceScore ?? 100
                          const riskColor =
                            score < 50 ? 'bg-red-100 text-red-800' : score < 75 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          return (
                            <tr key={row.userId || idx} className="border-b border-gray-100">
                              <td className="py-2 pr-4 text-gray-700">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-semibold text-blue-700">
                                    {idx + 1}
                                  </div>
                                  <span>User {String(row.userId || '').slice(-6)}</span>
                                </div>
                              </td>
                              <td className="py-2 pr-4 text-gray-700">{row.violations}</td>
                              <td className="py-2 pr-4 text-gray-700">{row.totalImpact}</td>
                              <td className="py-2 pr-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium ${riskColor}`}>
                                  {score.toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                        {!complianceOverview && (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-gray-500 text-sm">
                              {complianceLoading ? 'Loading heatmap data...' : 'No compliance logs found.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Violation Table & System Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Recent Compliance Violations</h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Last 50 logged rule violations across the platform
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto max-h-[360px]">
                    <table className="min-w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-2 pr-4 text-gray-500 font-medium">Time</th>
                          <th className="py-2 pr-4 text-gray-500 font-medium">Category</th>
                          <th className="py-2 pr-4 text-gray-500 font-medium">Severity</th>
                          <th className="py-2 pr-4 text-gray-500 font-medium">Message</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complianceViolations.map(v => {
                          const sev =
                            v.severity === 'high'
                              ? 'bg-red-100 text-red-800'
                              : v.severity === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          return (
                            <tr key={v._id} className="border-b border-gray-100 align-top">
                              <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">
                                {new Date(v.createdAt).toLocaleString()}
                              </td>
                              <td className="py-2 pr-4 text-gray-700 capitalize">
                                {v.category?.replace('-', ' ')}
                              </td>
                              <td className="py-2 pr-4">
                                <span className={`inline-flex px-2 py-1 rounded-full text-[11px] font-medium ${sev}`}>
                                  {v.severity}
                                </span>
                              </td>
                              <td className="py-2 pr-4 text-gray-700 max-w-md">
                                <p className="line-clamp-2 text-xs">{v.message}</p>
                              </td>
                            </tr>
                          )
                        })}
                        {complianceViolations.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-gray-500 text-sm">
                              {complianceLoading ? 'Loading violations...' : 'No violations logged.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">System Health Metrics</h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Latest backend and compliance KPIs
                      </p>
                    </div>
                    <Activity className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="space-y-3 max-h-[360px] overflow-y-auto">
                    {systemMetrics.map(m => (
                      <div key={m._id} className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-800">{m.key}</p>
                          <p className="text-[11px] text-gray-500">
                            {new Date(m.timestamp || m.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{m.value}</p>
                          {m.category && (
                            <p className="text-[11px] text-gray-500 capitalize">{m.category}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {systemMetrics.length === 0 && (
                      <p className="text-sm text-gray-500">
                        {complianceLoading ? 'Loading metrics...' : 'No metrics recorded yet.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Staff Verification & Credentialing */}
          {activeSection === 'staff' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Pending Staff Credentials</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Doctors and dietitians awaiting manual verification
                    </p>
                  </div>
                  <button
                    onClick={fetchPendingStaff}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 pr-4 text-gray-500 font-medium">Staff</th>
                        <th className="py-2 pr-4 text-gray-500 font-medium">Role</th>
                        <th className="py-2 pr-4 text-gray-500 font-medium">License</th>
                        <th className="py-2 pr-4 text-gray-500 font-medium">Expiry</th>
                        <th className="py-2 pr-4 text-gray-500 font-medium">Status</th>
                        <th className="py-2 pr-4 text-gray-500 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingStaff.map(record => (
                        <tr key={record._id} className="border-b border-gray-100">
                          <td className="py-2 pr-4 text-gray-700">
                            <div className="flex flex-col">
                              <span className="font-semibold text-xs">
                                {record.userId?.firstName} {record.userId?.lastName}
                              </span>
                              <span className="text-[11px] text-gray-500">{record.userId?.email}</span>
                            </div>
                          </td>
                          <td className="py-2 pr-4 text-gray-700 capitalize">{record.role}</td>
                          <td className="py-2 pr-4 text-gray-700">{record.licenseNumber}</td>
                          <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">
                            {new Date(record.expiryDate).toLocaleDateString()}
                          </td>
                          <td className="py-2 pr-4">
                            <span className="inline-flex px-2 py-1 rounded-full text-[11px] font-medium bg-yellow-100 text-yellow-800">
                              {record.verificationStatus}
                            </span>
                          </td>
                          <td className="py-2 pr-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleVerifyStaff(record)}
                                className="inline-flex items-center px-2 py-1 rounded-full bg-green-600 text-white text-[11px] font-medium hover:bg-green-700"
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectStaff(record)}
                                className="inline-flex items-center px-2 py-1 rounded-full bg-red-600 text-white text-[11px] font-medium hover:bg-red-700"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {pendingStaff.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-gray-500 text-sm">
                            {staffLoading ? 'Loading pending staff...' : 'No pending verifications.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* AI Food & Nutrition Database Manager */}
          {activeSection === 'food-admin' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Food Master Database</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Central, AI-ready catalogue of foods, nutrients, and clinical suitability
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={fetchFoodItems}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Refresh
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 pr-4 text-gray-500 font-medium">Food</th>
                        <th className="py-2 pr-4 text-gray-500 font-medium">Category</th>
                        <th className="py-2 pr-4 text-gray-500 font-medium">Nutrients</th>
                        <th className="py-2 pr-4 text-gray-500 font-medium">Suitable For</th>
                        <th className="py-2 pr-4 text-gray-500 font-medium">Avoid With</th>
                        <th className="py-2 pr-4 text-gray-500 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {foodItems.map(item => (
                        <tr key={item._id} className="border-b border-gray-100 align-top">
                          <td className="py-2 pr-4 text-gray-700">
                            <div className="flex flex-col">
                              <span className="font-semibold text-xs">{item.name}</span>
                              <span className="text-[11px] text-gray-500 line-clamp-2">{item.description}</span>
                            </div>
                          </td>
                          <td className="py-2 pr-4 text-gray-700">{item.category}</td>
                          <td className="py-2 pr-4 text-gray-700">
                            <div className="text-[11px] text-gray-600 space-y-0.5">
                              <div>Cal: {item.calories}</div>
                              <div>Prot: {item.protein}g · Carb: {item.carbs}g · Fat: {item.fat}g</div>
                            </div>
                          </td>
                          <td className="py-2 pr-4 text-gray-700 max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {(item.suitableForDiseases || []).map(d => (
                                <span key={d} className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px]">
                                  {d}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2 pr-4 text-gray-700 max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {(item.avoidWithMedicines || []).map(m => (
                                <span key={m} className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[11px]">
                                  {m}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2 pr-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-[11px] font-medium ${
                              item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {foodItems.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-gray-500 text-sm">
                            {foodLoading ? 'Loading food catalogue...' : 'No food items found.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Subscription & Financial Management */}
          {activeSection === 'subscriptions' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Subscriptions</span>
                    <Users2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {revenueStats?.activeSubscriptions ?? subscriptions.filter(s => s.status === 'active').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Users with an active paid plan</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue (Premium)</span>
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {(() => {
                      const item = (revenueStats?.byPlan || []).find(p => p._id === 'Premium')
                      return item ? `${item.totalRevenue.toFixed(2)} ${item.currency}` : '0'
                    })()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Aggregated successful payments</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue (Enterprise)</span>
                    <Briefcase className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {(() => {
                      const item = (revenueStats?.byPlan || []).find(p => p._id === 'Enterprise')
                      return item ? `${item.totalRevenue.toFixed(2)} ${item.currency}` : '0'
                    })()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">High-value enterprise contracts</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">User Subscriptions</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Full subscription lifecycle across Free, Premium, and Enterprise plans
                    </p>
                  </div>
                  <button
                    onClick={fetchSubscriptionsAndRevenue}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 pr-4 text-gray-500 font-medium">User</th>
                        <th className="py-2 pr-4 text-gray-500 font-medium">Plan</th>
                        <th className="py-2 pr-4 text-gray-500 font-medium">Start</th>
                        <th className="py-2 pr-4 text-gray-500 font-medium">End</th>
                        <th className="py-2 pr-4 text-gray-500 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map(sub => (
                        <tr key={sub._id} className="border-b border-gray-100">
                          <td className="py-2 pr-4 text-gray-700">
                            <div className="flex flex-col">
                              <span className="font-semibold text-xs">
                                {sub.userId?.firstName} {sub.userId?.lastName}
                              </span>
                              <span className="text-[11px] text-gray-500">{sub.userId?.email}</span>
                            </div>
                          </td>
                          <td className="py-2 pr-4 text-gray-700">{sub.plan}</td>
                          <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">
                            {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">
                            {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-2 pr-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-[11px] font-medium ${
                              sub.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : sub.status === 'expired'
                                ? 'bg-gray-100 text-gray-600'
                                : sub.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {subscriptions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-gray-500 text-sm">
                            {subscriptionLoading ? 'Loading subscriptions...' : 'No subscriptions found.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Security & Audit Logs */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Audit Log Viewer</h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Immutable trail of admin and security-sensitive actions
                      </p>
                    </div>
                    <button
                      onClick={fetchSecurityData}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Refresh
                    </button>
                  </div>
                  <div className="overflow-x-auto max-h-[360px]">
                    <table className="min-w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-2 pr-4 text-gray-500 font-medium">Time</th>
                          <th className="py-2 pr-4 text-gray-500 font-medium">User</th>
                          <th className="py-2 pr-4 text-gray-500 font-medium">Module</th>
                          <th className="py-2 pr-4 text-gray-500 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map(log => (
                          <tr key={log._id} className="border-b border-gray-100 align-top">
                            <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="py-2 pr-4 text-gray-700">
                              <div className="flex flex-col">
                                <span className="font-semibold text-xs">
                                  {log.userId
                                    ? `${log.userId.firstName} ${log.userId.lastName}`
                                    : 'System'}
                                </span>
                                <span className="text-[11px] text-gray-500">
                                  {log.ipAddress || 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="py-2 pr-4 text-gray-700">{log.module}</td>
                            <td className="py-2 pr-4 text-gray-700 max-w-md">
                              <p className="text-xs">{log.action}</p>
                            </td>
                          </tr>
                        ))}
                        {auditLogs.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-gray-500 text-sm">
                              {securityLoading ? 'Loading audit logs...' : 'No audit logs yet.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Security Alerts</h2>
                      <p className="text-xs text-gray-500 mt-1">
                        High-severity security signals derived from audit events
                      </p>
                    </div>
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="space-y-3 max-h-[360px] overflow-y-auto">
                    {securityAlerts.map(alert => (
                      <div
                        key={alert._id}
                        className="flex items-start justify-between border border-red-100 rounded-lg px-3 py-2 bg-red-50"
                      >
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-red-800">
                            {alert.module} – {alert.action}
                          </p>
                          <p className="text-[11px] text-red-700 mt-1">
                            {new Date(alert.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {securityAlerts.length === 0 && (
                      <p className="text-sm text-gray-500">
                        {securityLoading ? 'Loading alerts...' : 'No high-severity alerts.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Analytics */}
          {activeSection === 'system-analytics' && (
            <SystemAnalytics />
          )}

          {/* Subscription & Finance */}
          {activeSection === 'subscription-finance' && (
            <SubscriptionFinance />
          )}

          {/* Security & Compliance */}
          {activeSection === 'security-compliance' && (
            <SecurityCompliance />
          )}

          {/* Dashboard Overview */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-gray-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900 mb-1">{dashboardStats.totalUsers || stats.total}</p>
                    <p className="text-sm text-gray-500 mb-2">Total Users</p>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <p className="text-xs text-green-600">+12% this month</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900 mb-1">{dashboardStats.prescriptions || prescriptions.length}</p>
                    <p className="text-sm text-gray-500 mb-2">Prescriptions</p>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <p className="text-xs text-green-600">+8% this week</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-gray-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-red-600 mb-1">{dashboardStats.conflicts || conflicts.length}</p>
                    <p className="text-sm text-gray-500 mb-2">Conflicts</p>
                    <div className="flex items-center space-x-1">
                      <TrendingDown className="w-3 h-3 text-red-600" />
                      <p className="text-xs text-red-600">-5% this week</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Apple className="w-6 h-6 text-gray-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900 mb-1">{dashboardStats.meals || meals.length}</p>
                    <p className="text-sm text-gray-500 mb-2">Meals Added</p>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <p className="text-xs text-green-600">+15% this week</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-gray-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900 mb-1">{dashboardStats.activeDoctors || stats.doctors}</p>
                    <p className="text-sm text-gray-500 mb-2">Active Doctors</p>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <p className="text-xs text-green-600">+3 this month</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Diet Compliance Chart */}
                <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Diet Compliance</h3>
                        <p className="text-sm text-gray-500">Weekly performance metrics</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700 font-medium">85% Average</span>
                    </div>
                  </div>
                  <div className="h-80 flex items-end justify-between space-x-2">
                    {[65, 72, 78, 82, 85, 88, 85].map((height, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="w-8 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                          style={{ height: `${height}%` }}
                          title={`${height}% compliance`}
                        ></div>
                        <span className="text-xs text-gray-500 mt-2 font-medium">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conflict Trends */}
                <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Conflict Trends</h3>
                        <p className="text-sm text-gray-500">Drug interaction monitoring</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-lg">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-red-700 font-medium">Weekly Trend</span>
                    </div>
                  </div>
                  <div className="h-80 flex items-end justify-between space-x-2">
                    {[12, 8, 15, 10, 7, 9, 11].map((height, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="w-8 bg-red-500 rounded-t hover:bg-red-600 transition-colors cursor-pointer"
                          style={{ height: `${height * 4}%` }}
                          title={`${height} conflicts detected`}
                        ></div>
                        <span className="text-xs text-gray-500 mt-2 font-medium">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Engagement */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 group">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">User Engagement</h3>
                      <p className="text-xs text-gray-500">Monthly active user trends</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">+12% this month</span>
                  </div>
                </div>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {[78, 82, 85, 88, 90, 87, 89, 91, 93, 88, 85, 87].map((height, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t hover:from-blue-600 hover:to-blue-500 transition-colors cursor-pointer"
                        style={{ height: `${height}%` }}
                        title={`${height}% engagement`}
                      ></div>
                      <span className="text-xs text-gray-500 mt-2 font-medium">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Patient Assignments Section */}
          {activeSection === 'patient-assignments' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Patient Assignments</h2>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => setIsPatientAssignmentOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Assign Patient</span>
                      </button>
                      <button 
                        onClick={fetchPatientAssignments}
                        disabled={loading}
                        className={`flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(patientAssignments || []).map((assignment, index) => (
                        <tr key={assignment.id || `assignment-${index}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{assignment.patientName || 'Unknown Patient'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{assignment.doctorName || 'Unknown Doctor'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              (assignment.priority || 'medium') === 'critical' ? 'bg-red-100 text-red-800' :
                              (assignment.priority || 'medium') === 'high' ? 'bg-orange-100 text-orange-800' :
                              (assignment.priority || 'medium') === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {(assignment.priority || 'medium').charAt(0).toUpperCase() + (assignment.priority || 'medium').slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              (assignment.status || 'active') === 'active' ? 'bg-green-100 text-green-800' :
                              (assignment.status || 'active') === 'discharged' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {(assignment.status || 'active').charAt(0).toUpperCase() + (assignment.status || 'active').slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* User Management Section */}
          {activeSection === 'users' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">User Management</h2>
                    <div className="flex items-center space-x-3">
                      <select 
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={roleFilter} 
                        onChange={(e) => setRoleFilter(e.target.value)}
                      >
                        <option value="all">All Roles</option>
                        <option value="user">Users</option>
                        <option value="doctor">Doctors</option>
                        <option value="admin">Admins</option>
                      </select>
                      <select 
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <button 
                        onClick={fetchUsers}
                        disabled={loading}
                        className={`flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
              <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {u.fullName?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{u.fullName}</div>
                                <div className="text-sm text-gray-500">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              u.role === 'admin' ? 'bg-orange-100 text-orange-800' :
                              u.role === 'doctor' ? 'bg-purple-100 text-purple-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {u.role === 'doctor' ? (u.specialization || '-') : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <select 
                                className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={u.role} 
                                onChange={(e) => updateRole(u._id, e.target.value)}
                              >
                        <option value="user">User</option>
                        <option value="doctor">Doctor</option>
                        <option value="admin">Admin</option>
                      </select>
                              <button 
                                onClick={() => updateStatus(u._id, !u.isActive)}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                  u.isActive 
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => deleteUser(u._id)}
                        className="px-3 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        Remove
                      </button>
                            </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && !loading && (
                  <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            No users found
                          </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
            </div>
          )}

          {/* Prescriptions Section */}
          {activeSection === 'prescriptions' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Prescriptions</h2>
                    <button 
                      onClick={fetchPrescriptions}
                      disabled={loading}
                      className={`flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {prescriptions.length > 0 ? (
                      prescriptions.map((prescription) => (
                        <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-800">{prescription.patientName || 'Unknown Patient'}</h3>
                              <p className="text-sm text-gray-600">{prescription.doctorName || 'Unknown Doctor'}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              prescription.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {prescription.status || 'pending'}
                            </span>
                          </div>
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2">Medicines:</p>
                            <div className="flex flex-wrap gap-2">
                              {prescription.medicines && prescription.medicines.map((medicine, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                  {medicine}
                                </span>
                              ))}
                            </div>
                          </div>
                          {prescription.conflicts && prescription.conflicts.length > 0 && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm font-semibold text-red-800 mb-1">Conflicts:</p>
                              {prescription.conflicts.map((conflict, idx) => (
                                <p key={idx} className="text-xs text-red-700">{conflict}</p>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-3">Uploaded: {prescription.uploadDate || 'N/A'}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No prescriptions found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Meals section removed */}

          {/* Food-Drug Conflicts Section */}
          {activeSection === 'conflicts' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Food-Drug Conflicts</h2>
                    <button 
                      onClick={fetchConflicts}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {conflicts.length > 0 ? (
                      conflicts.map((conflict) => (
                        <div 
                          key={conflict.id} 
                          className={`p-6 border rounded-lg ${
                            conflict.riskLevel === 'high' ? 'bg-red-50 border-red-200' :
                            conflict.riskLevel === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              conflict.riskLevel === 'high' ? 'bg-red-100' :
                              conflict.riskLevel === 'medium' ? 'bg-yellow-100' :
                              'bg-blue-100'
                            }`}>
                              <AlertTriangle className={`w-6 h-6 ${
                                conflict.riskLevel === 'high' ? 'text-red-600' :
                                conflict.riskLevel === 'medium' ? 'text-yellow-600' :
                                'text-blue-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-800">
                                  {Array.isArray(conflict.medicines) ? conflict.medicines.join(' + ') : conflict.medicines}
                                </h3>
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                  conflict.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                                  conflict.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {conflict.severity || conflict.riskLevel}
                                </span>
                              </div>
                              <p className="text-gray-700 mb-2">{conflict.description}</p>
                              <p className="text-sm text-gray-600">
                                <strong>Recommendation:</strong> {conflict.recommendation}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No food-drug conflicts detected</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alerts Section */}
          {activeSection === 'alerts' && (
            <div className="space-y-6">
              <div className="space-y-4">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div key={alert.id} className={`bg-white rounded-xl p-6 shadow-sm border ${
                      alert.type === 'critical' ? 'border-red-200' :
                      alert.type === 'warning' ? 'border-yellow-200' :
                      'border-blue-200'
                    }`}>
                      <div className="flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          alert.type === 'critical' ? 'bg-red-100' :
                          alert.type === 'warning' ? 'bg-yellow-100' :
                          'bg-blue-100'
                        }`}>
                          {alert.type === 'critical' ? (
                            <AlertOctagon className="w-6 h-6 text-red-600" />
                          ) : alert.type === 'warning' ? (
                            <AlertTriangle className="w-6 h-6 text-yellow-600" />
                          ) : (
                            <Info className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`font-semibold ${
                              alert.type === 'critical' ? 'text-red-800' :
                              alert.type === 'warning' ? 'text-yellow-800' :
                              'text-blue-800'
                            }`}>
                              {alert.title}
                            </h3>
                            <span className="text-xs text-gray-500">{alert.timestamp}</span>
                          </div>
                          <p className={`text-sm mb-2 ${
                            alert.type === 'critical' ? 'text-red-700' :
                            alert.type === 'warning' ? 'text-yellow-700' :
                            'text-blue-700'
                          }`}>
                            {alert.message}
                          </p>
                          <div className="text-xs text-gray-500">
                            Patient: {alert.patient}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No alerts at this time</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Guardians Section */}
          {activeSection === 'guardians' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Guardian Management</h2>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      <Plus className="w-4 h-4" />
                      <span>Add Guardian</span>
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guardian</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relationship</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ward</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {guardians.map((guardian) => (
                        <tr key={guardian.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {guardian.name.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{guardian.name}</div>
                                <div className="text-sm text-gray-500">{guardian.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {guardian.relationship}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {guardian.wardName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              guardian.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {guardian.status.charAt(0).toUpperCase() + guardian.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-800">Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Doctors Section */}
          {activeSection === 'doctors' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Doctors & Dieticians</h2>
                    <button 
                      onClick={() => setIsAddDoctorOpen(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Doctor</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {users.filter(user => user.role === 'doctor').length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {users.filter(user => user.role === 'doctor').map((doctor) => (
                        <div key={doctor._id} className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-medium text-lg">
                                {doctor.fullName ? doctor.fullName.split(' ').map(n => n[0]).join('') : 'DR'}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{doctor.fullName || 'Dr. Unknown'}</h3>
                              <p className="text-sm text-gray-600">{doctor.specialization || 'General Medicine'}</p>
                            </div>
                          </div>
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Email:</span>
                              <span className="font-medium text-xs">{doctor.email}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Status:</span>
                              <span className={`font-medium ${doctor.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                {doctor.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Role:</span>
                              <span className="font-medium capitalize">{doctor.role}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedDoctor(doctor)
                                setIsViewDoctorOpen(true)
                              }}
                              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              View Details
                            </button>
                            <button 
                              onClick={async () => {
                                try {
                                  // Fetch full doctor details including password
                                  const response = await axios.get(`/api/admin/users/${doctor._id}`)
                                  if (response.data.success) {
                                    setSelectedDoctor(response.data.data)
                                    setIsEditDoctorOpen(true)
                                    setShowCurrentPassword(false)
                                  }
                                } catch (error) {
                                  console.error('Error fetching doctor details:', error)
                                  // Fallback to basic doctor data
                                  setSelectedDoctor(doctor)
                                  setIsEditDoctorOpen(true)
                                  setShowCurrentPassword(false)
                                }
                              }}
                              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Doctors Found</h3>
                      <p className="text-gray-500 mb-6">Get started by adding your first doctor or dietician to the system.</p>
                      <button 
                        onClick={() => setIsAddDoctorOpen(true)}
                        className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add First Doctor</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Myth-Buster Panel Section */}
          {activeSection === 'mythbuster' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Myth-Buster Panel</h2>
                    <button 
                      onClick={fetchMythBusters}
                      disabled={loading}
                      className={`flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {mythBusters.length > 0 ? (
                      mythBusters.map((item) => (
                        <div key={item.id} className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <Zap className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                  {item.category}
                                </span>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                  item.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {item.status === 'verified' ? 'Verified' : 'Pending'}
                                </span>
                              </div>
                              <h3 className="font-semibold text-gray-900 mb-2">❌ Myth:</h3>
                              <p className="text-gray-700 mb-3">{item.myth}</p>
                              <h3 className="font-semibold text-green-700 mb-2">✅ Fact:</h3>
                              <p className="text-gray-700">{item.fact}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No myth-busters available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reports Section */}
          {activeSection === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">System Reports</h2>
                    <button 
                      onClick={fetchReports}
                      disabled={loading}
                      className={`flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reports.length > 0 ? (
                      reports.map((report) => (
                        <div key={report.id} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 mb-1">{report.title}</h3>
                              <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                  report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {report.status}
                                </span>
                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                  View Report
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No reports available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">System Settings</h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* AI Settings */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-md font-semibold text-gray-800 mb-4">AI Configuration</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">Real-time Conflict Detection</p>
                          <p className="text-sm text-gray-600">Enable AI-powered food-drug interaction monitoring</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* System Info */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-md font-semibold text-gray-800 mb-4">System Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalUsers || 0}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Active Doctors</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeDoctors || 0}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Meals</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.meals || 0}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Conflicts Detected</p>
                        <p className="text-2xl font-bold text-red-600">{dashboardStats.conflicts || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-800 mb-4">System Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Download className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-800">Export All Data</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                      <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Upload className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-800">Backup System</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                      <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Settings className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-800">Database Settings</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>


      {/* Enhanced Add Doctor Modal */}
        {isAddDoctorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => {
            setIsAddDoctorOpen(false)
            resetDoctorForm()
          }} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                    <h3 className="text-xl font-semibold text-gray-800">Add New Doctor</h3>
                    <p className="text-sm text-gray-600">Create a comprehensive healthcare professional account</p>
              </div>
                </div>
                <button
                  onClick={() => {
                    setIsAddDoctorOpen(false)
                    resetDoctorForm()
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
            </div>
            
              {/* Progress Steps */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= step 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {currentStep > step ? <CheckCircle2 className="w-4 h-4" /> : step}
                      </div>
                      <div className="ml-2">
                        <p className={`text-sm font-medium ${
                          currentStep >= step ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {step === 1 && 'Personal Info'}
                          {step === 2 && 'Professional Info'}
                          {step === 3 && 'Contact & Details'}
                        </p>
                      </div>
                      {step < 3 && (
                        <div className={`w-12 h-0.5 mx-4 ${
                          currentStep > step ? 'bg-blue-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleDoctorSubmit} className="p-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="w-5 h-5 text-blue-600" />
                    <h4 className="text-lg font-semibold text-gray-800">Personal Information</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                <input 
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          doctorFormErrors.firstName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter first name" 
                        value={doctorForm.firstName} 
                        onChange={e => handleDoctorFormChange('firstName', e.target.value)}
                      />
                      {doctorFormErrors.firstName && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {doctorFormErrors.firstName}
                        </p>
                      )}
              </div>

              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                <input 
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          doctorFormErrors.lastName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter last name" 
                        value={doctorForm.lastName} 
                        onChange={e => handleDoctorFormChange('lastName', e.target.value)}
                      />
                      {doctorFormErrors.lastName && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {doctorFormErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input 
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        doctorFormErrors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="doctor@hospital.com" 
                  type="email" 
                  value={doctorForm.email} 
                      onChange={e => handleDoctorFormChange('email', e.target.value)}
                    />
                    {doctorFormErrors.email && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {doctorFormErrors.email}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">Must end with .org, .in, or .com</p>
              </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <input 
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-12 ${
                              doctorFormErrors.password ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter password" 
                            type={showPassword ? 'text' : 'password'}
                            value={doctorForm.password} 
                            onChange={e => handleDoctorFormChange('password', e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newPassword = generatePassword()
                            handleDoctorFormChange('password', newPassword)
                            handleDoctorFormChange('confirmPassword', newPassword)
                          }}
                          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          title="Generate secure password"
                        >
                          Generate
                        </button>
                      </div>
                      {doctorFormErrors.password && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {doctorFormErrors.password}
                        </p>
                )}
              </div>

              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                <input 
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-12 ${
                            doctorFormErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Confirm password" 
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={doctorForm.confirmPassword} 
                          onChange={e => handleDoctorFormChange('confirmPassword', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {doctorFormErrors.confirmPassword && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {doctorFormErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Professional Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    <h4 className="text-lg font-semibold text-gray-800">Professional Information</h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Specialization <span className="text-red-500">*</span>
                    </label>
                    <select 
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        doctorFormErrors.specialization ? 'border-red-300' : 'border-gray-300'
                      }`}
                  value={doctorForm.specialization} 
                      onChange={e => handleDoctorFormChange('specialization', e.target.value)}
                    >
                      <option value="">Select specialization</option>
                      {specializationOptions.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                    {doctorFormErrors.specialization && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {doctorFormErrors.specialization}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical License Number <span className="text-red-500">*</span>
                      </label>
                      <input 
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          doctorFormErrors.licenseNumber ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter license number" 
                        value={doctorForm.licenseNumber} 
                        onChange={e => handleDoctorFormChange('licenseNumber', e.target.value)}
                      />
                      {doctorFormErrors.licenseNumber && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {doctorFormErrors.licenseNumber}
                        </p>
                      )}
              </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience
                      </label>
                      <input 
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          doctorFormErrors.yearsOfExperience ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0" 
                        type="number"
                        min="0"
                        max="50"
                        value={doctorForm.yearsOfExperience} 
                        onChange={e => handleDoctorFormChange('yearsOfExperience', e.target.value)}
                      />
                      {doctorFormErrors.yearsOfExperience && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {doctorFormErrors.yearsOfExperience}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professional Bio
                    </label>
                    <textarea 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                      placeholder="Brief professional background, education, and expertise..."
                      rows="4"
                      value={doctorForm.bio} 
                      onChange={e => handleDoctorFormChange('bio', e.target.value)}
                    />
                    <p className="text-gray-500 text-xs mt-1">Optional: Brief professional summary</p>
                  </div>
                </div>
              )}

              {/* Step 3: Contact & Additional Information */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <h4 className="text-lg font-semibold text-gray-800">Contact & Additional Information</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input 
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          doctorFormErrors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="+91 98765 43210" 
                        type="tel"
                        value={doctorForm.phoneNumber} 
                        onChange={e => handleDoctorFormChange('phoneNumber', e.target.value)}
                      />
                      {doctorFormErrors.phoneNumber && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {doctorFormErrors.phoneNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hospital Affiliation
                      </label>
                      <input 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        placeholder="Hospital or clinic name" 
                        value={doctorForm.hospitalAffiliation} 
                        onChange={e => handleDoctorFormChange('hospitalAffiliation', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Availability
                      </label>
                      <select 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        value={doctorForm.availability} 
                        onChange={e => handleDoctorFormChange('availability', e.target.value)}
                      >
                        {availabilityOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Consultation Fee (₹)
                      </label>
                      <input 
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          doctorFormErrors.consultationFee ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="500" 
                        type="number"
                        min="0"
                        step="50"
                        value={doctorForm.consultationFee} 
                        onChange={e => handleDoctorFormChange('consultationFee', e.target.value)}
                      />
                      {doctorFormErrors.consultationFee && (
                        <p className="text-red-600 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {doctorFormErrors.consultationFee}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Languages Spoken
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {languageOptions.map((language) => (
                        <label key={language} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={doctorForm.languages.includes(language)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleDoctorFormChange('languages', [...doctorForm.languages, language])
                              } else {
                                handleDoctorFormChange('languages', doctorForm.languages.filter(l => l !== language))
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{language}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
                <div className="flex items-center space-x-4">
                  {currentStep > 1 && (
                <button 
                  type="button" 
                      onClick={prevStep}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <button 
                    type="button" 
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors" 
                    onClick={() => {
                      setIsAddDoctorOpen(false)
                      resetDoctorForm()
                    }}
                >
                  Cancel
                </button>
                  
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                <button 
                  type="submit" 
                      disabled={isSubmittingDoctor || Object.keys(doctorFormErrors).length > 0}
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                    >
                      {isSubmittingDoctor ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Create Doctor</span>
                        </>
                      )}
                </button>
                  )}
                </div>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* View Doctor Details Modal */}
      {isViewDoctorOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsViewDoctorOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Doctor Details</h3>
                <button
                  onClick={() => setIsViewDoctorOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-medium text-xl">
                      {selectedDoctor.fullName ? selectedDoctor.fullName.split(' ').map(n => n[0]).join('') : 'DR'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{selectedDoctor.fullName || 'Dr. Unknown'}</h4>
                    <p className="text-gray-600">{selectedDoctor.specialization || 'General Medicine'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedDoctor.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900">{selectedDoctor.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className={`font-medium ${selectedDoctor.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedDoctor.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Role</label>
                    <p className="text-gray-900 capitalize">{selectedDoctor.role}</p>
                  </div>
                </div>
                
                {selectedDoctor.bio && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Bio</label>
                    <p className="text-gray-900 mt-1">{selectedDoctor.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {isEditDoctorOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsEditDoctorOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Edit Doctor</h3>
                <button
                  onClick={() => setIsEditDoctorOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={selectedDoctor.fullName || `${selectedDoctor.firstName || ''} ${selectedDoctor.lastName || ''}`.trim()}
                    onChange={(e) => setSelectedDoctor({...selectedDoctor, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={selectedDoctor.email || ''}
                    onChange={(e) => setSelectedDoctor({...selectedDoctor, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={selectedDoctor.password || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Current password (read-only)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password (leave blank to keep current)"
                    value={selectedDoctor.newPassword || ''}
                    onChange={(e) => setSelectedDoctor({...selectedDoctor, newPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={selectedDoctor.specialization || ''}
                    onChange={(e) => setSelectedDoctor({...selectedDoctor, specialization: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={selectedDoctor.phone || selectedDoctor.doctorInfo?.phoneNumber || ''}
                    onChange={(e) => setSelectedDoctor({...selectedDoctor, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedDoctor.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setSelectedDoctor({...selectedDoctor, isActive: e.target.value === 'active'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setIsEditDoctorOpen(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        // Prepare the update data
                        const updateData = {
                          fullName: selectedDoctor.fullName,
                          email: selectedDoctor.email,
                          specialization: selectedDoctor.specialization,
                          phone: selectedDoctor.phone,
                          isActive: selectedDoctor.isActive
                        };

                        // Only include password if it's provided
                        if (selectedDoctor.newPassword && selectedDoctor.newPassword.trim()) {
                          updateData.password = selectedDoctor.newPassword;
                        }

                        const response = await axios.put(`/api/admin/users/${selectedDoctor._id}`, updateData);
                        
                        if (response.data.success) {
                          await fetchUsers();
                          setIsEditDoctorOpen(false);
                          setSelectedDoctor(null);
                          // Show success message
                          alert('Doctor updated successfully!');
                        } else {
                          alert('Failed to update doctor: ' + response.data.message);
                        }
                      } catch (error) {
                        console.error('Error updating doctor:', error);
                        alert('Error updating doctor: ' + (error.response?.data?.message || error.message));
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Assignment Modal */}
      <PatientAssignmentModal
        isOpen={isPatientAssignmentOpen}
        onClose={() => setIsPatientAssignmentOpen(false)}
        onSuccess={() => {
          fetchUsers()
          fetchPatientAssignments()
          setIsPatientAssignmentOpen(false)
        }}
      />

      {/* Doctor Credentials Modal */}
      {showCredentialsModal && generatedCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Doctor Created Successfully!</h3>
                    <p className="text-sm text-gray-500">Login credentials generated</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCredentialsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Doctor Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Name:</span>
                      <span className="text-blue-900 font-medium">{generatedCredentials.doctorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Specialization:</span>
                      <span className="text-blue-900 font-medium">{generatedCredentials.specialization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Doctor ID:</span>
                      <span className="text-blue-900 font-medium font-mono text-xs">{generatedCredentials.doctorId}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Login Credentials</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={generatedCredentials.email}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono"
                        />
                        <button
                          onClick={() => copyToClipboard(generatedCredentials.email, 'Email')}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy email"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="password"
                          value={generatedCredentials.password}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono"
                        />
                        <button
                          onClick={() => copyToClipboard(generatedCredentials.password, 'Password')}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy password"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Important Security Notice</p>
                      <p>Please securely share these credentials with the doctor. They should change their password after first login for security purposes.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  {copySuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-800 text-sm font-medium">{copySuccess}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        const credentials = `Email: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}\nDoctor: ${generatedCredentials.doctorName}\nSpecialization: ${generatedCredentials.specialization}`;
                        copyToClipboard(credentials, 'All credentials');
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy All</span>
                    </button>
                    <button
                      onClick={() => setShowCredentialsModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
