const axios = require('axios');

const testDoctorLogin = async () => {
  try {
    console.log('🧪 Testing doctor login...');
    
    // Test with one of the doctor credentials
    const testCredentials = {
      email: 'nikhil-shijo-doctor@medi.com',
      password: 'medi@123'
    };
    
    console.log('📧 Testing with:', testCredentials.email);
    console.log('🔐 Password:', testCredentials.password);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', testCredentials);
    
    if (response.data.success) {
      console.log('✅ Login successful!');
      console.log('👤 User role:', response.data.data.user.role);
      console.log('👤 User name:', response.data.data.user.firstName, response.data.data.user.lastName);
      console.log('🔑 Token received:', !!response.data.data.token);
      
      if (response.data.data.user.role === 'doctor') {
        console.log('🎯 Doctor role detected - should redirect to /doctor dashboard');
      } else {
        console.log('⚠️ Warning: User role is not "doctor"');
      }
    } else {
      console.log('❌ Login failed:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
};

// Run the test
testDoctorLogin();





