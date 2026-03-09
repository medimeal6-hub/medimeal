import 'package:flutter/material.dart';
import '../services/api_service.dart';

class DoctorDashboardProvider with ChangeNotifier {
  Map<String, dynamic>? _dashboardData;
  bool _isLoading = false;
  String? _error;

  Map<String, dynamic>? get dashboardData => _dashboardData;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Stats getters
  int get totalPatients => _dashboardData?['stats']?['totalPatients'] ?? 0;
  int get todayAppointments => _dashboardData?['stats']?['todayAppointments'] ?? 0;
  int get completedAppointments => _dashboardData?['stats']?['completedAppointments'] ?? 0;
  int get pendingAppointments => _dashboardData?['stats']?['pendingAppointments'] ?? 0;
  int get requestedAppointments => _dashboardData?['stats']?['requestedAppointments'] ?? 0;
  int get approvedAppointments => _dashboardData?['stats']?['approvedAppointments'] ?? 0;
  int get allAppointments => _dashboardData?['stats']?['allAppointments'] ?? 0;

  // Doctor info getters
  String get doctorName => _dashboardData?['doctor']?['name'] ?? 'Doctor';
  String get specialization => _dashboardData?['doctor']?['specialization'] ?? 'General Physician';

  // Patients list
  List<dynamic> get assignedPatients => _dashboardData?['assignedPatients'] ?? [];

  // Hospital stats
  Map<String, dynamic> get hospitalStats => _dashboardData?['hospitalStats'] ?? {};

  // Today's schedule
  Map<String, dynamic>? get todaySchedule => _dashboardData?['todaySchedule'];

  // Recent activities
  List<dynamic> get recentActivities => _dashboardData?['recentActivities'] ?? [];

  Future<void> fetchDashboardData({bool forceRefresh = false}) async {
    if (_isLoading) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.getDoctorDashboard();
      
      if (response['success'] == true) {
        _dashboardData = response['data'];
        print('✅ Dashboard data loaded: ${_dashboardData?['stats']}');
      } else {
        _error = response['message'] ?? 'Failed to fetch dashboard data';
      }
    } catch (e) {
      _error = e.toString();
      print('❌ Dashboard error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearData() {
    _dashboardData = null;
    _error = null;
    notifyListeners();
  }
}
