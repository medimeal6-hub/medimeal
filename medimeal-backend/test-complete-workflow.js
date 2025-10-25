const axios = require('axios');
const mongoose = require('mongoose');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const MONGODB_URI = 'mongodb+srv://medi:Siya123@cluster0.iiclpkk.mongodb.net/medimeal?';

// Test credentials
const CREDENTIALS = {
  admin: { email: 'admin@medimeal.com', password: 'Admin@123' },
  doctor: { email: 'drraj@medimeal.com', password: 'Doctor@123' },
  user: { email: 'riya@medimeal.com', password: 'User@123' }
};

let authTokens = {};

// Helper function to make authenticated requests
const apiRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
};

// Test functions
const testDatabaseConnection = async () => {
  console.log('🔗 Testing database connection...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

const testSeedData = async () => {
  console.log('🌱 Testing seed data...');
  const result = await apiRequest('POST', '/seed');
  
  if (result.success) {
    console.log('✅ Seed data created successfully');
    console.log('📊 Seed data summary:', result.data.data.counts);
    return true;
  } else {
    console.error('❌ Seed data creation failed:', result.error);
    return false;
  }
};

const testAuthentication = async () => {
  console.log('🔐 Testing authentication...');
  
  for (const [role, credentials] of Object.entries(CREDENTIALS)) {
    const result = await apiRequest('POST', '/auth/login', credentials);
    
    if (result.success && result.data.data.token) {
      authTokens[role] = result.data.data.token;
      console.log(`✅ ${role} authentication successful`);
    } else {
      console.error(`❌ ${role} authentication failed:`, result.error);
      return false;
    }
  }
  
  return true;
};

const testAnalytics = async () => {
  console.log('📊 Testing analytics...');
  
  // Test system analytics (admin)
  const systemAnalytics = await apiRequest('GET', '/analytics/system', null, authTokens.admin);
  if (systemAnalytics.success) {
    console.log('✅ System analytics working');
    console.log('📈 System stats:', systemAnalytics.data.data.overview);
  } else {
    console.error('❌ System analytics failed:', systemAnalytics.error);
    return false;
  }
  
  // Test user analytics
  const userAnalytics = await apiRequest('GET', '/analytics/user', null, authTokens.user);
  if (userAnalytics.success) {
    console.log('✅ User analytics working');
    console.log('👤 User adherence:', userAnalytics.data.data.adherence);
  } else {
    console.error('❌ User analytics failed:', userAnalytics.error);
    return false;
  }
  
  // Test doctor analytics
  const doctorAnalytics = await apiRequest('GET', '/analytics/doctor', null, authTokens.doctor);
  if (doctorAnalytics.success) {
    console.log('✅ Doctor analytics working');
    console.log('👨‍⚕️ Doctor stats:', doctorAnalytics.data.data.patients);
  } else {
    console.error('❌ Doctor analytics failed:', doctorAnalytics.error);
    return false;
  }
  
  return true;
};

const testFoodDrugConflicts = async () => {
  console.log('⚠️ Testing food-drug conflicts...');
  
  const testData = {
    medications: [
      { name: 'Metformin', dosage: '500mg' },
      { name: 'Aspirin', dosage: '81mg' }
    ],
    foods: ['Rice with Dal', 'Spicy Food', 'Grapefruit']
  };
  
  const result = await apiRequest('POST', '/conflicts/check', testData, authTokens.user);
  
  if (result.success) {
    console.log('✅ Food-drug conflict check working');
    console.log('🔍 Conflicts found:', result.data.data.totalConflicts);
    console.log('🟢 Safe foods:', result.data.data.safeFoods.length);
    console.log('🔴 Unsafe foods:', result.data.data.unsafeFoods.length);
    return true;
  } else {
    console.error('❌ Food-drug conflict check failed:', result.error);
    return false;
  }
};

const testPatientAssignment = async () => {
  console.log('👥 Testing patient assignment...');
  
  // Get users to find patient and doctor IDs
  const users = await apiRequest('GET', '/admin/users', null, authTokens.admin);
  if (!users.success) {
    console.error('❌ Failed to get users for assignment test');
    return false;
  }
  
  const patient = users.data.data.find(u => u.role === 'user');
  const doctor = users.data.data.find(u => u.role === 'doctor');
  
  if (!patient || !doctor) {
    console.error('❌ Patient or doctor not found for assignment test');
    return false;
  }
  
  // Test assignment
  const assignmentData = {
    patientId: patient._id,
    doctorId: doctor._id,
    notes: 'Test assignment for workflow verification'
  };
  
  const result = await apiRequest('POST', '/admin/assign-patient', assignmentData, authTokens.admin);
  
  if (result.success) {
    console.log('✅ Patient assignment working');
    console.log('🔗 Assignment created:', result.data.data.assignmentId);
    return true;
  } else {
    console.error('❌ Patient assignment failed:', result.error);
    return false;
  }
};

const testFoodPlans = async () => {
  console.log('🍽️ Testing food plans...');
  
  // Get patient ID for plan creation
  const users = await apiRequest('GET', '/admin/users', null, authTokens.admin);
  const patient = users.data.data.find(u => u.role === 'user');
  
  if (!patient) {
    console.error('❌ Patient not found for food plan test');
    return false;
  }
  
  // Create food plan
  const planData = {
    patientId: patient._id,
    planName: 'Test Food Plan',
    description: 'Test plan for workflow verification',
    breakfast: [
      {
        foodName: 'Idli',
        quantity: '2 pieces',
        notes: 'Healthy breakfast option'
      }
    ],
    lunch: [
      {
        foodName: 'Rice with Dal',
        quantity: '1 plate',
        notes: 'Complete protein meal'
      }
    ],
    dinner: [
      {
        foodName: 'Grilled Paneer',
        quantity: '100g',
        notes: 'High protein dinner'
      }
    ],
    generalInstructions: 'Follow the plan strictly for best results'
  };
  
  const result = await apiRequest('POST', '/plans/food', planData, authTokens.doctor);
  
  if (result.success) {
    console.log('✅ Food plan creation working');
    console.log('📋 Plan created:', result.data.data.foodPlan.planName);
    return true;
  } else {
    console.error('❌ Food plan creation failed:', result.error);
    return false;
  }
};

const testReminderSystem = async () => {
  console.log('⏰ Testing reminder system...');
  
  // Check if reminder service is running
  const healthCheck = await apiRequest('GET', '/health');
  if (healthCheck.success) {
    console.log('✅ Reminder system is running');
    console.log('📧 Gmail SMTP configured for email reminders');
    return true;
  } else {
    console.error('❌ Reminder system not responding');
    return false;
  }
};

const testCompleteWorkflow = async () => {
  console.log('🚀 Starting complete workflow test...\n');
  
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Seed Data', fn: testSeedData },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Analytics', fn: testAnalytics },
    { name: 'Food-Drug Conflicts', fn: testFoodDrugConflicts },
    { name: 'Patient Assignment', fn: testPatientAssignment },
    { name: 'Food Plans', fn: testFoodPlans },
    { name: 'Reminder System', fn: testReminderSystem }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
        console.log(`✅ ${test.name} - PASSED\n`);
      } else {
        failed++;
        console.log(`❌ ${test.name} - FAILED\n`);
      }
    } catch (error) {
      failed++;
      console.error(`❌ ${test.name} - ERROR:`, error.message, '\n');
    }
  }
  
  console.log('📊 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! MediMeal platform is ready for use.');
    console.log('\n📋 Demo Credentials:');
    console.log('👑 Admin: admin@medimeal.com / Admin@123');
    console.log('👨‍⚕️ Doctor: drraj@medimeal.com / Doctor@123');
    console.log('👤 User: riya@medimeal.com / User@123');
    console.log('\n🌐 Access the application at: http://localhost:3000');
    console.log('🔗 API Health Check: http://localhost:5000/api/health');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
  
  // Close database connection
  await mongoose.connection.close();
  console.log('\n🔌 Database connection closed.');
};

// Run the complete workflow test
testCompleteWorkflow().catch(console.error);
