const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// GET /api/user/doctors - Get list of available doctors (for appointment booking)
router.get('/', auth, async (req, res) => {
  try {
    const doctors = await User.find({ 
      role: 'doctor',
      isActive: true 
    })
      .select('firstName lastName email specialization doctorInfo')
      .sort({ 'doctorInfo.rating': -1, createdAt: -1 });

    const doctorsList = doctors.map(doctor => ({
      _id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      specialization: doctor.specialization || 'General Physician',
      consultationFee: doctor.doctorInfo?.consultationFee || 0,
      hospitalAffiliation: doctor.doctorInfo?.hospitalAffiliation || '',
      yearsOfExperience: doctor.doctorInfo?.yearsOfExperience || 0,
      rating: doctor.doctorInfo?.rating || 0,
      totalReviews: doctor.doctorInfo?.totalReviews || 0,
      isVerified: doctor.doctorInfo?.isVerified || false
    }));

    res.status(200).json({
      success: true,
      data: doctorsList
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors'
    });
  }
});

module.exports = router;
