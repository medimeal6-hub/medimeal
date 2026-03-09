import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class CacheService {
  static const String _mealPlanKey = 'cached_meal_plan';
  static const String _foodDiaryKey = 'cached_food_diary';
  static const String _appointmentsKey = 'cached_appointments';
  static const Duration _cacheExpiry = Duration(minutes: 5);

  // Cache meal plan
  static Future<void> cacheMealPlan(List<dynamic> mealPlan) async {
    final prefs = await SharedPreferences.getInstance();
    final data = {
      'data': mealPlan,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    };
    await prefs.setString(_mealPlanKey, jsonEncode(data));
  }

  // Get cached meal plan
  static Future<List<dynamic>?> getCachedMealPlan() async {
    final prefs = await SharedPreferences.getInstance();
    final cached = prefs.getString(_mealPlanKey);
    
    if (cached == null) return null;
    
    final data = jsonDecode(cached);
    final timestamp = DateTime.fromMillisecondsSinceEpoch(data['timestamp']);
    
    // Check if cache is still valid
    if (DateTime.now().difference(timestamp) > _cacheExpiry) {
      return null;
    }
    
    return List<dynamic>.from(data['data']);
  }

  // Cache food diary
  static Future<void> cacheFoodDiary(List<dynamic> foodDiary) async {
    final prefs = await SharedPreferences.getInstance();
    final data = {
      'data': foodDiary,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    };
    await prefs.setString(_foodDiaryKey, jsonEncode(data));
  }

  // Get cached food diary
  static Future<List<dynamic>?> getCachedFoodDiary() async {
    final prefs = await SharedPreferences.getInstance();
    final cached = prefs.getString(_foodDiaryKey);
    
    if (cached == null) return null;
    
    final data = jsonDecode(cached);
    final timestamp = DateTime.fromMillisecondsSinceEpoch(data['timestamp']);
    
    if (DateTime.now().difference(timestamp) > _cacheExpiry) {
      return null;
    }
    
    return List<dynamic>.from(data['data']);
  }

  // Cache appointments
  static Future<void> cacheAppointments(List<dynamic> appointments) async {
    final prefs = await SharedPreferences.getInstance();
    final data = {
      'data': appointments,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    };
    await prefs.setString(_appointmentsKey, jsonEncode(data));
  }

  // Get cached appointments
  static Future<List<dynamic>?> getCachedAppointments() async {
    final prefs = await SharedPreferences.getInstance();
    final cached = prefs.getString(_appointmentsKey);
    
    if (cached == null) return null;
    
    final data = jsonDecode(cached);
    final timestamp = DateTime.fromMillisecondsSinceEpoch(data['timestamp']);
    
    if (DateTime.now().difference(timestamp) > _cacheExpiry) {
      return null;
    }
    
    return List<dynamic>.from(data['data']);
  }

  // Clear all cache
  static Future<void> clearAllCache() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_mealPlanKey);
    await prefs.remove(_foodDiaryKey);
    await prefs.remove(_appointmentsKey);
  }
}
