import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/cache_service.dart';

class MealProvider with ChangeNotifier {
  List<dynamic> _mealPlan = [];
  List<dynamic> _foodDiary = [];
  bool _isLoading = false;
  String? _error;

  List<dynamic> get mealPlan => _mealPlan;
  List<dynamic> get foodDiary => _foodDiary;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchMealPlan({bool forceRefresh = false}) async {
    // Try to load from cache first for instant display
    if (!forceRefresh) {
      final cached = await CacheService.getCachedMealPlan();
      if (cached != null) {
        _mealPlan = cached;
        notifyListeners();
        // Still fetch fresh data in background
        _fetchMealPlanFromApi();
        return;
      }
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    await _fetchMealPlanFromApi();
  }

  Future<void> _fetchMealPlanFromApi() async {
    try {
      final response = await ApiService.getMealPlan();
      
      if (response['success'] == true) {
        _mealPlan = response['mealPlan'] ?? [];
        await CacheService.cacheMealPlan(_mealPlan);
      } else {
        _error = response['message'] ?? 'Failed to fetch meal plan';
      }
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchFoodDiary({bool forceRefresh = false}) async {
    // Try to load from cache first for instant display
    if (!forceRefresh) {
      final cached = await CacheService.getCachedFoodDiary();
      if (cached != null) {
        _foodDiary = cached;
        notifyListeners();
        // Still fetch fresh data in background
        _fetchFoodDiaryFromApi();
        return;
      }
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    await _fetchFoodDiaryFromApi();
  }

  Future<void> _fetchFoodDiaryFromApi() async {
    try {
      final response = await ApiService.getFoodDiary();
      
      if (response['success'] == true) {
        _foodDiary = response['foodDiary'] ?? [];
        await CacheService.cacheFoodDiary(_foodDiary);
      } else {
        _error = response['message'] ?? 'Failed to fetch food diary';
      }
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addFoodEntry(Map<String, dynamic> data) async {
    try {
      final response = await ApiService.addFoodEntry(data);
      
      if (response['success'] == true) {
        await fetchFoodDiary(forceRefresh: true); // Force refresh after adding
        return true;
      } else {
        _error = response['message'] ?? 'Failed to add food entry';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}
