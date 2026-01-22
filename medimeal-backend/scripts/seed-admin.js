// Seed an initial admin user
// Usage: node scripts/seed-admin.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const connectDB = require('../db');
const User = require('../models/User');

(async () => {
  try {
    await connectDB();

    const email = 'admin@medimeal.com';
    const password = 'medi123';

    let user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (user) {
      // Check if password needs to be updated
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid || user.role !== 'admin') {
        user.role = 'admin';
        user.password = password; // Will be hashed by pre-save hook
        user.isActive = true;
        user.emailVerified = true;
        await user.save();
        console.log('✅ Admin user updated with correct credentials:', email);
      } else {
        console.log('ℹ️ Admin already exists with correct credentials:', email);
      }
    } else {
      user = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: email.toLowerCase(),
        password,
        role: 'admin',
        isActive: true,
        emailVerified: true
      });
      await user.save();
      console.log('✅ Admin user created:', email);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
})();