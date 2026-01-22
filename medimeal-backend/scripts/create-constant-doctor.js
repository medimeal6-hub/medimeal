const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB (reuse main server URI if available)
const connectDB = async () => {
  try {
    const uri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      'mongodb://localhost:27017/medimeal';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const CONSTANT_DOCTOR = {
  firstName: 'Siya',
  lastName: 'Doctor',
  email: 'siya@doctor-medi.com',
  password: 'medi123', // will be hashed by User pre-save hook
  role: 'doctor',
  specialization: 'Clinical Nutrition',
  doctorInfo: {
    phoneNumber: '+10000000000',
    licenseNumber: 'DOC-MEDI-001',
    hospitalAffiliation: 'MediMeal Virtual Clinic',
    yearsOfExperience: 5,
    bio: 'Lead clinical nutrition specialist for MediMeal demo environment.',
    languages: ['English'],
    consultationFee: 0,
    availability: 'full-time',
    emergencyContact: 'MediMeal Support',
    emergencyPhone: '+10000000001',
    createdAt: new Date(),
    isVerified: true,
  },
};

const upsertConstantDoctor = async () => {
  console.log('🚀 Ensuring constant doctor account exists...');
  const existing = await User.findOne({ email: CONSTANT_DOCTOR.email });

  if (existing) {
    console.log(
      `ℹ️ Doctor already exists: ${existing.email} (role: ${existing.role})`
    );
    if (existing.role !== 'doctor') {
      existing.role = 'doctor';
    }
    // Do not change existing password to avoid surprising real users;
    // this script is mainly for first-time/demo environments.
    await existing.save();
    console.log('✅ Existing doctor updated (role ensured as doctor)');
    return existing;
  }

  const doctor = new User(CONSTANT_DOCTOR);
  await doctor.save();
  console.log('✅ Constant doctor created:');
  console.log(`   Email   : ${CONSTANT_DOCTOR.email}`);
  console.log(`   Password: ${CONSTANT_DOCTOR.password}`);
  return doctor;
};

const run = async () => {
  try {
    await connectDB();
    await upsertConstantDoctor();
  } catch (err) {
    console.error('❌ Error creating constant doctor:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

run().catch(console.error);


