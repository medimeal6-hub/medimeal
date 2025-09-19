// Seed an initial admin user
// Usage: node scripts/seed-admin.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const connectDB = require('../db');
const User = require('../models/User');

(async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || 'admin@medimeal.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin123'; // meets model: upper, lower, number, >=6

    let user = await User.findByEmail(email);
    if (user) {
      if (user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
        console.log('✅ Existing user promoted to admin:', email);
      } else {
        console.log('ℹ️ Admin already exists:', email);
      }
    } else {
      user = new User({
        firstName: 'Admin',
        lastName: 'User',
        email,
        password,
        role: 'admin',
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