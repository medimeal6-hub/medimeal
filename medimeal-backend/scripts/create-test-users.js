// Script to create test users for Playwright tests
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createTestUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test user credentials
    const testUsers = [
      {
        email: 'patient@test.com',
        password: 'Patient123!',
        firstName: 'Test',
        lastName: 'Patient',
        role: 'user',
        isActive: true
      },
      {
        email: 'admin@test.com',
        password: 'Admin123!',
        firstName: 'Test',
        lastName: 'Admin',
        role: 'admin',
        isActive: true
      },
      {
        email: 'doctor@test.com',
        password: 'Doctor123!',
        firstName: 'Test',
        lastName: 'Doctor',
        role: 'doctor',
        specialization: 'Cardiology',
        isActive: true
      }
    ];

    // Clear existing test users
    await User.deleteMany({
      email: { $in: testUsers.map(u => u.email) }
    });
    console.log('🧹 Cleared existing test users');

    // Create test users
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = new User({
        ...userData,
        password: hashedPassword,
        surveyCompleted: true,
        surveyData: {
          medicalConditions: ['diabetes'],
          allergies: ['peanuts'],
          dietaryRestrictions: ['vegetarian'],
          completedAt: new Date()
        }
      });

      await user.save();
      console.log(`✅ Created test user: ${userData.email} (${userData.role})`);
    }

    console.log('🎉 All test users created successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();
