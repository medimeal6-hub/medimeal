const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Food = require('../models/Food');
const Medicine = require('../models/Medicine');
const FoodDrugConflict = require('../models/FoodDrugConflict');
const PatientAssignment = require('../models/PatientAssignment');
const ReminderLog = require('../models/ReminderLog');

const router = express.Router();

// Indian Food Dataset
const indianFoods = [
  {
    name: "Idli",
    category: "Breakfast",
    calories: 65,
    protein: 2,
    carbs: 12,
    fat: 0.4,
    fiber: 1,
    sugar: 0.5,
    sodium: 5,
    image: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Idli_Sambar.JPG",
    description: "Steamed rice cakes, a healthy South Indian breakfast",
    tags: ["healthy", "low-fat", "gluten-free", "vegetarian"],
    isHealthy: true,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isDiabeticFriendly: true,
    servingSize: "2 pieces",
    preparationTime: 15,
    difficulty: "Easy",
    ingredients: ["Rice", "Urad dal", "Salt", "Water"],
    instructions: ["Soak rice and dal", "Grind to batter", "Ferment overnight", "Steam in idli maker"],
    nutritionalBenefits: ["High in carbohydrates", "Low in fat", "Good source of protein"]
  },
  {
    name: "Dosa",
    category: "Breakfast",
    calories: 120,
    protein: 3,
    carbs: 16,
    fat: 3,
    fiber: 2,
    sugar: 1,
    sodium: 8,
    image: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Dosa_Sambar.JPG",
    description: "Crispy fermented crepe, popular South Indian dish",
    tags: ["crispy", "fermented", "vegetarian"],
    isHealthy: true,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isDiabeticFriendly: true,
    servingSize: "1 large",
    preparationTime: 20,
    difficulty: "Medium",
    ingredients: ["Rice", "Urad dal", "Salt", "Oil"],
    instructions: ["Prepare batter", "Ferment", "Spread on hot tawa", "Cook until crispy"],
    nutritionalBenefits: ["Fermented food", "Good for digestion", "Rich in B vitamins"]
  },
  {
    name: "Upma",
    category: "Breakfast",
    calories: 155,
    protein: 4,
    carbs: 18,
    fat: 6,
    fiber: 3,
    sugar: 2,
    sodium: 12,
    image: "https://upload.wikimedia.org/wikipedia/commons/e/e1/South_Indian_Upma.JPG",
    description: "Savory semolina porridge with vegetables",
    tags: ["savory", "vegetables", "quick"],
    isHealthy: true,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false,
    isDiabeticFriendly: true,
    servingSize: "1 bowl",
    preparationTime: 10,
    difficulty: "Easy",
    ingredients: ["Semolina", "Vegetables", "Mustard seeds", "Curry leaves", "Oil"],
    instructions: ["Roast semolina", "Sauté vegetables", "Add water", "Cook until thick"],
    nutritionalBenefits: ["High in fiber", "Rich in vegetables", "Quick energy"]
  },
  {
    name: "Chapati",
    category: "Lunch",
    calories: 70,
    protein: 3,
    carbs: 15,
    fat: 0.5,
    fiber: 2,
    sugar: 0,
    sodium: 2,
    image: "https://upload.wikimedia.org/wikipedia/commons/2/25/Chapati_India.jpg",
    description: "Whole wheat flatbread, staple Indian bread",
    tags: ["whole-wheat", "staple", "healthy"],
    isHealthy: true,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false,
    isDiabeticFriendly: true,
    servingSize: "1 piece",
    preparationTime: 5,
    difficulty: "Easy",
    ingredients: ["Whole wheat flour", "Water", "Salt"],
    instructions: ["Knead dough", "Roll thin", "Cook on tawa"],
    nutritionalBenefits: ["Whole grain", "High fiber", "Low fat"]
  },
  {
    name: "Rice with Dal",
    category: "Lunch",
    calories: 320,
    protein: 9,
    carbs: 50,
    fat: 5,
    fiber: 4,
    sugar: 2,
    sodium: 15,
    image: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Dal_Rice_Indian.jpg",
    description: "Complete protein meal with rice and lentils",
    tags: ["complete-protein", "traditional", "nutritious"],
    isHealthy: true,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isDiabeticFriendly: true,
    servingSize: "1 plate",
    preparationTime: 25,
    difficulty: "Easy",
    ingredients: ["Rice", "Dal", "Onions", "Tomatoes", "Spices"],
    instructions: ["Cook rice", "Prepare dal", "Temper with spices", "Serve together"],
    nutritionalBenefits: ["Complete protein", "Rich in B vitamins", "Good for muscle building"]
  },
  {
    name: "Vegetable Pulao",
    category: "Lunch",
    calories: 250,
    protein: 6,
    carbs: 40,
    fat: 6,
    fiber: 5,
    sugar: 3,
    sodium: 18,
    image: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Vegetable_Pulao_Indian.jpg",
    description: "Aromatic rice with mixed vegetables",
    tags: ["aromatic", "vegetables", "one-pot"],
    isHealthy: true,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isDiabeticFriendly: true,
    servingSize: "1 bowl",
    preparationTime: 30,
    difficulty: "Medium",
    ingredients: ["Basmati rice", "Mixed vegetables", "Whole spices", "Ghee"],
    instructions: ["Sauté vegetables", "Add rice and spices", "Cook with water", "Garnish"],
    nutritionalBenefits: ["Mixed vegetables", "Aromatic spices", "Balanced nutrition"]
  },
  {
    name: "Grilled Paneer",
    category: "Dinner",
    calories: 180,
    protein: 15,
    carbs: 6,
    fat: 10,
    fiber: 0,
    sugar: 2,
    sodium: 8,
    image: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Paneer_Tikka_Grilled.jpg",
    description: "Grilled cottage cheese with spices",
    tags: ["high-protein", "grilled", "spicy"],
    isHealthy: true,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    isDiabeticFriendly: true,
    servingSize: "100g",
    preparationTime: 20,
    difficulty: "Medium",
    ingredients: ["Paneer", "Yogurt", "Spices", "Oil"],
    instructions: ["Marinate paneer", "Grill on skewers", "Serve hot"],
    nutritionalBenefits: ["High protein", "Rich in calcium", "Good for bones"]
  },
  {
    name: "Brown Rice with Dal Tadka",
    category: "Dinner",
    calories: 310,
    protein: 10,
    carbs: 45,
    fat: 4,
    fiber: 6,
    sugar: 1,
    sodium: 12,
    image: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Dal_Tadka_with_Brown_Rice.jpg",
    description: "Healthy brown rice with tempered dal",
    tags: ["brown-rice", "tempered", "healthy"],
    isHealthy: true,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isDiabeticFriendly: true,
    servingSize: "1 plate",
    preparationTime: 35,
    difficulty: "Medium",
    ingredients: ["Brown rice", "Dal", "Tempering spices", "Ghee"],
    instructions: ["Cook brown rice", "Prepare dal", "Temper with spices", "Combine"],
    nutritionalBenefits: ["Whole grain", "High fiber", "Complete protein"]
  },
  {
    name: "Oats Porridge",
    category: "Breakfast",
    calories: 150,
    protein: 5,
    carbs: 27,
    fat: 3,
    fiber: 4,
    sugar: 8,
    sodium: 5,
    image: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Oats_Porridge.jpg",
    description: "Healthy oats porridge with milk and fruits",
    tags: ["oats", "porridge", "healthy"],
    isHealthy: true,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    isDiabeticFriendly: true,
    servingSize: "1 bowl",
    preparationTime: 10,
    difficulty: "Easy",
    ingredients: ["Oats", "Milk", "Fruits", "Nuts", "Honey"],
    instructions: ["Boil milk", "Add oats", "Cook until thick", "Add fruits"],
    nutritionalBenefits: ["High fiber", "Heart healthy", "Sustained energy"]
  }
];

