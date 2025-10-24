const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
    validate: {
      validator: function (val) {
        // Must not contain numbers
        return /^[A-Za-z\s]+$/.test(val);
      },
      message: 'First name must not contain numbers!'
    }
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
    validate: {
      validator: function (val) {
        // Must not contain numbers
        return /^[A-Za-z\s]+$/.test(val);
      },
      message: 'Last name must not contain numbers!'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (email) {
        // For OAuth users (with firebaseUid), allow any valid email
        if (this.firebaseUid) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }
        // For regular users, only allow .org, .in, .com
        return /^[^\s@]+@[^\s@]+\.(org|in|com)$/.test(email);
      },
      message: 'Email must end with .org, .in, or .com (or be a valid email for OAuth users)'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
    validate: {
      validator: function (password) {
        // Allow "medi@123" specifically, or follow normal rules
        if (password === 'medi@123') {
          return true;
        }
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);
      },
      message:
        'Password must be at least 6 characters and include one uppercase letter, one lowercase letter, and one number, or use "medi@123".'
    }
  },
  role: {
    type: String,
    enum: ['user', 'doctor', 'admin'],
    default: 'user'
  },
  specialization: {
    type: String,
    trim: true,
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    default: 'prefer-not-to-say'
  },
  height: {
    type: Number,
    min: [50, 'Height must be at least 50cm'],
    max: [300, 'Height cannot exceed 300cm']
  },
  weight: {
    type: Number,
    min: [10, 'Weight must be at least 10kg'],
    max: [500, 'Weight cannot exceed 500kg']
  },
  medicalConditions: [{
    type: String,
    trim: true
  }],
  allergies: [{
    type: String,
    trim: true
  }],
  medications: [{
    name: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },
    frequency: { type: String, required: true, trim: true },
    // Fixed times mode
    times: [{
      type: String,
      trim: true,
      validate: {
        validator: (v) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v),
        message: 'Time must be in HH:mm (24h) format'
      }
    }],
    // Reminder timing configuration
    timingMode: { type: String, enum: ['fixed', 'relativeToMeal'], default: 'fixed' },
    relativeMealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'any'], default: 'breakfast' },
    relativeWhen: { type: String, enum: ['before', 'after', 'with'], default: 'after' },
    offsetMinutes: { type: Number, min: 0, default: 30 },
    sentReminders: [{ type: String, trim: true }], // Keys like YYYY-MM-DD|HH:mm to deduplicate

    startDate: { type: Date, default: Date.now },
    endDate: Date
  }],
  dietaryPreferences: [{
    type: String,
    enum: [
      'vegetarian', 'vegan', 'gluten-free', 'dairy-free',
      'keto', 'paleo', 'mediterranean', 'low-sodium',
      'diabetic-friendly', 'none'
    ],
    default: ['none']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true
  },
  doctorInfo: {
    phoneNumber: {
      type: String,
      trim: true,
      default: ''
    },
    licenseNumber: {
      type: String,
      trim: true,
      default: ''
    },
    hospitalAffiliation: {
      type: String,
      trim: true,
      default: ''
    },
    yearsOfExperience: {
      type: Number,
      min: [0, 'Years of experience cannot be negative'],
      max: [50, 'Years of experience cannot exceed 50'],
      default: 0
    },
    bio: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Bio cannot exceed 1000 characters']
    },
    languages: [{
      type: String,
      trim: true
    }],
    consultationFee: {
      type: Number,
      min: [0, 'Consultation fee cannot be negative'],
      default: 0
    },
    availability: {
      type: String,
      enum: ['full-time', 'part-time', 'consultant', 'visiting'],
      default: 'full-time'
    },
    emergencyContact: {
      type: String,
      trim: true,
      default: ''
    },
    emergencyPhone: {
      type: String,
      trim: true,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationDocuments: [{
      type: String,
      trim: true
    }],
    rating: {
      type: Number,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  surveyCompleted: {
    type: Boolean,
    default: false
  },
  surveyData: {
    currentMedications: [{
      name: { type: String, required: true, trim: true },
      dosage: { type: String, required: true, trim: true },
      frequency: { type: String, required: true, trim: true },
      timing: { type: String, enum: ['morning', 'afternoon', 'evening', 'night', 'with-meals', 'between-meals'], required: true }
    }],
    medicalConditions: [{
      type: String,
      trim: true
    }],
    allergies: [{
      type: String,
      trim: true
    }],
    dietaryRestrictions: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-allergy', 'low-sodium', 'diabetic-friendly', 'none']
    }],
    mealPreferences: {
      breakfastTime: { type: String, default: '08:00' },
      lunchTime: { type: String, default: '13:00' },
      dinnerTime: { type: String, default: '19:00' },
      snackTime: { type: String, default: '16:00' }
    },
    foodPreferences: [{
      type: String,
      enum: ['spicy', 'mild', 'sweet', 'savory', 'fresh', 'cooked', 'raw', 'hot', 'cold']
    }],
    completedAt: { type: Date, default: Date.now }
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get user profile
userSchema.methods.getProfile = function() {
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: `${this.firstName} ${this.lastName}`.trim(),
    email: this.email,
    role: this.role,
    specialization: this.role === 'doctor' ? this.specialization : undefined,
    profilePicture: this.profilePicture,
    dateOfBirth: this.dateOfBirth,
    gender: this.gender,
    height: this.height,
    weight: this.weight,
    medicalConditions: this.medicalConditions,
    allergies: this.allergies,
    medications: this.medications,
    dietaryPreferences: this.dietaryPreferences,
    surveyCompleted: this.surveyCompleted,
    surveyData: this.surveyData,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    emailVerified: this.emailVerified,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
