const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');

const updateDoctorPasswords = async () => {
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

    // Update password for all doctors
    const newPassword = 'Medi@123';
    console.log(`🔐 Updating passwords to: ${newPassword}`);
    
    let updatedCount = 0;
    for (const doctor of doctors) {
      try {
        // Update the password (it will be hashed by the model's pre-save middleware)
        doctor.password = newPassword;
        await doctor.save();
        
        console.log(`✅ Updated password for: ${doctor.email} (${doctor.firstName} ${doctor.lastName})`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Failed to update password for ${doctor.email}:`, error.message);
      }
    }

    console.log(`\n🎉 Password update completed!`);
    console.log(`📊 Successfully updated: ${updatedCount}/${doctors.length} doctors`);
    
    // Display all doctors with their credentials
    console.log('\n🔑 Doctor Credentials:');
    console.log('='.repeat(50));
    for (const doctor of doctors) {
      console.log(`👨‍⚕️ ${doctor.firstName} ${doctor.lastName}`);
      console.log(`   Email: ${doctor.email}`);
      console.log(`   Password: ${newPassword}`);
      console.log(`   Specialization: ${doctor.specialization || 'Not specified'}`);
      console.log(`   Status: ${doctor.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   Role: ${doctor.role}`);
      console.log('-'.repeat(30));
    }

    // Verify the updates
    console.log('\n🔍 Verifying password updates...');
    const verifyDoctors = await User.find({ role: 'doctor' });
    for (const doctor of verifyDoctors) {
      const isPasswordValid = await bcrypt.compare(newPassword, doctor.password);
      console.log(`${isPasswordValid ? '✅' : '❌'} ${doctor.email}: Password ${isPasswordValid ? 'verified' : 'verification failed'}`);
    }

  } catch (error) {
    console.error('❌ Error updating doctor passwords:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run if this file is executed directly
if (require.main === module) {
  updateDoctorPasswords();
}

module.exports = { updateDoctorPasswords };
