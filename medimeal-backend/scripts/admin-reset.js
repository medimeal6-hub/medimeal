// Admin maintenance tool
// Usage examples:
//   node scripts/admin-reset.js --email=admin@medimeal.com
//   node scripts/admin-reset.js --email=admin@medimeal.com --password=NewPass123 --role=admin

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const connectDB = require('../db');
const User = require('../models/User');

function parseArgs(argv) {
  const args = {};
  for (const part of argv.slice(2)) {
    const m = part.match(/^--([^=]+)=(.*)$/);
    if (m) {
      args[m[1]] = m[2];
    } else if (part.startsWith('--')) {
      args[part.replace(/^--/, '')] = true;
    }
  }
  return args;
}

(async () => {
  try {
    const args = parseArgs(process.argv);
    const email = (args.email || process.env.ADMIN_EMAIL || '').toLowerCase();
    const newPassword = args.password || process.env.ADMIN_PASSWORD || '';
    const role = (args.role || 'admin').toLowerCase();

    if (!email) {
      console.error('❌ Please provide --email or set ADMIN_EMAIL in .env');
      process.exit(1);
    }

    if (!['admin', 'doctor', 'user'].includes(role)) {
      console.error('❌ Invalid --role. Use admin | doctor | user');
      process.exit(1);
    }

    await connectDB();

    let user = await User.findByEmail(email).select('+password');

    if (!user) {
      // Create new admin/user with defaults
      const passwordToSet = newPassword || 'Admin123';
      user = new User({
        firstName: 'Admin',
        lastName: 'User',
        email,
        password: passwordToSet, // hashed by pre-save hook
        role,
        isActive: true,
        emailVerified: true
      });
      await user.save();
      console.log(`✅ Created ${role} and activated: ${email}`);
      console.log('   Temporary password:', passwordToSet);
      process.exit(0);
    }

    // Update existing user
    let changed = false;

    // Ensure required names are present and valid per model validators
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!user.firstName || !nameRegex.test(user.firstName)) {
      user.firstName = 'Admin';
      changed = true;
      console.log('ℹ️ Set firstName to default: Admin');
    }
    if (!user.lastName || !nameRegex.test(user.lastName)) {
      user.lastName = 'User';
      changed = true;
      console.log('ℹ️ Set lastName to default: User');
    }

    if (!user.isActive) {
      user.isActive = true;
      changed = true;
      console.log('ℹ️ Activated user');
    }

    if (user.role !== role) {
      user.role = role;
      changed = true;
      console.log(`ℹ️ Set role to: ${role}`);
    }

    if (user.emailVerified !== true) {
      user.emailVerified = true;
      changed = true;
      console.log('ℹ️ Set emailVerified to true');
    }

    if (newPassword) {
      user.password = newPassword; // triggers hashing
      changed = true;
      console.log('ℹ️ Password will be reset');
    }

    if (changed) {
      await user.save();
      console.log(`✅ Updated user: ${email}`);
    } else {
      console.log('ℹ️ No changes needed');
    }

    console.log('👤 Summary:', { email: user.email, role: user.role, isActive: user.isActive });
    process.exit(0);
  } catch (err) {
    console.error('❌ Admin maintenance failed:', err.message);
    process.exit(1);
  }
})();