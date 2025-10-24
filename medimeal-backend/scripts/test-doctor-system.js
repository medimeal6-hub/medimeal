const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_ADMIN_EMAIL = 'admin@test.com';
const TEST_ADMIN_PASSWORD = 'Admin123!';
const TEST_DOCTOR_EMAIL = 'doctor@test.com';
const TEST_DOCTOR_PASSWORD = 'Doctor123!';
const TEST_PATIENT_EMAIL = 'patient@test.com';
const TEST_PATIENT_PASSWORD = 'Patient123!';

let adminToken = '';
let doctorToken = '';
let patientId = '';
let doctorId = '';

// Helper function to make API requests
const apiRequest = async (method, endpoint, data = null, token = null) => {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status 
    };
  }
};

// Test 1: Create Admin User
const createAdminUser = async () => {
  console.log('\n🔧 Test 1: Creating Admin User...');
  
  const adminData = {
    firstName: 'Admin',
    lastName: 'User',
    email: TEST_ADMIN_EMAIL,
    password: TEST_ADMIN_PASSWORD,
    role: 'admin'
  };

  const result = await apiRequest('POST', '/auth/register', adminData);
  
  if (result.success) {
    console.log('✅ Admin user created successfully');
    adminToken = result.data.data.token;
    return true;
  } else {
    console.log('❌ Failed to create admin user:', result.error);
    return false;
  }
};

// Test 2: Admin Login
const adminLogin = async () => {
  console.log('\n🔧 Test 2: Admin Login...');
  
  const loginData = {
    email: TEST_ADMIN_EMAIL,
    password: TEST_ADMIN_PASSWORD
  };

  const result = await apiRequest('POST', '/auth/login', loginData);
  
  if (result.success) {
    console.log('✅ Admin login successful');
    adminToken = result.data.data.token;
    return true;
  } else {
    console.log('❌ Admin login failed:', result.error);
    return false;
  }
};

// Test 3: Create Patient User
const createPatientUser = async () => {
  console.log('\n🔧 Test 3: Creating Patient User...');
  
  const patientData = {
    firstName: 'John',
    lastName: 'Doe',
    email: TEST_PATIENT_EMAIL,
    password: TEST_PATIENT_PASSWORD,
    role: 'user',
    dateOfBirth: '1990-01-01',
    gender: 'male'
  };

  const result = await apiRequest('POST', '/auth/register', patientData);
  
  if (result.success) {
    console.log('✅ Patient user created successfully');
    patientId = result.data.data.user._id;
    return true;
  } else {
    console.log('❌ Failed to create patient user:', result.error);
    return false;
  }
};

// Test 4: Create Doctor (by Admin)
const createDoctor = async () => {
  console.log('\n🔧 Test 4: Creating Doctor (by Admin)...');
  
  const doctorData = {
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    email: TEST_DOCTOR_EMAIL,
    password: TEST_DOCTOR_PASSWORD,
    specialization: 'Cardiology',
    phoneNumber: '+1234567890',
    licenseNumber: 'MD123456',
    hospitalAffiliation: 'General Hospital',
    yearsOfExperience: 10,
    bio: 'Experienced cardiologist with 10 years of practice',
    languages: ['English', 'Spanish'],
    consultationFee: 150,
    availability: 'full-time',
    emergencyContact: 'Emergency Contact',
    emergencyPhone: '+1234567891'
  };

  const result = await apiRequest('POST', '/admin/doctors', doctorData, adminToken);
  
  if (result.success) {
    console.log('✅ Doctor created successfully');
    doctorId = result.data.data.user._id;
    return true;
  } else {
    console.log('❌ Failed to create doctor:', result.error);
    return false;
  }
};

// Test 5: Doctor Login
const doctorLogin = async () => {
  console.log('\n🔧 Test 5: Doctor Login...');
  
  const loginData = {
    email: TEST_DOCTOR_EMAIL,
    password: TEST_DOCTOR_PASSWORD
  };

  const result = await apiRequest('POST', '/auth/login', loginData);
  
  if (result.success) {
    console.log('✅ Doctor login successful');
    doctorToken = result.data.data.token;
    console.log('👨‍⚕️ Doctor role:', result.data.data.user.role);
    return true;
  } else {
    console.log('❌ Doctor login failed:', result.error);
    return false;
  }
};

