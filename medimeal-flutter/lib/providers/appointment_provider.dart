import 'package:flutter/material.dart';
import '../models/appointment_model.dart';
import '../services/api_service.dart';
import '../services/cache_service.dart';

class AppointmentProvider with ChangeNotifier {
  List<Appointment> _appointments = [];
  bool _isLoading = false;
  String? _error;

  List<Appointment> get appointments => _appointments;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Fetch user appointments
  Future<void> fetchUserAppointments({bool forceRefresh = false}) async {
    // Try to load from cache first for instant display
    if (!forceRefresh) {
      final cached = await CacheService.getCachedAppointments();
      if (cached != null) {
        _appointments = cached
            .map<Appointment>((json) => Appointment.fromJson(json))
            .toList();
        notifyListeners();
        // Still fetch fresh data in background
        _fetchUserAppointmentsFromApi();
        return;
      }
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    await _fetchUserAppointmentsFromApi();
  }

  Future<void> _fetchUserAppointmentsFromApi() async {
    try {
      final response = await ApiService.getUserAppointments();
      
      if (response['success'] == true) {
        final appointmentsData = response['appointments'] ?? [];
        _appointments = appointmentsData
            .map<Appointment>((json) => Appointment.fromJson(json))
            .toList();
        await CacheService.cacheAppointments(appointmentsData);
      } else {
        _error = response['message'] ?? 'Failed to fetch appointments';
      }
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch doctor appointments
  Future<void> fetchDoctorAppointments({bool forceRefresh = false}) async {
    // Try to load from cache first for instant display
    if (!forceRefresh) {
      final cached = await CacheService.getCachedAppointments();
      if (cached != null) {
        _appointments = cached
            .map<Appointment>((json) => Appointment.fromJson(json))
            .toList();
        notifyListeners();
        // Still fetch fresh data in background
        _fetchDoctorAppointmentsFromApi();
        return;
      }
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    await _fetchDoctorAppointmentsFromApi();
  }

  Future<void> _fetchDoctorAppointmentsFromApi() async {
    try {
      print('🔵 Fetching doctor appointments...');
      final response = await ApiService.getDoctorAppointments();
      print('🔵 Response: ${response['success']}');
      
      if (response['success'] == true) {
        // Backend returns 'data' not 'appointments'
        final appointmentsData = response['data'] ?? response['appointments'] ?? [];
        print('🔵 Appointments count: ${appointmentsData.length}');
        _appointments = appointmentsData
            .map<Appointment>((json) => Appointment.fromJson(json))
            .toList();
        await CacheService.cacheAppointments(appointmentsData);
        print('✅ Doctor appointments loaded: ${_appointments.length}');
      } else {
        _error = response['message'] ?? 'Failed to fetch appointments';
        print('❌ Failed to fetch appointments: $_error');
      }
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      print('❌ Error fetching appointments: $e');
      _isLoading = false;
      notifyListeners();
    }
  }

  // Book appointment
  Future<bool> bookAppointment(Map<String, dynamic> data) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.bookAppointment(data);
      
      if (response['success'] == true) {
        await fetchUserAppointments(forceRefresh: true); // Force refresh after booking
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Failed to book appointment';
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
}