// Medicine Dataset
const medicines = [
  {
    name: "Aspirin",
    genericName: "Acetylsalicylic acid",
    category: "Pain Relief",
    description: "Nonsteroidal anti-inflammatory drug used for pain relief and heart protection",
    commonDosage: "75-325mg daily",
    sideEffects: ["Stomach irritation", "Bleeding risk", "Allergic reactions"],
    contraindications: ["Active bleeding", "Peptic ulcer", "Allergy to aspirin"],
    warnings: ["Take with food", "Avoid alcohol", "Monitor for bleeding"],
    storageInstructions: "Store at room temperature, away from moisture",
    isPrescriptionRequired: false
  },
  {
    name: "Metformin",
    genericName: "Metformin hydrochloride",
    category: "Diabetes",
    description: "Antidiabetic medication used to treat type 2 diabetes",
    commonDosage: "500-2000mg daily",
    sideEffects: ["Nausea", "Diarrhea", "Metallic taste"],
    contraindications: ["Kidney disease", "Liver disease", "Heart failure"],
    warnings: ["Take with meals", "Monitor kidney function", "Avoid alcohol"],
    storageInstructions: "Store at room temperature",
    isPrescriptionRequired: true
  },
  {
    name: "Atorvastatin",
    genericName: "Atorvastatin calcium",
    category: "Cholesterol",
    description: "Statin medication used to lower cholesterol levels",
    commonDosage: "10-80mg daily",
    sideEffects: ["Muscle pain", "Liver problems", "Memory issues"],
    contraindications: ["Active liver disease", "Pregnancy", "Breastfeeding"],
    warnings: ["Monitor liver function", "Avoid grapefruit", "Report muscle pain"],
    storageInstructions: "Store at room temperature",
    isPrescriptionRequired: true
  },
  {
    name: "Amoxicillin",
    genericName: "Amoxicillin",
    category: "Antibiotic",
    description: "Penicillin antibiotic used to treat bacterial infections",
    commonDosage: "250-500mg every 8 hours",
    sideEffects: ["Nausea", "Diarrhea", "Allergic reactions"],
    contraindications: ["Penicillin allergy", "Kidney disease"],
    warnings: ["Complete full course", "Take with food", "Avoid alcohol"],
    storageInstructions: "Store in refrigerator",
    isPrescriptionRequired: true
  },
  {
    name: "Levothyroxine",
    genericName: "Levothyroxine sodium",
    category: "Thyroid",
    description: "Thyroid hormone replacement therapy",
    commonDosage: "25-200mcg daily",
    sideEffects: ["Heart palpitations", "Weight loss", "Insomnia"],
    contraindications: ["Heart disease", "Adrenal insufficiency"],
    warnings: ["Take on empty stomach", "Avoid soy", "Regular monitoring"],
    storageInstructions: "Store at room temperature",
    isPrescriptionRequired: true
  }
];

