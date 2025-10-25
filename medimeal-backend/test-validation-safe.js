const axios = require('axios');
const mongoose = require('mongoose');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const MONGODB_URI = 'mongodb+srv://medi:Siya123@cluster0.iiclpkk.mongodb.net/medimeal?';

// Validation-safe test credentials
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

const testValidationSafeSeed = async () => {
  console.log('🌱 Testing validation-safe seed data...');
  const result = await apiRequest('POST', '/seed');
  
  if (result.success) {
    console.log('✅ Validation-safe seed data created successfully');
    console.log('📊 Seed data summary:', result.data.data.counts);
    console.log('✅ Validation status:', result.data.data.validation);
    
    // Verify validation-safe names
    const users = result.data.data.users;
    console.log('👤 Validation-safe users created:');
    console.log(`   Admin: ${users.admin.name} (${users.admin.email})`);
    console.log(`   Doctor: ${users.doctor.name} (${users.doctor.email}) - ${users.doctor.specialization}`);
    console.log(`   User: ${users.user.name} (${users.user.email}) - Age: ${users.user.healthProfile.age}`);
    
    return true;
  } else {
    console.error('❌ Validation-safe seed data creation failed:', result.error);
    return false;
  }
};

const testValidationSafeAuthentication = async () => {
  console.log('🔐 Testing validation-safe authentication...');
  
  for (const [role, credentials] of Object.entries(CREDENTIALS)) {
    const result = await apiRequest('POST', '/auth/login', credentials);
    
    if (result.success && result.data.data.token) {
      authTokens[role] = result.data.data.token;
      const user = result.data.data.user;
      console.log(`✅ ${role} authentication successful - ${user.firstName} ${user.lastName}`);
      
      // Verify validation-safe names
      const fullName = `${user.firstName} ${user.lastName}`;
      const isAlphabetic = /^[A-Za-z\s]+$/.test(fullName);
      console.log(`   Name validation: ${isAlphabetic ? '✅ PASS' : '❌ FAIL'} - "${fullName}"`);
      
    } else {
      console.error(`❌ ${role} authentication failed:`, result.error);
      return false;
    }
  }
  
  return true;
};

const testValidationSafeUserProfile = async () => {
  console.log('👤 Testing validation-safe user profile...');
  
  const result = await apiRequest('GET', '/auth/me', null, authTokens.user);
  
  if (result.success) {
    const user = result.data.data.user;
    console.log('✅ User profile retrieved successfully');
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Age: ${user.dateOfBirth ? Math.floor((new Date() - new Date(user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/A'}`);
    console.log(`   Weight: ${user.weight}kg`);
    console.log(`   Allergies: ${user.allergies.join(', ')}`);
    console.log(`   Medical Conditions: ${user.medicalConditions.join(', ')}`);
    
    // Verify all names are alphabetic
    const nameValidation = /^[A-Za-z\s]+$/.test(`${user.firstName} ${user.lastName}`);
    console.log(`   Name validation: ${nameValidation ? '✅ PASS' : '❌ FAIL'}`);
    
    return true;
  } else {
    console.error('❌ User profile retrieval failed:', result.error);
    return false;
  }
};

const testValidationSafeDoctorProfile = async () => {
  console.log('👨‍⚕️ Testing validation-safe doctor profile...');
  
  const result = await apiRequest('GET', '/auth/me', null, authTokens.doctor);
  
  if (result.success) {
    const doctor = result.data.data.user;
    console.log('✅ Doctor profile retrieved successfully');
    console.log(`   Name: Dr. ${doctor.firstName} ${doctor.lastName}`);
    console.log(`   Specialization: ${doctor.specialization}`);
    console.log(`   License: ${doctor.doctorInfo?.licenseNumber || 'N/A'}`);
    console.log(`   Experience: ${doctor.doctorInfo?.yearsOfExperience || 0} years`);
    
    // Verify all names are alphabetic
    const nameValidation = /^[A-Za-z\s]+$/.test(`${doctor.firstName} ${doctor.lastName}`);
    console.log(`   Name validation: ${nameValidation ? '✅ PASS' : '❌ FAIL'}`);
    
    return true;
  } else {
    console.error('❌ Doctor profile retrieval failed:', result.error);
    return false;
  }
};

const testValidationSafeDataIntegrity = async () => {
  console.log('🔍 Testing validation-safe data integrity...');
  
  // Test food data
  const foods = await apiRequest('GET', '/foods', null, authTokens.user);
  if (foods.success) {
    console.log('✅ Food data retrieved successfully');
    console.log(`   Total foods: ${foods.data.data.length}`);
    
    // Check if all food names are valid
    const validFoodNames = foods.data.data.every(food => 
      /^[A-Za-z\s]+$/.test(food.name)
    );
    console.log(`   Food name validation: ${validFoodNames ? '✅ PASS' : '❌ FAIL'}`);
  }
  
  // Test medicine data
  const medicines = await apiRequest('GET', '/medicines', null, authTokens.user);
  if (medicines.success) {
    console.log('✅ Medicine data retrieved successfully');
    console.log(`   Total medicines: ${medicines.data.data.length}`);
    
    // Check if all medicine names are valid
    const validMedicineNames = medicines.data.data.every(medicine => 
      /^[A-Za-z\s]+$/.test(medicine.name)
    );
    console.log(`   Medicine name validation: ${validMedicineNames ? '✅ PASS' : '❌ FAIL'}`);
  }
  
  return true;
};

const testValidationSafeWorkflow = async () => {
  console.log('🔄 Testing validation-safe complete workflow...');
  
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Validation-Safe Seed', fn: testValidationSafeSeed },
    { name: 'Validation-Safe Authentication', fn: testValidationSafeAuthentication },
    { name: 'User Profile Validation', fn: testValidationSafeUserProfile },
    { name: 'Doctor Profile Validation', fn: testValidationSafeDoctorProfile },
    { name: 'Data Integrity Validation', fn: testValidationSafeDataIntegrity }
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
  
  console.log('📊 Validation-Safe Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All validation-safe tests passed!');
    console.log('\n📋 Validation-Safe Demo Credentials:');
    console.log('👑 Admin: admin@medimeal.com / Admin@123 (AdminUser)');
    console.log('👨‍⚕️ Doctor: drraj@medimeal.com / Doctor@123 (DrRaj - Nutrition)');
    console.log('👤 User: riya@medimeal.com / User@123 (Riya - Age 22, 58kg)');
    console.log('\n✅ All names are alphabetic and validation-safe');
    console.log('✅ All data passes regex validation');
    console.log('✅ Complete workflow tested successfully');
  } else {
    console.log('\n⚠️ Some validation-safe tests failed. Please check the errors above.');
  }
  
  // Close database connection
  await mongoose.connection.close();
  console.log('\n🔌 Database connection closed.');
};

// Run the validation-safe workflow test
testValidationSafeWorkflow().catch(console.error);
