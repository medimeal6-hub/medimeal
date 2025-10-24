const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:5000/api';

// Sample doctors data with specific email format
const sampleDoctors = [
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah-johnson-doc@medimeal.com',
    password: 'Medimeal123',
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
    email: 'michael-brown-doc@medimeal.com',
    password: 'Medimeal123',
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
    email: 'emily-davis-doc@medimeal.com',
    password: 'Medimeal123',
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
    email: 'david-wilson-doc@medimeal.com',
    password: 'Medimeal123',
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
    email: 'lisa-anderson-doc@medimeal.com',
    password: 'Medimeal123',
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
    email: 'robert-taylor-doc@medimeal.com',
    password: 'Medimeal123',
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

// Function to create a doctor via API
const createDoctor = async (doctorData, adminToken) => {
  try {
    const response = await axios.post(`${BASE_URL}/admin/doctors`, doctorData, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log(`✅ Doctor created: ${doctorData.firstName} ${doctorData.lastName} (${doctorData.email})`);
      return response.data.data;
    } else {
      console.log(`❌ Failed to create doctor ${doctorData.email}: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log(`⚠️  Doctor with email ${doctorData.email} already exists`);
      return null;
    }
    console.error(`❌ Error creating doctor ${doctorData.email}:`, error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.error('   Validation errors:', error.response.data.errors);
    }
    return null;
  }
};

// Function to get admin token
const getAdminToken = async () => {
  try {
    // First, try to login with admin credentials
    const loginData = {
      email: 'admin@medimeal.com',
      password: 'Admin123'
    };

    const response = await axios.post(`${BASE_URL}/auth/login`, loginData);
    
    if (response.data.success) {
      console.log('✅ Admin login successful');
      return response.data.data.token;
    } else {
      console.log('❌ Admin login failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting admin token:', error.response?.data?.message || error.message);
    return null;
  }
};

// Main function to create all doctors
const createAllDoctors = async () => {
  console.log('🚀 Starting to create sample doctors...\n');
  
  // Get admin token
  const adminToken = await getAdminToken();
  if (!adminToken) {
    console.log('❌ Could not get admin token. Please check admin credentials.');
    return;
  }
  
  const createdDoctors = [];
  
  for (const doctorData of sampleDoctors) {
    const doctor = await createDoctor(doctorData, adminToken);
    if (doctor) {
      createdDoctors.push(doctor);
    }
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Successfully created: ${createdDoctors.length} doctors`);
  console.log(`❌ Failed to create: ${sampleDoctors.length - createdDoctors.length} doctors`);
  
  if (createdDoctors.length > 0) {
    console.log('\n📋 Created Doctors:');
    createdDoctors.forEach(doctor => {
      console.log(`   • ${doctor.user.firstName} ${doctor.user.lastName} - ${doctor.user.specialization}`);
      console.log(`     Email: ${doctor.user.email}`);
      console.log(`     Password: Medimeal123`);
      console.log('');
    });
  }
  
  console.log('🎉 Doctor creation process completed!');
};

// Run the script
createAllDoctors().catch(console.error);
