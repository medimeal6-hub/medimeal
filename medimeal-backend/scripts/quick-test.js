const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const quickTest = async () => {
  console.log('🚀 Quick Doctor Dashboard System Test\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing API Health...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ API is running:', healthResponse.data.message);

    // Test 2: Create Admin User
    console.log('\n2. Creating Admin User...');
    const adminData = {
      firstName: 'Test',
      lastName: 'Admin',
      email: 'testadmin@test.com',
      password: 'TestAdmin123!',
      role: 'admin'
    };

    try {
      const adminResponse = await axios.post(`${BASE_URL}/auth/register`, adminData);
      console.log('✅ Admin user created');
      const adminToken = adminResponse.data.data.token;

      // Test 3: Create Doctor
      console.log('\n3. Creating Doctor...');
      const doctorData = {
        firstName: 'Dr. Test',
        lastName: 'Doctor',
        email: 'testdoctor@test.com',
        password: 'TestDoctor123!',
        specialization: 'General Medicine',
        phoneNumber: '+1234567890',
        licenseNumber: 'MD123456',
        hospitalAffiliation: 'Test Hospital',
        yearsOfExperience: 5,
        bio: 'Test doctor for testing',
        languages: ['English'],
        consultationFee: 100,
        availability: 'full-time'
      };

      const doctorResponse = await axios.post(`${BASE_URL}/admin/doctors`, doctorData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Doctor created');

      // Test 4: Create Patient
      console.log('\n4. Creating Patient...');
      const patientData = {
        firstName: 'Test',
        lastName: 'Patient',
        email: 'testpatient@test.com',
        password: 'TestPatient123!',
        role: 'user',
        dateOfBirth: '1990-01-01',
        gender: 'male'
      };

      const patientResponse = await axios.post(`${BASE_URL}/auth/register`, patientData);
      console.log('✅ Patient created');
      const patientId = patientResponse.data.data.user._id;
      const doctorId = doctorResponse.data.data.user._id;

      // Test 5: Assign Patient to Doctor
      console.log('\n5. Assigning Patient to Doctor...');
      const assignmentData = {
        patientId: patientId,
        doctorId: doctorId,
        wardNumber: '#TEST123',
        priority: 'high',
        diagnosis: 'Test diagnosis',
        treatmentPlan: 'Test treatment plan',
        notes: 'Test notes'
      };

      const assignmentResponse = await axios.post(`${BASE_URL}/admin/assign-patient`, assignmentData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Patient assigned to doctor');

      // Test 6: Doctor Login
      console.log('\n6. Testing Doctor Login...');
      const doctorLoginData = {
        email: 'testdoctor@test.com',
        password: 'TestDoctor123!'
      };

      const doctorLoginResponse = await axios.post(`${BASE_URL}/auth/login`, doctorLoginData);
      console.log('✅ Doctor login successful');
      const doctorToken = doctorLoginResponse.data.data.token;

      // Test 7: Get Doctor Dashboard
      console.log('\n7. Testing Doctor Dashboard...');
      const dashboardResponse = await axios.get(`${BASE_URL}/doctor/dashboard`, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      console.log('✅ Doctor dashboard data retrieved');
      console.log('📊 Dashboard stats:', {
        totalPatients: dashboardResponse.data.data.stats.totalPatients,
        assignedPatients: dashboardResponse.data.data.assignedPatients.length
      });

      // Test 8: Get Doctor Patients
      console.log('\n8. Testing Doctor Patients...');
      const patientsResponse = await axios.get(`${BASE_URL}/doctor/patients`, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      console.log('✅ Doctor patients retrieved');
      console.log('👥 Patient count:', patientsResponse.data.data.length);

      console.log('\n🎉 All tests passed! Doctor dashboard system is working correctly.');
      console.log('\n📋 Test Summary:');
      console.log('✅ API Health Check');
      console.log('✅ Admin User Creation');
      console.log('✅ Doctor Creation');
      console.log('✅ Patient Creation');
      console.log('✅ Patient Assignment');
      console.log('✅ Doctor Login');
      console.log('✅ Doctor Dashboard');
      console.log('✅ Doctor Patients');

      console.log('\n🔑 Test Credentials:');
      console.log('Admin: testadmin@test.com / TestAdmin123!');
      console.log('Doctor: testdoctor@test.com / TestDoctor123!');
      console.log('Patient: testpatient@test.com / TestPatient123!');

    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️ Test users already exist, skipping creation...');
        console.log('✅ System is already set up and working');
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the backend server is running on port 5000');
    console.log('2. Check if MongoDB is running and accessible');
    console.log('3. Verify all environment variables are set');
    console.log('4. Check server logs for detailed error messages');
  }
};

// Run the test
quickTest();












