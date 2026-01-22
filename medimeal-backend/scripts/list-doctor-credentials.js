const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');

const listAllDoctorCredentials = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medimeal', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find all doctors
    const doctors = await User.find({ role: 'doctor' });
    console.log(`📊 Found ${doctors.length} doctors\n`);

    console.log('🔑 ALL DOCTOR CREDENTIALS:');
    console.log('='.repeat(80));
    console.log('📧 Email Format: {firstname-lastname}-doctor@medi.com');
    console.log('🔐 Password: medi@123');
    console.log('🎯 Dashboard: http://localhost:3000/doctor');
    console.log('='.repeat(80));
    
    doctors.forEach((doctor, index) => {
      console.log(`${index + 1}. 👨‍⚕️ ${doctor.firstName} ${doctor.lastName}`);
      console.log(`   📧 Email: ${doctor.email}`);
      console.log(`   🔐 Password: medi@123`);
      console.log(`   🏥 Specialization: ${doctor.specialization || 'Not specified'}`);
      console.log(`   📊 Status: ${doctor.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   🎯 Dashboard URL: http://localhost:3000/doctor`);
      console.log('-'.repeat(60));
    });

    console.log('\n🚀 LOGIN INSTRUCTIONS:');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Use any doctor email from the list above');
    console.log('3. Password: medi@123');
    console.log('4. You will be automatically redirected to the doctor dashboard');
    console.log('\n✅ All doctors can now log in successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run if this file is executed directly
if (require.main === module) {
  listAllDoctorCredentials();
}

module.exports = { listAllDoctorCredentials };





