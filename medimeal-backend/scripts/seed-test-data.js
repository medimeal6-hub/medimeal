const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const PatientAssignment = require('../models/PatientAssignment');
const DoctorSchedule = require('../models/DoctorSchedule');

// Test data
const testUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@test.com',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    email: 'doctor@test.com',
    password: 'Doctor123!',
    role: 'doctor',
    specialization: 'Cardiology',
    doctorInfo: {
      phoneNumber: '+1234567890',
      licenseNumber: 'MD123456',
      hospitalAffiliation: 'General Hospital',
      yearsOfExperience: 10,
      bio: 'Experienced cardiologist with 10 years of practice',
      languages: ['English', 'Spanish'],
      consultationFee: 150,
      availability: 'full-time',
      emergencyContact: 'Emergency Contact',
      emergencyPhone: '+1234567891',
      isVerified: true
    }
  },
  {
    firstName: 'Dr. Michael',
    lastName: 'Brown',
    email: 'doctor2@test.com',
    password: 'Doctor123!',
    role: 'doctor',
    specialization: 'Neurology',
    doctorInfo: {
      phoneNumber: '+1234567892',
      licenseNumber: 'MD123457',
      hospitalAffiliation: 'General Hospital',
      yearsOfExperience: 8,
      bio: 'Neurologist specializing in brain disorders',
      languages: ['English'],
      consultationFee: 140,
      availability: 'full-time',
      emergencyContact: 'Emergency Contact 2',
      emergencyPhone: '+1234567893',
      isVerified: true
    }
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'patient@test.com',
    password: 'Patient123!',
    role: 'user',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'male',
    medicalConditions: ['Hypertension', 'Diabetes'],
    allergies: ['Penicillin']
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'patient2@test.com',
    password: 'Patient123!',
    role: 'user',
    dateOfBirth: new Date('1985-05-15'),
    gender: 'female',
    medicalConditions: ['Asthma'],
    allergies: ['Shellfish']
  },
  {
    firstName: 'Bob',
    lastName: 'Wilson',
    email: 'patient3@test.com',
    password: 'Patient123!',
    role: 'user',
    dateOfBirth: new Date('1978-12-10'),
    gender: 'male',
    medicalConditions: ['Heart Disease'],
    allergies: []
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medimeal', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing test data...');
    await User.deleteMany({ email: { $in: testUsers.map(u => u.email) } });
    await PatientAssignment.deleteMany({});
    await DoctorSchedule.deleteMany({});
    console.log('✅ Existing test data cleared');

    // Create users
    console.log('👥 Creating test users...');
    const createdUsers = [];
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created ${user.role}: ${user.email}`);
    }

    // Get created users by role
    const admin = createdUsers.find(u => u.role === 'admin');
    const doctors = createdUsers.filter(u => u.role === 'doctor');
    const patients = createdUsers.filter(u => u.role === 'user');

    // Create patient assignments
    console.log('📋 Creating patient assignments...');
    const assignments = [
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        assignedBy: admin._id,
        wardNumber: '#123456',
        priority: 'high',
        diagnosis: 'Chest pain, possible cardiac issue',
        treatmentPlan: 'Monitor vitals, ECG, blood tests',
        notes: 'Patient reported chest pain during exercise'
      },
      {
        patient: patients[1]._id,
        doctor: doctors[0]._id,
        assignedBy: admin._id,
        wardNumber: '#123457',
        priority: 'medium',
        diagnosis: 'Routine checkup',
        treatmentPlan: 'Regular monitoring',
        notes: 'Annual health checkup'
      },
      {
        patient: patients[2]._id,
        doctor: doctors[1]._id,
        assignedBy: admin._id,
        wardNumber: '#123458',
        priority: 'critical',
        diagnosis: 'Severe headache, possible neurological issue',
        treatmentPlan: 'CT scan, neurological examination',
        notes: 'Patient experiencing severe headaches for 3 days'
      }
    ];

    for (const assignmentData of assignments) {
      const assignment = new PatientAssignment(assignmentData);
      await assignment.save();
      console.log(`✅ Created assignment: Ward ${assignmentData.wardNumber}`);
    }

    // Create doctor schedules
    console.log('📅 Creating doctor schedules...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const schedules = [
      {
        doctor: doctors[0]._id,
        date: today,
        timeSlots: [
          {
            startTime: '09:00',
            endTime: '11:00',
            activity: 'checkup',
            title: 'Check up patient',
            patientId: patients[0]._id,
            wardNumber: '#123456',
            priority: 'high',
            status: 'scheduled',
            description: 'Regular checkup for assigned patient'
          },
          {
            startTime: '11:00',
            endTime: '12:00',
            activity: 'lunch',
            title: 'Lunch Break',
            status: 'scheduled',
            description: 'Lunch break'
          },
          {
            startTime: '12:00',
            endTime: '16:00',
            activity: 'surgery',
            title: 'Heart Surgery',
            patientId: patients[0]._id,
            wardNumber: '#123456',
            priority: 'critical',
            status: 'scheduled',
            description: 'Scheduled heart surgery'
          }
        ]
      },
      {
        doctor: doctors[1]._id,
        date: today,
        timeSlots: [
          {
            startTime: '08:00',
            endTime: '10:00',
            activity: 'evaluation',
            title: 'Neurological Evaluation',
            patientId: patients[2]._id,
            wardNumber: '#123458',
            priority: 'critical',
            status: 'scheduled',
            description: 'Comprehensive neurological evaluation'
          },
          {
            startTime: '10:00',
            endTime: '12:00',
            activity: 'consultation',
            title: 'Patient Consultation',
            status: 'scheduled',
            description: 'General patient consultation'
          },
          {
            startTime: '14:00',
            endTime: '16:00',
            activity: 'evaluation',
            title: 'Follow-up Evaluation',
            patientId: patients[2]._id,
            wardNumber: '#123458',
            priority: 'medium',
            status: 'scheduled',
            description: 'Follow-up neurological evaluation'
          }
        ]
      }
    ];

    for (const scheduleData of schedules) {
      const schedule = new DoctorSchedule(scheduleData);
      await schedule.save();
      console.log(`✅ Created schedule for doctor: ${scheduleData.doctor}`);
    }

    console.log('\n🎉 Test data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`👑 Admin users: 1`);
    console.log(`👨‍⚕️ Doctor users: ${doctors.length}`);
    console.log(`👤 Patient users: ${patients.length}`);
    console.log(`📋 Patient assignments: ${assignments.length}`);
    console.log(`📅 Doctor schedules: ${schedules.length}`);

    console.log('\n🔑 Test Credentials:');
    console.log('Admin: admin@test.com / Admin123!');
    console.log('Doctor 1: doctor@test.com / Doctor123!');
    console.log('Doctor 2: doctor2@test.com / Doctor123!');
    console.log('Patient 1: patient@test.com / Patient123!');
    console.log('Patient 2: patient2@test.com / Patient123!');
    console.log('Patient 3: patient3@test.com / Patient123!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };






