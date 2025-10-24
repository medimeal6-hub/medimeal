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
        generatedDate: '2024-01-15',
        period: 'December 2023',
        status: 'completed'
      },
      {
        id: 2,
        title: 'User Engagement Analytics',
        type: 'analytics',
        generatedDate: '2024-01-14',
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
      const res = await axios.get('/api/admin/users')
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
      
      const res = await axios.get('/api/admin/patient-assignments')
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
    }
  }

  // Apply the same fix to all other data fetching functions
  const fetchPrescriptions = async () => {
    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      const res = await axios.get('/api/admin/prescriptions')
      setPrescriptions(res.data.data || [])
    } catch (e) {
      setPrescriptions(sampleData.prescriptions)
    }
  }

  const fetchMeals = async () => {
    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      const res = await axios.get('/api/admin/meals')
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
      const res = await axios.get('/api/admin/conflicts')
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
      const res = await axios.get('/api/admin/alerts')
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
      const res = await axios.get('/api/admin/guardians')
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
      const res = await axios.get('/api/admin/doctors')
      setDoctors(res.data.data || [])
    } catch (e) {
      setDoctors(sampleData.doctors)
    }
  }

  const fetchReports = async () => {
    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      const res = await axios.get('/api/admin/reports')
      setReports(res.data.data || [])
    } catch (e) {
      setReports(sampleData.reports)
    }
  }

  const fetchMythBusters = async () => {
    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      const res = await axios.get('/api/admin/myth-busters')
      setMythBusters(res.data.data || [])
    } catch (e) {
      setMythBusters(sampleData.mythBusters)
    }
  }

  const fetchDashboardStats = async () => {
    try {
      if (token && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      const res = await axios.get('/api/admin/dashboard-stats')
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
      
      const response = await axios.post('/api/admin/doctors', submitData)
      
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-[260px]'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col flex-shrink-0`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span className="text-xl font-semibold text-gray-900">MediMeal</span>
                <p className="text-xs text-gray-500">AI Platform</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <div className="space-y-1">
            <button 
              onClick={() => setActiveSection('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              {!sidebarCollapsed && <span className="font-medium">Dashboard</span>}
            </button>
            
            <button 
              onClick={() => setActiveSection('users')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'users' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5" />
              {!sidebarCollapsed && <span>Users</span>}
            </button>
            
            <button 
              onClick={() => setActiveSection('patient-assignments')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'patient-assignments' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              {!sidebarCollapsed && <span>Patient Assignments</span>}
            </button>
            
            {/* Patient Assignment Actions */}
            {!sidebarCollapsed && activeSection === 'patient-assignments' && (
              <div className="ml-4 space-y-2">
                <button
                  onClick={() => setIsPatientAssignmentOpen(true)}
                  className="flex items-center space-x-2 w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Assign Patient</span>
                </button>
                <button
                  onClick={() => fetchPatientAssignments()}
                  className="flex items-center space-x-2 w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh Assignments</span>
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setActiveSection('guardians')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'guardians' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              {!sidebarCollapsed && <span>Guardians</span>}
            </button>
            
            <button 
              onClick={() => setActiveSection('prescriptions')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'prescriptions' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-5 h-5" />
              {!sidebarCollapsed && <span>Prescriptions</span>}
            </button>
            
            <button 
              onClick={() => setActiveSection('meals')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'meals' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Apple className="w-5 h-5" />
              {!sidebarCollapsed && <span>Meals</span>}
            </button>
            
            <button 
              onClick={() => setActiveSection('conflicts')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'conflicts' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
              {!sidebarCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>Food-Drug Conflicts</span>
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">5</span>
                </div>
              )}
            </button>
            
            <button 
              onClick={() => setActiveSection('doctors')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'doctors' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Shield className="w-5 h-5" />
              {!sidebarCollapsed && <span>Doctors/Dieticians</span>}
            </button>
            
            {/* Doctor Management Actions */}
            {!sidebarCollapsed && activeSection === 'doctors' && (
              <div className="ml-4 space-y-2">
                <button
                  onClick={() => setIsAddDoctorOpen(true)}
                  className="flex items-center space-x-2 w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Doctor</span>
                </button>
                <button
                  onClick={() => setIsPatientAssignmentOpen(true)}
                  className="flex items-center space-x-2 w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Assign Patient</span>
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setActiveSection('alerts')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'alerts' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bell className="w-5 h-5" />
              {!sidebarCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>Alerts & Notifications</span>
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">12</span>
                </div>
              )}
            </button>
            
            <button 
              onClick={() => setActiveSection('mythbuster')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'mythbuster' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Zap className="w-5 h-5" />
              {!sidebarCollapsed && <span>Myth-Buster Panel</span>}
            </button>
            
            <button 
              onClick={() => setActiveSection('reports')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'reports' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <PieChart className="w-5 h-5" />
              {!sidebarCollapsed && <span>Reports</span>}
            </button>
            
            <button 
              onClick={() => setActiveSection('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5" />
              {!sidebarCollapsed && <span>Settings</span>}
            </button>
          </div>
        </nav>

        {/* AI Status */}
        {!sidebarCollapsed && (
          <div className="p-4">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">AI System Active</span>
              </div>
              <p className="text-xs text-gray-600">Real-time conflict detection enabled</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={logout}
            className="flex items-center space-x-3 text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span>Logout</span>}
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
                      {activeSection === 'users' && 'User Management'}
                      {activeSection === 'patient-assignments' && 'Patient Assignments'}
                      {activeSection === 'guardians' && 'Guardian Management'}
                      {activeSection === 'prescriptions' && 'Prescription OCR'}
                      {activeSection === 'meals' && 'Meal Management'}
                      {activeSection === 'conflicts' && 'Food-Drug Conflicts'}
                      {activeSection === 'doctors' && 'Doctors & Dieticians'}
                      {activeSection === 'alerts' && 'Alerts & Notifications'}
                      {activeSection === 'mythbuster' && 'Myth-Buster Panel'}
                      {activeSection === 'reports' && 'Analytics & Reports'}
                      {activeSection === 'settings' && 'System Settings'}
                    </h1>
                    <div className="hidden lg:flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-500 font-medium">Admin Control Center</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {activeSection === 'dashboard' && 'Real-time insights and system overview'}
                    {activeSection === 'users' && 'Manage user accounts and permissions'}
                    {activeSection === 'patient-assignments' && 'Assign patients to doctors and dietitians'}
                    {activeSection === 'guardians' && 'Guardian account management'}
                    {activeSection === 'prescriptions' && 'OCR verification and conflict detection'}
                    {activeSection === 'meals' && 'Food database and nutritional analysis'}
                    {activeSection === 'conflicts' && 'Drug interaction monitoring'}
                    {activeSection === 'doctors' && 'Healthcare professional management'}
                    {activeSection === 'alerts' && 'System alerts and notifications'}
                    {activeSection === 'mythbuster' && 'Nutrition myth verification'}
                    {activeSection === 'reports' && 'Comprehensive analytics dashboard'}
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
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">12</span>
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
                        onClick={fetchPatientAssignments}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ward Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patientAssignments.map((assignment) => (
                        <tr key={assignment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{assignment.patientName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{assignment.doctorName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-mono text-gray-900">{assignment.wardNumber}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              assignment.priority === 'critical' ? 'bg-red-100 text-red-800' :
                              assignment.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              assignment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                              assignment.status === 'discharged' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(assignment.startDate).toLocaleDateString()}
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
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
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

          {/* Prescription OCR Section */}
          {activeSection === 'prescriptions' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Prescription OCR Verification</h2>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>Upload Prescription</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* OCR Preview */}
                    <div className="space-y-4">
                      <h3 className="text-md font-semibold text-gray-800">OCR Preview</h3>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Upload prescription image for OCR processing</p>
                      </div>
                    </div>
                    
                    {/* Extracted Medicine List */}
                    <div className="space-y-4">
                      <h3 className="text-md font-semibold text-gray-800">Extracted Medicines</h3>
                      <div className="space-y-3">
                        {prescriptions.length > 0 ? (
                          prescriptions[0].medicines.map((medicine, index) => {
                            const hasConflict = prescriptions[0].conflicts.some(conflict => 
                              conflict.toLowerCase().includes(medicine.toLowerCase().split(' ')[0])
                            )
                            return (
                              <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                                hasConflict ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                              }`}>
                                <div className="flex items-center space-x-3">
                                  <Pill className={`w-5 h-5 ${hasConflict ? 'text-red-600' : 'text-green-600'}`} />
                                  <div>
                                    <p className="font-medium text-gray-800">{medicine}</p>
                                    <p className="text-sm text-gray-600">
                                      {medicine.includes('Metformin') ? 'Twice daily with meals' : 'Once daily'}
                                    </p>
                                  </div>
                                </div>
                                {hasConflict ? (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                ) : (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                )}
                              </div>
                            )
                          })
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Pill className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p>No prescriptions uploaded yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Conflict Alerts */}
                  {prescriptions.length > 0 && prescriptions[0].conflicts.length > 0 ? (
                    <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertOctagon className="w-5 h-5 text-red-600" />
                        <h4 className="font-semibold text-red-800">Conflict Alert</h4>
                      </div>
                      <div className="space-y-2">
                        {prescriptions[0].conflicts.map((conflict, index) => (
                          <p key={index} className="text-sm text-red-700">
                            {conflict}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-green-800">No Conflicts Detected</h4>
                      </div>
                      <p className="text-sm text-green-700">
                        All medications appear to be safe for combination.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Meal Management Section */}
          {activeSection === 'meals' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Meal Management</h2>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      <Plus className="w-4 h-4" />
                      <span>Add Meal</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {meals.length > 0 ? (
                      meals.map((meal) => (
                        <div key={meal.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <div className={`h-48 bg-gradient-to-br ${
                            meal.status === 'safe' ? 'from-green-400 to-green-600' :
                            meal.status === 'moderate_risk' ? 'from-yellow-400 to-yellow-600' :
                            'from-red-400 to-red-600'
                          } flex items-center justify-center`}>
                            <Apple className="w-16 h-16 text-white" />
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-800 mb-2">{meal.name}</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                              <div>Calories: {meal.calories}</div>
                              <div>Protein: {meal.protein}g</div>
                              <div>Carbs: {meal.carbs}g</div>
                              <div>Fats: {meal.fats}g</div>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                meal.status === 'safe' ? 'bg-green-100 text-green-800' :
                                meal.status === 'moderate_risk' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {meal.status === 'safe' ? 'Safe' : 
                                 meal.status === 'moderate_risk' ? 'Moderate Risk' : 'High Risk'}
                              </span>
                              <button className="text-blue-600 hover:text-blue-800 text-sm">View Details</button>
                            </div>
                            <div className="text-xs text-gray-500">
                              Added by {meal.addedBy} on {meal.addedDate}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <Apple className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No meals added yet</p>
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
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg">
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
