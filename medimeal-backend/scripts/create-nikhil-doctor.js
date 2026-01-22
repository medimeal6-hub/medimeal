const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const createNikhilDoctor = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medimeal', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if doctor already exists
    const existingDoctor = await User.findOne({ email: 'nikhil-shijo-doctor@medi.com' });
    if (existingDoctor) {
      console.log('👨‍⚕️ Doctor already exists:', existingDoctor.email);
      console.log('🔐 Updating password to: medi@123');
      
      // Update password
      const salt = await bcrypt.genSalt(12);
      existingDoctor.password = await bcrypt.hash('medi@123', salt);
      await existingDoctor.save();
      
      console.log('✅ Password updated successfully');
      console.log('📧 Email:', existingDoctor.email);
      console.log('🔐 Password: medi@123');
      console.log('👤 Name:', existingDoctor.firstName, existingDoctor.lastName);
      console.log('🏥 Specialization:', existingDoctor.specialization);
      console.log('🎯 Role:', existingDoctor.role);
      
      return;
    }

    // Create new doctor
    const doctorData = {
      firstName: 'Nikhil',
      lastName: 'Shijo',
      email: 'nikhil-shijo-doctor@medi.com',
      password: 'medi@123',
      role: 'doctor',
      specialization: 'General Medicine',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'male',
      height: 175,
      weight: 75,
      medicalConditions: [],
      allergies: [],
      medications: [],
      dietaryPreferences: ['none'],
      isActive: true,
      emailVerified: true,
      doctorInfo: {
        phoneNumber: '+1-555-0123',
        licenseNumber: 'MD123456',
        hospitalAffiliation: 'MediMeal General Hospital',
        yearsOfExperience: 8,
        bio: 'Experienced general medicine practitioner with expertise in preventive care and chronic disease management.',
        languages: ['English', 'Hindi'],
        consultationFee: 150,
        availability: 'full-time',
        emergencyContact: 'Emergency Department',
        emergencyPhone: '+1-555-9111',
        isVerified: true,
        verificationDocuments: ['medical_license.pdf', 'hospital_affiliation.pdf'],
        rating: 4.8,
        totalReviews: 127
      }
    };

    const doctor = new User(doctorData);
    await doctor.save();

    console.log('✅ Doctor created successfully!');
    console.log('📧 Email:', doctor.email);
    console.log('🔐 Password: medi@123');
    console.log('👤 Name:', doctor.firstName, doctor.lastName);
    console.log('🏥 Specialization:', doctor.specialization);
    console.log('🎯 Role:', doctor.role);
    console.log('📊 Status:', doctor.isActive ? 'Active' : 'Inactive');

    console.log('\n🚀 LOGIN INSTRUCTIONS:');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Email: nikhil-shijo-doctor@medi.com');
    console.log('3. Password: medi@123');
    console.log('4. You will be automatically redirected to the doctor dashboard');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run if this file is executed directly
if (require.main === module) {
  createNikhilDoctor();
}

module.exports = createNikhilDoctor;


