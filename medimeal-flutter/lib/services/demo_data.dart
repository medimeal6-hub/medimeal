class DemoData {
  // Demo Users
  static final Map<String, Map<String, dynamic>> demoUsers = {
    'patient@demo.com': {
      '_id': 'demo_patient_1',
      'email': 'patient@demo.com',
      'password': 'demo123',
      'firstName': 'John',
      'lastName': 'Doe',
      'role': 'user',
      'phone': '+1234567890',
      'isActive': true,
    },
    'doctor@demo.com': {
      '_id': 'demo_doctor_1',
      'email': 'doctor@demo.com',
      'password': 'demo123',
      'firstName': 'Dr. Sarah',
      'lastName': 'Smith',
      'role': 'doctor',
      'specialization': 'Nutritionist',
      'phone': '+1234567891',
      'isActive': true,
    },
  };

  // Demo Appointments
  static final List<Map<String, dynamic>> demoAppointments = [
    {
      '_id': 'apt_1',
      'patientId': 'demo_patient_1',
      'doctorId': 'demo_doctor_1',
      'patientName': 'John Doe',
      'doctorName': 'Dr. Sarah Smith',
      'date': DateTime.now().add(const Duration(days: 2)).toIso8601String(),
      'time': '10:00 AM',
      'status': 'scheduled',
      'type': 'Consultation',
      'notes': 'Regular checkup and diet review',
    },
    {
      '_id': 'apt_2',
      'patientId': 'demo_patient_1',
      'doctorId': 'demo_doctor_1',
      'patientName': 'John Doe',
      'doctorName': 'Dr. Sarah Smith',
      'date': DateTime.now().subtract(const Duration(days: 7)).toIso8601String(),
      'time': '2:00 PM',
      'status': 'completed',
      'type': 'Follow-up',
      'notes': 'Diet plan adjustment',
    },
  ];

  // Demo Meal Plans
  static final List<Map<String, dynamic>> demoMealPlans = [
    {
      '_id': 'meal_1',
      'name': 'Oatmeal with Berries',
      'mealType': 'Breakfast',
      'calories': 350,
      'description': 'Healthy start with whole grains and antioxidants',
      'ingredients': ['Oats', 'Blueberries', 'Strawberries', 'Honey', 'Almond Milk'],
      'protein': 12,
      'carbs': 58,
      'fat': 8,
    },
    {
      '_id': 'meal_2',
      'name': 'Grilled Chicken Salad',
      'mealType': 'Lunch',
      'calories': 420,
      'description': 'Protein-rich meal with fresh vegetables',
      'ingredients': ['Chicken Breast', 'Mixed Greens', 'Tomatoes', 'Cucumber', 'Olive Oil'],
      'protein': 35,
      'carbs': 25,
      'fat': 18,
    },
    {
      '_id': 'meal_3',
      'name': 'Greek Yogurt Parfait',
      'mealType': 'Snack',
      'calories': 180,
      'description': 'Light and refreshing protein snack',
      'ingredients': ['Greek Yogurt', 'Granola', 'Honey', 'Mixed Berries'],
      'protein': 15,
      'carbs': 22,
      'fat': 5,
    },
    {
      '_id': 'meal_4',
      'name': 'Salmon with Quinoa',
      'mealType': 'Dinner',
      'calories': 520,
      'description': 'Omega-3 rich dinner with complete protein',
      'ingredients': ['Salmon Fillet', 'Quinoa', 'Broccoli', 'Lemon', 'Garlic'],
      'protein': 42,
      'carbs': 45,
      'fat': 22,
    },
  ];

  // Demo Food Diary
  static final List<Map<String, dynamic>> demoFoodDiary = [
    {
      '_id': 'diary_1',
      'foodName': 'Scrambled Eggs',
      'calories': 220,
      'quantity': '2 eggs',
      'date': DateTime.now().toIso8601String(),
      'mealType': 'Breakfast',
    },
    {
      '_id': 'diary_2',
      'foodName': 'Chicken Wrap',
      'calories': 380,
      'quantity': '1 wrap',
      'date': DateTime.now().toIso8601String(),
      'mealType': 'Lunch',
    },
    {
      '_id': 'diary_3',
      'foodName': 'Apple',
      'calories': 95,
      'quantity': '1 medium',
      'date': DateTime.now().subtract(const Duration(days: 1)).toIso8601String(),
      'mealType': 'Snack',
    },
  ];

  // Demo Doctors
  static final List<Map<String, dynamic>> demoDoctors = [
    {
      '_id': 'demo_doctor_1',
      'firstName': 'Dr. Sarah',
      'lastName': 'Smith',
      'specialization': 'Nutritionist',
      'email': 'doctor@demo.com',
      'phone': '+1234567891',
      'rating': 4.8,
      'experience': '10 years',
    },
    {
      '_id': 'demo_doctor_2',
      'firstName': 'Dr. Michael',
      'lastName': 'Johnson',
      'specialization': 'Dietitian',
      'email': 'mjohnson@demo.com',
      'phone': '+1234567892',
      'rating': 4.9,
      'experience': '15 years',
    },
  ];
}