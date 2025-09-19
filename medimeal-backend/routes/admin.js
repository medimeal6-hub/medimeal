const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// All admin routes require auth and admin role
router.use(auth, authorize('admin'));

// GET /api/admin/users - list all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('+isActive');
    res.json({ success: true, data: users.map(u => u.getProfile ? u.getProfile() : {
      _id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    }) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// POST /api/admin/doctors - create a doctor account
router.post('/doctors', async (req, res) => {
  try {
    const { 
      fullName, 
      firstName: fn, 
      lastName: ln, 
      email, 
      password, 
      specialization = '',
      phoneNumber,
      licenseNumber,
      hospitalAffiliation,
      yearsOfExperience,
      bio,
      languages = [],
      consultationFee,
      availability = 'full-time',
      emergencyContact,
      emergencyPhone
    } = req.body;

    // Validation
    if ((!fullName && !fn) || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'First name, last name, email, and password are required' 
      });
    }

    if (!specialization) {
      return res.status(400).json({ 
        success: false, 
        message: 'Medical specialization is required' 
      });
    }

    if (!licenseNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Medical license number is required' 
      });
    }

    // Check for existing user
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Derive first/last name
    let firstName = (fn || '').trim();
    let lastName = (ln || '').trim();
    if (fullName && (!firstName || !lastName)) {
      const parts = fullName.trim().split(/\s+/);
      firstName = firstName || parts[0] || 'User';
      lastName = lastName || parts.slice(1).join(' ') || 'User';
    }

    // Clean and enforce model constraints
    firstName = firstName.replace(/[^A-Za-z\s]/g, '').slice(0, 50) || 'User';
    lastName = lastName.replace(/[^A-Za-z\s]/g, '').slice(0, 50) || 'User';

    // Prepare user data
    const userData = { 
      firstName, 
      lastName, 
      email, 
      password, 
      role: 'doctor', 
      specialization,
      // Store additional doctor information in a separate field or extend the model
      doctorInfo: {
        phoneNumber: phoneNumber || '',
        licenseNumber: licenseNumber || '',
        hospitalAffiliation: hospitalAffiliation || '',
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : 0,
        bio: bio || '',
        languages: Array.isArray(languages) ? languages : [],
        consultationFee: consultationFee ? parseFloat(consultationFee) : 0,
        availability: availability || 'full-time',
        emergencyContact: emergencyContact || '',
        emergencyPhone: emergencyPhone || '',
        createdAt: new Date(),
        isVerified: false
      }
    };

    const user = new User(userData);
    await user.save();

    res.status(201).json({ 
      success: true, 
      message: 'Doctor created successfully', 
      data: { 
        user: user.getProfile(),
        doctorInfo: user.doctorInfo
      } 
    });
  } catch (error) {
    console.error('Doctor creation error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors 
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Failed to create doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/admin/doctors - fetch all doctors with their detailed information
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('firstName lastName email specialization doctorInfo isActive createdAt')
      .sort({ createdAt: -1 });

    const doctorsWithInfo = doctors.map(doctor => ({
      id: doctor._id,
      name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      email: doctor.email,
      specialization: doctor.specialization,
      phoneNumber: doctor.doctorInfo?.phoneNumber || '',
      licenseNumber: doctor.doctorInfo?.licenseNumber || '',
      hospitalAffiliation: doctor.doctorInfo?.hospitalAffiliation || '',
      yearsOfExperience: doctor.doctorInfo?.yearsOfExperience || 0,
      bio: doctor.doctorInfo?.bio || '',
      languages: doctor.doctorInfo?.languages || [],
      consultationFee: doctor.doctorInfo?.consultationFee || 0,
      availability: doctor.doctorInfo?.availability || 'full-time',
      emergencyContact: doctor.doctorInfo?.emergencyContact || '',
      emergencyPhone: doctor.doctorInfo?.emergencyPhone || '',
      isVerified: doctor.doctorInfo?.isVerified || false,
      rating: doctor.doctorInfo?.rating || 0,
      totalReviews: doctor.doctorInfo?.totalReviews || 0,
      status: doctor.isActive ? 'active' : 'inactive',
      createdAt: doctor.createdAt,
      lastActive: 'Recently' // This could be enhanced with actual last login tracking
    }));

    res.status(200).json({ 
      success: true, 
      data: doctorsWithInfo,
      count: doctorsWithInfo.length
    });
  } catch (error) {
    console.error('Fetch doctors error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch doctors' 
    });
  }
});

// GET /api/admin/doctors/:id - fetch specific doctor details
router.get('/doctors/:id', async (req, res) => {
  try {
    const doctor = await User.findOne({ 
      _id: req.params.id, 
      role: 'doctor' 
    }).select('firstName lastName email specialization doctorInfo isActive createdAt');

    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }

    const doctorInfo = {
      id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      specialization: doctor.specialization,
      phoneNumber: doctor.doctorInfo?.phoneNumber || '',
      licenseNumber: doctor.doctorInfo?.licenseNumber || '',
      hospitalAffiliation: doctor.doctorInfo?.hospitalAffiliation || '',
      yearsOfExperience: doctor.doctorInfo?.yearsOfExperience || 0,
      bio: doctor.doctorInfo?.bio || '',
      languages: doctor.doctorInfo?.languages || [],
      consultationFee: doctor.doctorInfo?.consultationFee || 0,
      availability: doctor.doctorInfo?.availability || 'full-time',
      emergencyContact: doctor.doctorInfo?.emergencyContact || '',
      emergencyPhone: doctor.doctorInfo?.emergencyPhone || '',
      isVerified: doctor.doctorInfo?.isVerified || false,
      rating: doctor.doctorInfo?.rating || 0,
      totalReviews: doctor.doctorInfo?.totalReviews || 0,
      status: doctor.isActive ? 'active' : 'inactive',
      createdAt: doctor.createdAt
    };

    res.status(200).json({ 
      success: true, 
      data: doctorInfo
    });
  } catch (error) {
    console.error('Fetch doctor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch doctor details' 
    });
  }
});

