const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');
const { auth: firebaseAuth } = require('../config/firebase');


const router = express.Router();


// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};


// Google OAuth client
const googleClientId = process.env.GOOGLE_CLIENT_ID || '502401311418-a5mugpah82mq0ak8a5m9tfoepqlobftm.apps.googleusercontent.com';
console.log('🔑 Google Client ID loaded:', googleClientId);
const googleClient = new OAuth2Client(googleClientId);


// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('First name must be 2-50 letters only'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('Last name must be 2-50 letters only'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['user', 'doctor', 'admin'])
    .withMessage('Invalid role')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }


    const { firstName, lastName, email, password, role = 'user' } = req.body;


    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }


    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role
    });


    await user.save();

    // Send welcome email
    try {
      const { sendWelcomeEmail } = require('../utils/mailer');
      await sendWelcomeEmail(user.email, user.firstName);
    } catch (emailError) {
      console.error('Welcome email sending error:', emailError);
    }

    // Generate token
    const token = generateToken(user._id);


    // Return user data (without password) and token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.getProfile(),
        token
      }
    });


  } catch (error) {
    console.error('Registration error:', error);
   
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }


    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }


    const { email, password } = req.body;


    // Find user by email and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
   
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }


    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }


    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }


    // Update last login
    await user.updateLastLogin();

    // Send login notification email
    try {
      const { sendLoginNotificationEmail } = require('../utils/mailer');
      const loginTime = new Date().toLocaleString();
      const ipAddress = req.ip || req.connection.remoteAddress;
      await sendLoginNotificationEmail(user.email, user.firstName, loginTime, ipAddress);
    } catch (emailError) {
      console.error('Login notification email sending error:', emailError);
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.getProfile(),
        token
      }
    });


  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.getProfile()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Invalid gender'),
  body('height')
    .optional()
    .isNumeric()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Height must be between 50 and 300 cm'),
  body('weight')
    .optional()
    .isNumeric()
    .isFloat({ min: 10, max: 500 })
    .withMessage('Weight must be between 10 and 500 kg')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }


    const allowedUpdates = ['fullName', 'profilePicture', 'dateOfBirth', 'gender', 'height', 'weight', 'medicalConditions', 'allergies', 'medications', 'dietaryPreferences'];
    const updates = {};


    // Filter only allowed fields
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });


    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );


    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getProfile()
      }
    });


  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }


    const { currentPassword, newPassword } = req.body;


    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
   
    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }


    // Update password
    user.password = newPassword;
    await user.save();


    res.json({
      success: true,
      message: 'Password changed successfully'
    });


  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Public
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const emailLower = email.toLowerCase();

    // Find user by email
    const user = await User.findByEmail(emailLower);
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    try {
      const { sendPasswordResetEmail } = require('../utils/mailer');
      await sendPasswordResetEmail(user.email, user.firstName, resetUrl);
      
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send reset email. Please try again.'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (tokenError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


// @route   POST /api/auth/google
// @desc    Login or register with Google ID token
// @access  Public
router.post('/google', [
  body('credential').notEmpty().withMessage('Google credential is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }


    const { credential } = req.body;


    // Verify the Google ID token
    console.log('🔍 Verifying Google ID token with audience:', googleClientId);
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId
    });
    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();
    const name = (payload.name || email.split('@')[0] || '').trim();
    const [firstNameRaw, ...restName] = name.split(' ');
    const firstName = (firstNameRaw || 'User').replace(/[^A-Za-z\s]/g, '').slice(0, 50) || 'User';
    const lastName = restName.join(' ').replace(/[^A-Za-z\s]/g, '').slice(0, 50) || 'User';


    // Generate a compliant password (min 6, with upper, lower, number)
    const tempPassword = 'Aa1' + jwt.sign({ email }, process.env.JWT_SECRET).replace(/[^A-Za-z0-9]/g, '').slice(0, 9);


    // Find or create the user
    let user = await User.findByEmail(email);
    if (!user) {
      user = new User({
        firstName,
        lastName,
        email,
        password: tempPassword,
        role: 'user',
        emailVerified: true
      });
      await user.save();
    }


    // Generate JWT for our app
    const token = generateToken(user._id);


    // Respond with profile and token
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.getProfile(),
        token
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({
      success: false,
      message: 'Google authentication failed'
    });
  }
});