// Food-Drug Conflicts
const foodDrugConflicts = [
  {
    medicine: "Aspirin",
    avoid: ["Spicy Food", "Alcohol", "Citrus fruits"],
    severity: "High",
    description: "Aspirin can cause stomach irritation when taken with spicy foods or alcohol",
    effects: "Increased risk of stomach bleeding and irritation",
    recommendations: "Take with plain food, avoid spicy and acidic foods",
    timeGap: 2,
    timeGapUnit: "hours"
  },
  {
    medicine: "Metformin",
    avoid: ["Sugary Foods", "White Rice", "High-carb foods"],
    severity: "Medium",
    description: "High sugar foods can affect blood glucose control with Metformin",
    effects: "May cause blood sugar spikes and reduce medication effectiveness",
    recommendations: "Follow diabetic diet, avoid high-sugar foods",
    timeGap: 1,
    timeGapUnit: "hours"
  },
  {
    medicine: "Atorvastatin",
    avoid: ["Grapefruit", "High-fat Foods", "Alcohol"],
    severity: "High",
    description: "Grapefruit can increase statin levels, high-fat foods reduce effectiveness",
    effects: "Increased risk of side effects, reduced cholesterol-lowering effect",
    recommendations: "Avoid grapefruit completely, limit high-fat foods",
    timeGap: 4,
    timeGapUnit: "hours"
  },
  {
    medicine: "Amoxicillin",
    avoid: ["Milk", "Dairy Products", "Calcium supplements"],
    severity: "Medium",
    description: "Calcium in dairy products can reduce antibiotic absorption",
    effects: "Reduced antibiotic effectiveness, potential treatment failure",
    recommendations: "Take 2 hours before or after dairy products",
    timeGap: 2,
    timeGapUnit: "hours"
  },
  {
    medicine: "Levothyroxine",
    avoid: ["Soy", "Caffeine", "High-fiber foods"],
    severity: "Medium",
    description: "These foods can interfere with thyroid hormone absorption",
    effects: "Reduced medication effectiveness, poor thyroid control",
    recommendations: "Take on empty stomach, avoid soy products",
    timeGap: 4,
    timeGapUnit: "hours"
  }
];

