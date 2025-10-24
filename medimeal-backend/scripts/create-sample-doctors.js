const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medimeal');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample doctors data with specific email format
const sampleDoctors = [
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah-johnson-doc@medi.com',
    password: 'medimeal@123',
    specialization: 'Cardiology',
    phoneNumber: '+1234567890',
    licenseNumber: 'MD123456',
    hospitalAffiliation: 'General Hospital',
    yearsOfExperience: 10,
    bio: 'Experienced cardiologist with 10 years of practice specializing in heart diseases and preventive care.',
    languages: ['English', 'Spanish'],
    consultationFee: 150,
    availability: 'full-time',
    emergencyContact: 'Emergency Contact',
    emergencyPhone: '+1234567891'
  },
  {
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael-brown-doc@medi.com',
    password: 'medimeal@123',
    specialization: 'Endocrinology',
    phoneNumber: '+1234567892',
    licenseNumber: 'MD123457',
    hospitalAffiliation: 'City Medical Center',
    yearsOfExperience: 8,
    bio: 'Endocrinologist specializing in diabetes management and hormonal disorders.',
    languages: ['English', 'French'],
    consultationFee: 140,
    availability: 'full-time',
    emergencyContact: 'Emergency Contact',
    emergencyPhone: '+1234567893'
  },
  {
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily-davis-doc@medi.com',
    password: 'medimeal@123',
    specialization: 'Pediatrics',
    phoneNumber: '+1234567894',
    licenseNumber: 'MD123458',
    hospitalAffiliation: 'Children Hospital',
    yearsOfExperience: 12,
    bio: 'Pediatrician with extensive experience in child healthcare and development.',
    languages: ['English', 'German'],
    consultationFee: 130,
    availability: 'full-time',
    emergencyContact: 'Emergency Contact',
    emergencyPhone: '+1234567895'
  },
  {
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david-wilson-doc@medi.com',
    password: 'medimeal@123',
    specialization: 'Neurology',
    phoneNumber: '+1234567896',
    licenseNumber: 'MD123459',
    hospitalAffiliation: 'Neurological Institute',
    yearsOfExperience: 15,
    bio: 'Neurologist specializing in brain disorders and nervous system conditions.',
    languages: ['English', 'Italian'],
    consultationFee: 180,
    availability: 'full-time',
    emergencyContact: 'Emergency Contact',
    emergencyPhone: '+1234567897'
  },
  {
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa-anderson-doc@medi.com',
    password: 'medimeal@123',
    specialization: 'Dermatology',
    phoneNumber: '+1234567898',
    licenseNumber: 'MD123460',
    hospitalAffiliation: 'Skin Care Clinic',
    yearsOfExperience: 7,
    bio: 'Dermatologist specializing in skin conditions and cosmetic dermatology.',
    languages: ['English', 'Portuguese'],
    consultationFee: 120,
    availability: 'full-time',
    emergencyContact: 'Emergency Contact',
    emergencyPhone: '+1234567899'
  },
  {
    firstName: 'Robert',
    lastName: 'Taylor',
    email: 'robert-taylor-doc@medi.com',
    password: 'medimeal@123',
    specialization: 'Orthopedics',
    phoneNumber: '+1234567800',
    licenseNumber: 'MD123461',
    hospitalAffiliation: 'Sports Medicine Center',
    yearsOfExperience: 14,
    bio: 'Orthopedic surgeon specializing in sports injuries and joint replacements.',
    languages: ['English', 'Russian'],
    consultationFee: 200,
    availability: 'full-time',
    emergencyContact: 'Emergency Contact',
    emergencyPhone: '+1234567801'
  }
];

// Function to create a doctor
const createDoctor = async (doctorData) => {
  try {
    // Check if doctor already exists
    const existingDoctor = await User.findOne({ email: doctorData.email });
    if (existingDoctor) {
      console.log(`⚠️  Doctor with email ${doctorData.email} already exists`);
      return null;
    }

    // Create new doctor user
    const doctor = new User({
      firstName: doctorData.firstName,
      lastName: doctorData.lastName,
      email: doctorData.email,
      password: doctorData.password,
      role: 'doctor',
      specialization: doctorData.specialization,
      doctorInfo: {
        phoneNumber: doctorData.phoneNumber,
        licenseNumber: doctorData.licenseNumber,
        hospitalAffiliation: doctorData.hospitalAffiliation,
        yearsOfExperience: doctorData.yearsOfExperience,
        bio: doctorData.bio,
        languages: doctorData.languages,
        consultationFee: doctorData.consultationFee,
        availability: doctorData.availability,
        emergencyContact: doctorData.emergencyContact,
        emergencyPhone: doctorData.emergencyPhone,
        createdAt: new Date(),
        isVerified: true
      }
    });

    await doctor.save();
    console.log(`✅ Doctor created: ${doctorData.firstName} ${doctorData.lastName} (${doctorData.email})`);
    return doctor;
  } catch (error) {
    console.error(`❌ Error creating doctor ${doctorData.email}:`, error.message);
    return null;
  }
};

// Main function to create all doctors
const createAllDoctors = async () => {
  console.log('🚀 Starting to create sample doctors...\n');
  
  const createdDoctors = [];
  
  for (const doctorData of sampleDoctors) {
    const doctor = await createDoctor(doctorData);
    if (doctor) {
      createdDoctors.push(doctor);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Successfully created: ${createdDoctors.length} doctors`);
  console.log(`❌ Failed to create: ${sampleDoctors.length - createdDoctors.length} doctors`);
  
  if (createdDoctors.length > 0) {
    console.log('\n📋 Created Doctors:');
    createdDoctors.forEach(doctor => {
      console.log(`   • ${doctor.firstName} ${doctor.lastName} - ${doctor.specialization}`);
      console.log(`     Email: ${doctor.email}`);
      console.log(`     Password: medimeal@123`);
      console.log('');
    });
  }
  
  console.log('🎉 Doctor creation process completed!');
};

// Run the script
const run = async () => {
  await connectDB();
  await createAllDoctors();
  await mongoose.connection.close();
  console.log('🔌 Database connection closed');
  process.exit(0);
};

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Run the script
run().catch(console.error);