// Test 6: Assign Patient to Doctor
const assignPatientToDoctor = async () => {
  console.log('\n🔧 Test 6: Assigning Patient to Doctor...');
  
  const assignmentData = {
    patientId: patientId,
    doctorId: doctorId,
    wardNumber: '#123456',
    priority: 'high',
    diagnosis: 'Chest pain, possible cardiac issue',
    treatmentPlan: 'Monitor vitals, ECG, blood tests',
    notes: 'Patient reported chest pain during exercise'
  };

  const result = await apiRequest('POST', '/admin/assign-patient', assignmentData, adminToken);
  
  if (result.success) {
    console.log('✅ Patient assigned to doctor successfully');
    console.log('📋 Assignment details:', {
      wardNumber: result.data.data.wardNumber,
      priority: result.data.data.priority,
      diagnosis: result.data.data.diagnosis
    });
    return true;
  } else {
    console.log('❌ Failed to assign patient:', result.error);
    return false;
  }
};

// Test 7: Create Doctor Schedule
const createDoctorSchedule = async () => {
  console.log('\n🔧 Test 7: Creating Doctor Schedule...');
  
  const today = new Date();
  const scheduleData = {
    doctorId: doctorId,
    date: today.toISOString().split('T')[0],
    timeSlots: [
      {
        startTime: '09:00',
        endTime: '11:00',
        activity: 'checkup',
        title: 'Check up patient',
        patientId: patientId,
        wardNumber: '#123456',
        priority: 'high',
        status: 'scheduled',
        description: 'Regular checkup for assigned patient'
      },
      {
        startTime: '11:00',
        endTime: '12:00',
        activity: 'lunch',
        title: 'Lunch Break',
        status: 'scheduled',
        description: 'Lunch break'
      },
      {
        startTime: '12:00',
        endTime: '16:00',
        activity: 'surgery',
        title: 'Heart Surgery',
        patientId: patientId,
        wardNumber: '#123456',
        priority: 'critical',
        status: 'scheduled',
        description: 'Scheduled heart surgery'
      }
    ]
  };

  const result = await apiRequest('POST', '/admin/doctor-schedule', scheduleData, adminToken);
  
  if (result.success) {
    console.log('✅ Doctor schedule created successfully');
    console.log('📅 Schedule details:', {
      date: result.data.data.date,
      totalSlots: result.data.data.totalSlots,
      totalHours: result.data.data.totalHours
    });
    return true;
  } else {
    console.log('❌ Failed to create doctor schedule:', result.error);
    return false;
  }
};

// Test 8: Get Doctor Dashboard Data
const getDoctorDashboard = async () => {
  console.log('\n🔧 Test 8: Getting Doctor Dashboard Data...');
  
  const result = await apiRequest('GET', '/doctor/dashboard', null, doctorToken);
  
  if (result.success) {
    console.log('✅ Doctor dashboard data retrieved successfully');
    console.log('📊 Dashboard stats:', {
      totalPatients: result.data.data.stats.totalPatients,
      completedToday: result.data.data.stats.completedToday,
      pendingToday: result.data.data.stats.pendingToday,
      priorityBreakdown: result.data.data.stats.priorityBreakdown
    });
    console.log('👥 Assigned patients:', result.data.data.assignedPatients.length);
    console.log('📅 Today schedule:', result.data.data.todaySchedule ? 'Available' : 'Not available');
    return true;
  } else {
    console.log('❌ Failed to get doctor dashboard:', result.error);
    return false;
  }
};

// Test 9: Get Doctor Patients
const getDoctorPatients = async () => {
  console.log('\n🔧 Test 9: Getting Doctor Patients...');
  
  const result = await apiRequest('GET', '/doctor/patients', null, doctorToken);
  
  if (result.success) {
    console.log('✅ Doctor patients retrieved successfully');
    console.log('👥 Patient count:', result.data.data.length);
    if (result.data.data.length > 0) {
      console.log('📋 First patient:', {
        name: result.data.data[0].name,
        wardNumber: result.data.data[0].wardNumber,
        priority: result.data.data[0].priority,
        status: result.data.data[0].status
      });
    }
    return true;
  } else {
    console.log('❌ Failed to get doctor patients:', result.error);
    return false;
  }
};

