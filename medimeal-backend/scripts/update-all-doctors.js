const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');

const updateAllDoctors = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medimeal', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find all doctors
    console.log('🔍 Finding all doctors...');
    const doctors = await User.find({ role: 'doctor' });
    console.log(`📊 Found ${doctors.length} doctors`);

    if (doctors.length === 0) {
      console.log('❌ No doctors found in the database');
      return;
    }

    // Update each doctor
    const newPassword = 'medi@123';
    console.log(`🔐 Updating passwords to: ${newPassword}`);
    console.log(`📧 Updating emails to: {name}-doctor@medi.com format`);
    
    let updatedCount = 0;
    for (const doctor of doctors) {
      try {
        // Create new email format: {firstName-lastName}-doctor@medi.com
        const firstName = doctor.firstName.toLowerCase().replace(/\s+/g, '');
        const lastName = doctor.lastName.toLowerCase().replace(/\s+/g, '');
        const newEmail = `${firstName}-${lastName}-doctor@medi.com`;
        
        // Update the doctor
        doctor.password = newPassword;
        doctor.email = newEmail;
        await doctor.save();
        
        console.log(`✅ Updated: ${doctor.firstName} ${doctor.lastName}`);
        console.log(`   Old Email: ${doctor.email}`);
        console.log(`   New Email: ${newEmail}`);
        console.log(`   Password: ${newPassword}`);
        console.log(`   Specialization: ${doctor.specialization || 'Not specified'}`);
        console.log('-'.repeat(50));
        updatedCount++;
      } catch (error) {
        console.error(`❌ Failed to update ${doctor.firstName} ${doctor.lastName}:`, error.message);
      }
    }

    console.log(`\n🎉 Update completed!`);
    console.log(`📊 Successfully updated: ${updatedCount}/${doctors.length} doctors`);
    
    // Display all doctors with their new credentials
    console.log('\n🔑 Updated Doctor Credentials:');
    console.log('='.repeat(60));
    const updatedDoctors = await User.find({ role: 'doctor' });
    for (const doctor of updatedDoctors) {
      console.log(`👨‍⚕️ ${doctor.firstName} ${doctor.lastName}`);
      console.log(`   Email: ${doctor.email}`);
      console.log(`   Password: ${newPassword}`);
      console.log(`   Specialization: ${doctor.specialization || 'Not specified'}`);
      console.log(`   Status: ${doctor.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   Role: ${doctor.role}`);
      console.log('-'.repeat(30));
    }

    // Test login for one doctor
    console.log('\n🧪 Testing login for first doctor...');
    if (updatedDoctors.length > 0) {
      const testDoctor = updatedDoctors[0];
      const isPasswordValid = await bcrypt.compare(newPassword, testDoctor.password);
      console.log(`${isPasswordValid ? '✅' : '❌'} Login test: ${testDoctor.email} - Password ${isPasswordValid ? 'verified' : 'failed'}`);
    }

  } catch (error) {
    console.error('❌ Error updating doctors:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run if this file is executed directly
if (require.main === module) {
  updateAllDoctors();
}

module.exports = { updateAllDoctors };