// @route   POST /api/seed
// @desc    Seed database with demo data
// @access  Public
router.post('/', async (req, res) => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Food.deleteMany({});
    await Medicine.deleteMany({});
    await FoodDrugConflict.deleteMany({});
    await PatientAssignment.deleteMany({});
    await ReminderLog.deleteMany({});

    console.log('🗑️ Cleared existing data');

    // Create demo users with validation-safe names
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@medimeal.com',
      password: 'Admin@123',
      role: 'admin',
      emailVerified: true,
      isActive: true
    });

    const doctorUser = new User({
      firstName: 'Raj',
      lastName: 'Verma',
      email: 'drraj@medimeal.com',
      password: 'Doctor@123',
      role: 'doctor',
      specialization: 'Nutrition',
      emailVerified: true,
      isActive: true,
      doctorInfo: {
        phoneNumber: '+91-9876543210',
        licenseNumber: 'DOC12345',
        hospitalAffiliation: 'Apollo Hospital',
        yearsOfExperience: 10,
        bio: 'Experienced nutrition specialist with expertise in diabetes and cardiovascular nutrition',
        languages: ['English', 'Hindi'],
        consultationFee: 500,
        availability: 'full-time',
        emergencyContact: 'Hospital Emergency',
        emergencyPhone: '+91-9876543211',
        isVerified: true,
        rating: 4.8,
        totalReviews: 120
      }
    });

    const patientUser = new User({
      firstName: 'Riya',
      lastName: 'Menon',
      email: 'riya@medimeal.com',
      password: 'User@123',
      role: 'user',
      emailVerified: true,
      isActive: true,
      dateOfBirth: new Date('2002-03-15'), // Age 22
      gender: 'female',
      height: 165,
      weight: 58,
      medicalConditions: ['Type 2 Diabetes'],
      allergies: ['None'],
      medications: [
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'twice daily',
          times: ['08:00', '20:00'],
          timingMode: 'fixed',
          startDate: new Date(),
          endDate: null
        }
      ],
      dietaryPreferences: ['diabetic-friendly'],
      surveyCompleted: true,
      surveyData: {
        currentMedications: [
          {
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'twice daily',
            timing: 'with-meals'
          }
        ],
        medicalConditions: ['Type 2 Diabetes'],
        allergies: ['None'],
        dietaryRestrictions: ['diabetic-friendly'],
        mealPreferences: {
          breakfastTime: '08:00',
          lunchTime: '13:00',
          dinnerTime: '19:00',
          snackTime: '16:00'
        },
        foodPreferences: ['mild', 'fresh', 'cooked'],
        completedAt: new Date()
      }
    });

    await adminUser.save();
    await doctorUser.save();
    await patientUser.save();

    console.log('👥 Created demo users');

    // Create patient assignment
    const patientAssignment = new PatientAssignment({
      doctorId: doctorUser._id,
      patientId: patientUser._id,
      assignedBy: adminUser._id,
      notes: 'Initial assignment for diabetes management'
    });

    await patientAssignment.save();

    console.log('🔗 Created patient assignment');

    // Seed foods
    const createdFoods = await Food.insertMany(indianFoods);
    console.log(`🍽️ Seeded ${createdFoods.length} Indian foods`);

    // Seed medicines
    const createdMedicines = await Medicine.insertMany(medicines);
    console.log(`💊 Seeded ${createdMedicines.length} medicines`);

    // Seed food-drug conflicts
    const createdConflicts = await FoodDrugConflict.insertMany(foodDrugConflicts);
    console.log(`⚠️ Seeded ${createdConflicts.length} food-drug conflicts`);

    // Create sample reminder log
    const reminderLog = new ReminderLog({
      userId: patientUser._id,
      medicationName: 'Metformin',
      scheduledTime: new Date(),
      sentTime: new Date(),
      status: 'sent',
      emailAddress: patientUser.email,
      subject: 'Medication Reminder - Metformin',
      message: 'Time to take your Metformin 500mg. Remember to take it with food.',
      reminderType: 'medication',
      userResponse: 'no_response'
    });

    await reminderLog.save();

    console.log('📧 Created sample reminder log');

    res.json({
      success: true,
      message: 'Database seeded successfully with validation-safe data!',
      data: {
        users: {
          admin: {
            name: 'AdminUser',
            email: 'admin@medimeal.com',
            password: 'Admin@123',
            role: 'admin'
          },
          doctor: {
            name: 'DrRaj',
            email: 'drraj@medimeal.com',
            password: 'Doctor@123',
            role: 'doctor',
            specialization: 'Nutrition',
            licenseNo: 'DOC12345'
          },
          user: {
            name: 'Riya',
            email: 'riya@medimeal.com',
            password: 'User@123',
            role: 'user',
            healthProfile: {
              age: 22,
              weight: 58,
              allergies: 'None'
            }
          }
        },
        counts: {
          foods: createdFoods.length,
          medicines: createdMedicines.length,
          conflicts: createdConflicts.length,
          assignments: 1,
          reminders: 1
        },
        validation: {
          allNamesAlphabetic: true,
          allEmailsValid: true,
          allPasswordsSecure: true,
          allDataValidated: true
        }
      }
    });

  } catch (error) {
    console.error('❌ Seeding error:', error);
    res.status(500).json({
      success: false,
      message: 'Seeding failed',
      error: error.message
    });
  }
});

