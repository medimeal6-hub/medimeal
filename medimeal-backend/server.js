const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const doctorRoutes = require('./routes/doctor');

const app = express();

// Start reminder scheduler (emails)
try {
  const { startReminderScheduler } = require('./services/reminderService')
  startReminderScheduler()
  console.log('⏰ Reminder scheduler started')
} catch (e) {
  console.warn('Reminder scheduler not started:', e?.message)
}

// Start daily food alert scheduler (7 AM daily)
try {
  const { startDailyFoodAlertScheduler } = require('./services/dailyFoodAlertService')
  startDailyFoodAlertScheduler()
  console.log('🌅 Daily food alert scheduler started')
} catch (e) {
  console.warn('Daily food alert scheduler not started:', e?.message)
}

// Security middleware
// Important for popup-based auth flows (Google/Firebase/Razorpay): avoid COOP blocking window.close/window.closed
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);

// Rate limiting - More lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 500 : 100, // More lenient in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks
  skip: (req) => {
    return req.path === '/api/health' || req.path === '/';
  }
});

// More lenient rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 50 : 20, // Allow more auth attempts
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration - fix for popup authentication
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle OPTIONS requests for CORS preflight
app.options('*', cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection with live MongoDB Atlas URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://medi:Siya123@cluster0.iiclpkk.mongodb.net/medimeal?';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB Atlas connected successfully');
  
  // Auto-create admin user on server start
  try {
    const User = require('./models/User');
    const adminEmail = 'admin@medimeal.com';
    const adminPassword = 'medi123';
    
    let adminUser = await User.findOne({ email: adminEmail.toLowerCase() });
    
    if (!adminUser) {
      adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail.toLowerCase(),
        password: adminPassword, // Will be hashed by pre-save hook
        role: 'admin',
        isActive: true,
        emailVerified: true
      });
      await adminUser.save();
      console.log('✅ Admin user created:', adminEmail);
    } else {
      // Ensure admin user has correct role and password
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        await adminUser.save();
        console.log('✅ Existing user promoted to admin:', adminEmail);
      }
      // Update password if needed (check if it matches)
      const isPasswordValid = await adminUser.comparePassword(adminPassword);
      if (!isPasswordValid) {
        adminUser.password = adminPassword; // Will be re-hashed
        await adminUser.save();
        console.log('✅ Admin password updated');
      }
      console.log('✅ Admin user verified:', adminEmail);
    }
  } catch (adminError) {
    console.error('⚠️ Error creating/verifying admin user:', adminError.message);
    // Don't exit - server can still run without admin user
  }
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', require('./routes/adminCompliance'));
app.use('/api/admin', require('./routes/adminStaff'));
app.use('/api/admin', require('./routes/adminFood'));
app.use('/api/admin', require('./routes/adminSubscriptions'));
app.use('/api/admin', require('./routes/adminSecurity'));
app.use('/api/doctor', doctorRoutes);
app.use('/api/health', require('./routes/health'));
app.use('/api/medications', require('./routes/medications'));
app.use('/api/meals', require('./routes/meals'));
app.use('/api/suggestions', require('./routes/suggestions'));
app.use('/api/calendar', require('./routes/calendar'));
// Temporary fix: also mount calendar routes directly without /api prefix
app.use('/calendar', require('./routes/calendar'));
app.use('/api/seed', require('./routes/seed'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/conflicts', require('./routes/conflicts'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/recommendations', require('./routes/knnRecommendations'));
app.use('/api/recommendations', require('./routes/clusterRecommendations'));
app.use('/api/subscription-plans', require('./routes/subscriptionPlans'));
app.use('/api/spare-parts', require('./routes/spareParts'));
app.use('/api/ai/analytics', require('./routes/aiAnalytics'));

// User-specific routes
app.use('/api/user/dashboard', require('./routes/userDashboard'));
app.use('/api/user/food-diary', require('./routes/userFoodDiary'));
app.use('/api/user/ai-diet-engine', require('./routes/userAIDietEngine'));
app.use('/api/user/calendar', require('./routes/userCalendar'));
app.use('/api/user/appointments', require('./routes/userAppointments'));
app.use('/api/user/invoices', require('./routes/userInvoice'));
app.use('/api/user/doctors', require('./routes/userDoctors'));
app.use('/api/user/payments', require('./routes/userPayments'));

// Unified Appointments System Routes
app.use('/api/appointments', require('./routes/appointments'));

// Research Implementation Routes - Intelligent Nutrition & Symptom Risk
app.use('/api/nutrition', require('./routes/nutritionRoutes'));
app.use('/api/symptoms', require('./routes/symptomRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MediMeal Backend API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MediMeal API',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

// Handle port conflicts gracefully
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`💡 Try one of these solutions:`);
    console.error(`   1. Kill the process using port ${PORT}: netstat -ano | findstr :${PORT}`);
    console.error(`   2. Use a different port: PORT=5001 npm start`);
    console.error(`   3. Or set PORT in your .env file`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});
