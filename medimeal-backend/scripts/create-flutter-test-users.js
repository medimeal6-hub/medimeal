// Create test users for Flutter app testing
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const testUsers = [
  {
    email: 'patient@test.com',
    password: 'test123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    isActive: true,
    emailVerified: true,
    height: 175,
    weight: 70,
    gender: 'male',
    medicalConditions: ['None'],
    allergies: [],
    dietaryPreferences: ['none']
  },
  {
    email: 'doctor@test.com',
    password: 'test123',
    firstName: 'Sarah',
    lastName: 'Smith',
    role: 'doctor',
    specialization: 'Nutritionist',
    isActive: true,
    emailVerified: true,
    doctorInfo: {
      phoneNumber: '+1234567890',
      licenseNumber: 'DOC12345',
      hospitalAffiliation: 'MediMeal Clinic',
      yearsOfExperience: 10,
      bio: 'Experienced nutritionist specializing in personalized meal planning',
      languages: ['English'],
      consultationFee: 100,
      availability: 'full-time',
      isVerified: true,
      rating: 4.8,
      totalReviews: 150
    }
  },
  {
    email: 'admin@test.com',
    password: 'test123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
    emailVerified: true
  }
];

async function createTestUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing test users
    console.log('\n🧹 Cleaning up existing test users...');
    await User.deleteMany({
      email: { $in: testUsers.map(u => u.email) }
    });
    console.log('✅ Cleaned up existing test users');

    // Create new test users
    console.log('\n👥 Creating test users...');
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    console.log('\n🎉 Test users created successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Patient Account:');
    console.log('  Email: patient@test.com');
    console.log('  Password: test123');
    console.log('');
    console.log('Doctor Account:');
    console.log('  Email: doctor@test.com');
    console.log('  Password: test123');
    console.log('');
    console.log('Admin Account:');
    console.log('  Email: admin@test.com');
    console.log('  Password: test123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
    process.exit(1);
  }
}

createTestUsers();