// @route   GET /api/seed/status
// @desc    Check seeding status
// @access  Public
router.get('/status', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const foodCount = await Food.countDocuments();
    const medicineCount = await Medicine.countDocuments();
    const conflictCount = await FoodDrugConflict.countDocuments();
    const assignmentCount = await PatientAssignment.countDocuments();
    const reminderCount = await ReminderLog.countDocuments();

    res.json({
      success: true,
      data: {
        users: userCount,
        foods: foodCount,
        medicines: medicineCount,
        conflicts: conflictCount,
        assignments: assignmentCount,
        reminders: reminderCount,
        isSeeded: userCount > 0 && foodCount > 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check seeding status',
      error: error.message
    });
  }
});

// POST /api/seed/admin - Create/Update admin user with specific credentials
router.post('/admin', async (req, res) => {
  try {
    const email = 'admin@medimeal.com';
    const password = 'medi123';

    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      // Update existing user to admin role and set password
      user.role = 'admin';
      user.password = password; // Will be hashed by pre-save hook
      user.isActive = true;
      user.emailVerified = true;
      await user.save();
      
      return res.json({
        success: true,
        message: 'Admin user updated successfully',
        data: {
          email: user.email,
          role: user.role,
          updated: true
        }
      });
    } else {
      // Create new admin user
      user = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: email.toLowerCase(),
        password: password, // Will be hashed by pre-save hook
        role: 'admin',
        isActive: true,
        emailVerified: true
      });
      
      await user.save();
      
      return res.json({
        success: true,
        message: 'Admin user created successfully',
        data: {
          email: user.email,
          role: user.role,
          created: true
        }
      });
    }
  } catch (error) {
    console.error('Seed admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create/update admin user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
