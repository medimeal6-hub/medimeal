import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

import '../models/user_model.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  bool _isLoading = false;
  bool _isInitialized = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isInitialized => _isInitialized;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  // Initialize - check if user is already logged in (non-blocking)
  Future<void> initialize() async {
    // Don't block the UI, just mark as initialized immediately
    _isInitialized = true;
    notifyListeners();

    // Check for saved token in background
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      
      if (token != null) {
        // Try to get current user from backend
        final response = await ApiService.getCurrentUser();
        if (response['success'] == true) {
          // Handle response with 'data' wrapper
          final data = response['data'] ?? response;
          _user = User.fromJson(data['user'] ?? data);
          notifyListeners();
        }
      }
    } catch (e) {
      _error = e.toString();
      // Clear invalid token
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
    }
  }

  // Email/Password Login (Backend API)
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      print('🔵 AuthProvider: Starting login for $email');
      final response = await ApiService.login(email, password);
      print('🔵 AuthProvider: Response received: ${response['success']}');
      
      if (response['success'] == true) {
        // Handle response with 'data' wrapper
        final data = response['data'] ?? response;
        print('🔵 AuthProvider: Parsing user data');
        _user = User.fromJson(data['user']);
        print('🔵 AuthProvider: User parsed: ${_user?.email}');
        
        // Save token and user to local storage
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', data['token']);
        await prefs.setString('user', jsonEncode(data['user']));
        print('✅ AuthProvider: Login successful, token and user saved');
        
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Login failed';
        print('❌ AuthProvider: Login failed - ${_error}');
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      print('❌ AuthProvider: Login error - $e');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Register (Backend API)
  Future<bool> register(Map<String, dynamic> data) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.register(data);
      
      if (response['success'] == true) {
        // Handle response with 'data' wrapper
        final responseData = response['data'] ?? response;
        _user = User.fromJson(responseData['user']);
        
        // Save token and user to local storage
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', responseData['token']);
        await prefs.setString('user', jsonEncode(responseData['user']));
        
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Registration failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user');
    
    _user = null;
    notifyListeners();
  }
}