// @route   POST /api/auth/firebase
// @desc    Login or register with Firebase ID token
// @access  Public
router.post('/firebase', [
  body('idToken').notEmpty().withMessage('Firebase ID token is required')
], async (req, res) => {
  try {
    console.log('🔥 Firebase auth request received');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { idToken } = req.body;
    console.log('🔑 Firebase ID token received:', !!idToken);

    // Verify the Firebase ID token
    console.log('🔥 Verifying Firebase ID token...');
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    console.log('✅ Firebase token verified successfully:', { uid: decodedToken.uid, email: decodedToken.email });
    const { uid, email, name, picture } = decodedToken;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for authentication'
      });
    }

    const emailLower = email.toLowerCase();
    const fullName = name || emailLower.split('@')[0] || '';
    const [firstNameRaw, ...restName] = fullName.split(' ');
    const firstName = (firstNameRaw || 'User').replace(/[^A-Za-z\s]/g, '').slice(0, 50) || 'User';
    const lastName = restName.join(' ').replace(/[^A-Za-z\s]/g, '').slice(0, 50) || 'User';

    // Generate a compliant password (min 6, with upper, lower, number)
    const tempPassword = 'Aa1' + jwt.sign({ email: emailLower }, process.env.JWT_SECRET).replace(/[^A-Za-z0-9]/g, '').slice(0, 9);

    // Find or create the user
    console.log('👤 Looking for user with email:', emailLower);
    let user = await User.findByEmail(emailLower);
    if (!user) {
      console.log('🆕 Creating new user for:', emailLower);
      console.log('📝 User data:', { firstName, lastName, email: emailLower, role: 'user' });
      
      try {
        user = new User({
          firstName,
          lastName,
          email: emailLower,
          password: tempPassword,
          role: 'user',
          emailVerified: true,
          profilePicture: picture || null,
          firebaseUid: uid
        });
        await user.save();
        console.log('✅ New user created:', user.email, 'Role:', user.role);
      } catch (error) {
        console.error('❌ Error creating user:', error.message);
        if (error.name === 'ValidationError') {
          console.error('📋 Validation errors:', error.errors);
        }
        throw error;
      }
    } else {
      console.log('👤 Existing user found:', user.email, 'Role:', user.role);
      // Update Firebase UID if not set
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        if (picture && !user.profilePicture) {
          user.profilePicture = picture;
        }
        await user.save();
        console.log('🔄 User updated with Firebase UID');
      }
    }

    // Generate JWT for our app
    const token = generateToken(user._id);

    // Get user profile for response
    const userProfile = user.getProfile();
    console.log('📤 Returning user profile:', { email: userProfile.email, role: userProfile.role });

    // Respond with profile and token
    res.json({
      success: true,
      message: 'Firebase authentication successful',
      data: {
        user: userProfile,
        token
      }
    });
  } catch (error) {
    console.error('Firebase authentication error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(401).json({
      success: false,
      message: 'Firebase authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// @route   GET /api/auth/test-google-config
// @desc    Test Google OAuth configuration
// @access  Public
router.get('/test-google-config', (req, res) => {
  res.json({
    success: true,
    message: 'Google OAuth configuration test',
    data: {
      googleClientId: googleClientId,
      hasGoogleClient: !!googleClient,
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// @route   POST /api/auth/survey
// @desc    Submit user survey data
// @access  Private
router.post('/survey', auth, [
  body('currentMedications')
    .optional()
    .isArray()
    .withMessage('Current medications must be an array'),
  body('medicalConditions')
    .optional()
    .isArray()
    .withMessage('Medical conditions must be an array'),
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array'),
  body('dietaryRestrictions')
    .optional()
    .isArray()
    .withMessage('Dietary restrictions must be an array'),
  body('mealPreferences')
    .optional()
    .isObject()
    .withMessage('Meal preferences must be an object'),
  body('foodPreferences')
    .optional()
    .isArray()
    .withMessage('Food preferences must be an array')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      currentMedications = [],
      medicalConditions = [],
      allergies = [],
      dietaryRestrictions = [],
      mealPreferences = {},
      foodPreferences = []
    } = req.body;

    // Update user with survey data
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        surveyCompleted: true,
        surveyData: {
          currentMedications,
          medicalConditions,
          allergies,
          dietaryRestrictions,
          mealPreferences: {
            breakfastTime: mealPreferences.breakfastTime || '08:00',
            lunchTime: mealPreferences.lunchTime || '13:00',
            dinnerTime: mealPreferences.dinnerTime || '19:00',
            snackTime: mealPreferences.snackTime || '16:00'
          },
          foodPreferences,
          completedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    console.log('Survey completed for user:', user.email, 'Survey completed:', user.surveyCompleted);

    res.json({
      success: true,
      message: 'Survey completed successfully',
      data: {
        user: user.getProfile()
      }
    });

  } catch (error) {
    console.error('Survey submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/auth/food-suggestions
// @desc    Get personalized food suggestions based on survey data
// @access  Private
router.get('/food-suggestions', auth, async (req, res) => {
  try {
    const foodSuggestionService = require('../services/foodSuggestionService');
    
    console.log('Food suggestions request for user:', req.user.email, 'Survey completed:', req.user.surveyCompleted);
    
    if (!req.user.surveyCompleted || !req.user.surveyData) {
      console.log('Survey not completed or data missing');
      return res.status(400).json({
        success: false,
        message: 'Please complete the survey first to get personalized food suggestions'
      });
    }

    const suggestions = foodSuggestionService.generateSuggestions(req.user.surveyData);
    const mealTiming = foodSuggestionService.getMealTimingRecommendations(req.user.surveyData.currentMedications);

    res.json({
      success: true,
      data: {
        suggestions,
        mealTiming,
        userPreferences: req.user.surveyData
      }
    });

  } catch (error) {
    console.error('Food suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/reset-survey
// @desc    Reset survey status for testing
// @access  Private
router.post('/reset-survey', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        surveyCompleted: false,
        surveyData: null
      },
      { new: true, runValidators: true }
    );

    console.log('Survey reset for user:', user.email);

    res.json({
      success: true,
      message: 'Survey status reset successfully',
      data: { user: user.getProfile() }
    });
  } catch (error) {
    console.error('Survey reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset survey status',
      error: error.message
    });
  }
});

// @route   GET /api/auth/test-user-creation
// @desc    Test user creation with default role
// @access  Public
router.get('/test-user-creation', async (req, res) => {
  try {
    const testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@gmail.com',
      password: 'Test123!',
      role: 'user',
      emailVerified: true,
      firebaseUid: 'test-uid-123'
    });
    
    // Don't save, just validate
    const validationError = testUser.validateSync();
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: 'User validation failed',
        errors: validationError.errors
      });
    }
    
    res.json({
      success: true,
      message: 'User creation test passed',
      data: {
        role: testUser.role,
        email: testUser.email,
        firebaseUid: testUser.firebaseUid
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'User creation test failed',
      error: error.message
    });
  }
});

module.exports = router;