// Test 10: Get Doctor Schedule
const getDoctorSchedule = async () => {
  console.log('\n🔧 Test 10: Getting Doctor Schedule...');
  
  const result = await apiRequest('GET', '/doctor/schedule', null, doctorToken);
  
  if (result.success) {
    console.log('✅ Doctor schedule retrieved successfully');
    console.log('📅 Schedule count:', result.data.data.length);
    if (result.data.data.length > 0) {
      console.log('⏰ First schedule:', {
        date: result.data.data[0].date,
        totalSlots: result.data.data[0].totalSlots,
        totalHours: result.data.data[0].totalHours
      });
    }
    return true;
  } else {
    console.log('❌ Failed to get doctor schedule:', result.error);
    return false;
  }
};

// Test 11: Update Patient Assignment
const updatePatientAssignment = async () => {
  console.log('\n🔧 Test 11: Updating Patient Assignment...');
  
  // First get the assignment ID
  const assignmentsResult = await apiRequest('GET', '/admin/patient-assignments', null, adminToken);
  
  if (!assignmentsResult.success || assignmentsResult.data.data.length === 0) {
    console.log('❌ No assignments found to update');
    return false;
  }

  const assignmentId = assignmentsResult.data.data[0].id;
  
  const updateData = {
    diagnosis: 'Updated diagnosis: Stable condition, continue monitoring',
    treatmentPlan: 'Updated plan: Continue current medication, follow up in 1 week',
    notes: 'Patient responding well to treatment',
    priority: 'medium'
  };

  const result = await apiRequest('PATCH', `/admin/patient-assignments/${assignmentId}`, updateData, adminToken);
  
  if (result.success) {
    console.log('✅ Patient assignment updated successfully');
    console.log('📝 Updated details:', {
      diagnosis: result.data.data.diagnosis,
      priority: result.data.data.priority
    });
    return true;
  } else {
    console.log('❌ Failed to update patient assignment:', result.error);
    return false;
  }
};

// Test 12: Get Admin Dashboard Stats
const getAdminDashboardStats = async () => {
  console.log('\n🔧 Test 12: Getting Admin Dashboard Stats...');
  
  const result = await apiRequest('GET', '/admin/dashboard-stats', null, adminToken);
  
  if (result.success) {
    console.log('✅ Admin dashboard stats retrieved successfully');
    console.log('📊 System stats:', {
      totalUsers: result.data.data.totalUsers,
      totalDoctors: result.data.data.totalDoctors,
      activeUsers: result.data.data.activeUsers,
      activeDoctors: result.data.data.activeDoctors
    });
    console.log('🏥 Hospital stats:', {
      beds: result.data.data.hospitalStats.beds,
      doctors: result.data.data.hospitalStats.doctors,
      ambulances: result.data.data.hospitalStats.ambulances
    });
    console.log('👥 Patient assignments:', result.data.data.patientAssignments);
    return true;
  } else {
    console.log('❌ Failed to get admin dashboard stats:', result.error);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Doctor Dashboard System Tests...\n');
  
  const tests = [
    { name: 'Create Admin User', fn: createAdminUser },
    { name: 'Admin Login', fn: adminLogin },
    { name: 'Create Patient User', fn: createPatientUser },
    { name: 'Create Doctor', fn: createDoctor },
    { name: 'Doctor Login', fn: doctorLogin },
    { name: 'Assign Patient to Doctor', fn: assignPatientToDoctor },
    { name: 'Create Doctor Schedule', fn: createDoctorSchedule },
    { name: 'Get Doctor Dashboard', fn: getDoctorDashboard },
    { name: 'Get Doctor Patients', fn: getDoctorPatients },
    { name: 'Get Doctor Schedule', fn: getDoctorSchedule },
    { name: 'Update Patient Assignment', fn: updatePatientAssignment },
    { name: 'Get Admin Dashboard Stats', fn: getAdminDashboardStats }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} failed with error:`, error.message);
      failed++;
    }
  }

  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Doctor dashboard system is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  apiRequest,
  BASE_URL,
  TEST_ADMIN_EMAIL,
  TEST_DOCTOR_EMAIL,
  TEST_PATIENT_EMAIL
};




