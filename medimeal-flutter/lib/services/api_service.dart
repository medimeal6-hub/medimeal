import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static final String baseUrl = dotenv.env['API_BASE_URL'] ?? 'http://10.0.2.2:5000';
  
  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Auth APIs
  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      print('🔵 API Service: Attempting login to $baseUrl/api/auth/login');
      print('🔵 Email: $email');
      
      final uri = Uri.parse('$baseUrl/api/auth/login');
      print('🔵 Full URI: $uri');
      
      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          print('❌ API Service: Request timeout after 10 seconds');
          throw Exception('Connection timeout. Please check if backend is running.');
        },
      );
      
      print('🔵 API Service: Response status: ${response.statusCode}');
      print('🔵 API Service: Response body: ${response.body}');
      
      return _handleResponse(response);
    } catch (e) {
      print('❌ API Service: Login error: $e');
      rethrow;
    }
  }

  static Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );
    
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> loginWithFirebase(String idToken) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/firebase'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'idToken': idToken}),
    );
    
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> getCurrentUser() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/auth/me'),
      headers: await _getHeaders(),
    );
    
    return _handleResponse(response);
  }

  // Dashboard APIs
  static Future<Map<String, dynamic>> getUserDashboard() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/dashboard'),
      headers: await _getHeaders(),
    );
    
    return _handleResponse(response);
  }

  // Meal Plan APIs
  static Future<Map<String, dynamic>> getMealPlan() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/meal-plan'),
      headers: await _getHeaders(),
    );
    
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> updateMealPlan(Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$baseUrl/api/meal-plan'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    
    return _handleResponse(response);
  }

  // Food Diary APIs
  static Future<Map<String, dynamic>> getFoodDiary() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/food-diary'),
      headers: await _getHeaders(),
    );
    
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> addFoodEntry(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/food-diary'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    
    return _handleResponse(response);
  }

  // Appointment APIs
  static Future<Map<String, dynamic>> bookAppointment(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/appointments/book'),
      headers: await _getHeaders(),
      body: jsonEncode(data),
    );
    
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> getUserAppointments() async {
    // Get current user to get userId
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('user');
    if (userJson == null) {
      throw Exception('User not found');
    }
    
    final user = jsonDecode(userJson);
    final userId = user['_id'] ?? user['id'];
    
    final response = await http.get(
      Uri.parse('$baseUrl/api/appointments/user/$userId'),
      headers: await _getHeaders(),
    );
    
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> getDoctorAppointments() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/doctor/appointments'),
      headers: await _getHeaders(),
    );
    
    return _handleResponse(response);
  }

  // Get available doctors for booking
  static Future<Map<String, dynamic>> getAvailableDoctors() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/user/doctors'),
      headers: await _getHeaders(),
    );
    
    return _handleResponse(response);
  }

  // Doctor APIs
  static Future<Map<String, dynamic>> getDoctorDashboard() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/doctor/dashboard'),
      headers: await _getHeaders(),
    );
    
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> getDoctorPatients() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/doctor/patients'),
      headers: await _getHeaders(),
    );
    
    return _handleResponse(response);
  }

  // Helper method to handle responses
  static Map<String, dynamic> _handleResponse(http.Response response) {
    final data = jsonDecode(response.body);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Request failed');
    }
  }
}