// GET /api/admin/dashboard-stats - get admin dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    // Get user counts by role
    const userCounts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object format
    const roleCounts = userCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Get active users count
    const activeUsers = await User.countDocuments({ isActive: true });

    // Get doctors with detailed info
    const doctorsCount = await User.countDocuments({ role: 'doctor' });
    const activeDoctors = await User.countDocuments({ role: 'doctor', isActive: true });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get users by registration month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format monthly data for charts
    const monthlyData = monthlyRegistrations.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      users: item.count
    }));

    // Get system health metrics
    const systemHealth = {
      totalUsers: roleCounts.user || 0,
      totalDoctors: doctorsCount,
      activeUsers,
      activeDoctors,
      recentRegistrations,
      userGrowthRate: recentRegistrations > 0 ? ((recentRegistrations / (roleCounts.user || 1)) * 100).toFixed(1) : '0',
      systemUptime: '99.9%', // This could be calculated from actual system metrics
      responseTime: '0.3s' // This could be calculated from actual API response times
    };

    res.status(200).json({
      success: true,
      data: {
        ...systemHealth,
        roleBreakdown: {
          users: roleCounts.user || 0,
          doctors: roleCounts.doctor || 0,
          admins: roleCounts.admin || 0
        },
        monthlyRegistrations: monthlyData,
        charts: {
          userEngagement: [78, 82, 85, 88, 90, 87, 89], // Sample data for charts
          dietCompliance: [65, 72, 78, 82, 85, 88, 85], // Sample data for charts
          conflictTrends: [12, 8, 15, 10, 7, 9, 11] // Sample data for charts
        }
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/admin/prescriptions - get all prescriptions
router.get('/prescriptions', async (req, res) => {
  try {
    // This would typically fetch from a Prescription model
    // For now, returning sample data
    const samplePrescriptions = [
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
    ];

    res.status(200).json({
      success: true,
      data: samplePrescriptions
    });
  } catch (error) {
    console.error('Fetch prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions'
    });
  }
});

// GET /api/admin/meals - get all meals
router.get('/meals', async (req, res) => {
  try {
    // This would typically fetch from a Meal model
    // For now, returning sample data
    const sampleMeals = [
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
      }
    ];

    res.status(200).json({
      success: true,
      data: sampleMeals
    });
  } catch (error) {
    console.error('Fetch meals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meals'
    });
  }
});

// GET /api/admin/conflicts - get all food-drug conflicts
router.get('/conflicts', async (req, res) => {
  try {
    // This would typically fetch from a Conflict model
    // For now, returning sample data
    const sampleConflicts = [
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
      }
    ];

    res.status(200).json({
      success: true,
      data: sampleConflicts
    });
  } catch (error) {
    console.error('Fetch conflicts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conflicts'
    });
  }
});

// GET /api/admin/alerts - get all alerts
router.get('/alerts', async (req, res) => {
  try {
    // This would typically fetch from an Alert model
    // For now, returning sample data
    const sampleAlerts = [
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
      }
    ];

    res.status(200).json({
      success: true,
      data: sampleAlerts
    });
  } catch (error) {
    console.error('Fetch alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts'
    });
  }
});

// GET /api/admin/guardians - get all guardians
router.get('/guardians', async (req, res) => {
  try {
    // This would typically fetch from a Guardian model
    // For now, returning sample data
    const sampleGuardians = [
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
    ];

    res.status(200).json({
      success: true,
      data: sampleGuardians
    });
  } catch (error) {
    console.error('Fetch guardians error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guardians'
    });
  }
});

// GET /api/admin/reports - get all reports
router.get('/reports', async (req, res) => {
  try {
    // This would typically fetch from a Report model
    // For now, returning sample data
    const sampleReports = [
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
    ];

    res.status(200).json({
      success: true,
      data: sampleReports
    });
  } catch (error) {
    console.error('Fetch reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
});

// GET /api/admin/myth-busters - get all myth busters
router.get('/myth-busters', async (req, res) => {
  try {
    // This would typically fetch from a MythBuster model
    // For now, returning sample data
    const sampleMythBusters = [
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
    ];

    res.status(200).json({
      success: true,
      data: sampleMythBusters
    });
  } catch (error) {
    console.error('Fetch myth busters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch myth busters'
    });
  }
});

// PATCH /api/admin/users/:id/role - update a user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Role updated', data: { user: user.getProfile ? user.getProfile() : {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    } } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update role' });
  }
});

// PATCH /api/admin/users/:id/status - activate/deactivate user
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Status updated', data: { user: user.getProfile ? user.getProfile() : {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    } } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// PATCH /api/admin/users/:id/specialization - update doctor's specialization
router.patch('/users/:id/specialization', async (req, res) => {
  try {
    const { specialization = '' } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role !== 'doctor') {
      return res.status(400).json({ success: false, message: 'Specialization applicable only to doctor role' });
    }
    user.specialization = specialization;
    await user.save();
    return res.json({ success: true, message: 'Specialization updated', data: { user: user.getProfile ? user.getProfile() : {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      specialization: user.specialization
    } } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update specialization' });
  }
});

module.exports = router;


