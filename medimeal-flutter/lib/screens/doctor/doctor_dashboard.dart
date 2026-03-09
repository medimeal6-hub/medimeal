import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';
import '../../providers/appointment_provider.dart';
import '../../providers/doctor_dashboard_provider.dart';
import 'sections/dashboard_overview.dart';
import 'sections/appointments_section.dart';
import 'sections/patients_section.dart';
import 'sections/schedules_section.dart';
import 'sections/clinical_assistant_section.dart';
import 'sections/alerts_section.dart';
import 'sections/diet_plans_section.dart';
import 'sections/settings_section.dart';

class DoctorDashboard extends StatefulWidget {
  const DoctorDashboard({super.key});

  @override
  State<DoctorDashboard> createState() => _DoctorDashboardState();
}

class _DoctorDashboardState extends State<DoctorDashboard> {
  int _selectedIndex = 0;

  final List<_NavItem> _navItems = [
    // MAIN
    _NavItem(
      icon: Icons.dashboard,
      label: 'Dashboard',
      category: 'MAIN',
    ),
    _NavItem(
      icon: Icons.medical_services,
      label: 'Clinical Assistant',
      category: 'MAIN',
    ),
    _NavItem(
      icon: Icons.calendar_today,
      label: 'Schedules',
      category: 'MAIN',
    ),
    _NavItem(
      icon: Icons.people,
      label: 'Patients',
      category: 'MAIN',
    ),
    _NavItem(
      icon: Icons.event_note,
      label: 'Appointments',
      category: 'MAIN',
    ),
    // CLINICAL
    _NavItem(
      icon: Icons.notifications_active,
      label: 'Alerts',
      category: 'CLINICAL',
    ),
    _NavItem(
      icon: Icons.restaurant_menu,
      label: 'Diet Plans',
      category: 'CLINICAL',
    ),
    // SUPPORT
    _NavItem(
      icon: Icons.settings,
      label: 'Settings',
      category: 'SUPPORT',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final dashboardProvider = Provider.of<DoctorDashboardProvider>(context, listen: false);
    final appointmentProvider = Provider.of<AppointmentProvider>(context, listen: false);
    
    await Future.wait([
      dashboardProvider.fetchDashboardData(),
      appointmentProvider.fetchDoctorAppointments(),
    ]);
  }

  Widget _getContent() {
    switch (_selectedIndex) {
      case 0:
        return DashboardOverview(onRefresh: _loadData);
      case 1:
        return const ClinicalAssistantSection();
      case 2:
        return const SchedulesSection();
      case 3:
        return const PatientsSection();
      case 4:
        return const AppointmentsSection();
      case 5:
        return const AlertsSection();
      case 6:
        return const DietPlansSection();
      case 7:
        return const SettingsSection();
      default:
        return DashboardOverview(onRefresh: _loadData);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final dashboardProvider = Provider.of<DoctorDashboardProvider>(context);
    final user = authProvider.user;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2563EB), Color(0xFF4F46E5)],
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.favorite, color: Colors.white, size: 18),
            ),
            const SizedBox(width: 8),
            const Text('MediMeal'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              // TODO: Implement search
            },
          ),
          IconButton(
            icon: Stack(
              children: [
                const Icon(Icons.notifications_outlined),
                if (dashboardProvider.pendingAppointments > 0)
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 16,
                        minHeight: 16,
                      ),
                      child: Text(
                        '${dashboardProvider.pendingAppointments}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
            onPressed: () {
              setState(() => _selectedIndex = 5); // Go to Alerts
            },
          ),
          PopupMenuButton<String>(
            icon: CircleAvatar(
              backgroundColor: const Color(0xFF2563EB),
              child: Text(
                user?.firstName[0].toUpperCase() ?? 'D',
                style: const TextStyle(color: Colors.white),
              ),
            ),
            itemBuilder: (context) => [
              PopupMenuItem<String>(
                value: 'profile',
                child: ListTile(
                  leading: const Icon(Icons.person),
                  title: Text(dashboardProvider.doctorName),
                  subtitle: Text(dashboardProvider.specialization),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem<String>(
                value: 'settings',
                child: ListTile(
                  leading: Icon(Icons.settings),
                  title: Text('Settings'),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
              const PopupMenuItem<String>(
                value: 'logout',
                child: ListTile(
                  leading: Icon(Icons.logout, color: Colors.red),
                  title: Text('Logout', style: TextStyle(color: Colors.red)),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
            ],
            onSelected: (value) async {
              if (value == 'settings') {
                setState(() => _selectedIndex = 7);
              } else if (value == 'logout') {
                await authProvider.logout();
                if (context.mounted) {
                  context.go('/login');
                }
              }
            },
          ),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF2563EB), Color(0xFF4F46E5)],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: Colors.white,
                    child: Text(
                      user?.firstName[0].toUpperCase() ?? 'D',
                      style: const TextStyle(
                        fontSize: 24,
                        color: Color(0xFF2563EB),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    dashboardProvider.doctorName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    dashboardProvider.specialization,
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
            ..._buildNavItems(),
          ],
        ),
      ),
      body: _getContent(),
    );
  }

  List<Widget> _buildNavItems() {
    final items = <Widget>[];
    String? currentCategory;

    for (int i = 0; i < _navItems.length; i++) {
      final item = _navItems[i];
      
      // Add category header if it's a new category
      if (item.category != currentCategory) {
        currentCategory = item.category;
        items.add(
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text(
              item.category,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: Color(0xFF6B7280),
                letterSpacing: 0.5,
              ),
            ),
          ),
        );
      }

      // Add nav item
      items.add(
        ListTile(
          leading: Icon(
            item.icon,
            color: _selectedIndex == i ? const Color(0xFF2563EB) : const Color(0xFF6B7280),
          ),
          title: Text(
            item.label,
            style: TextStyle(
              color: _selectedIndex == i ? const Color(0xFF2563EB) : const Color(0xFF111827),
              fontWeight: _selectedIndex == i ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
          selected: _selectedIndex == i,
          selectedTileColor: const Color(0xFF2563EB).withOpacity(0.1),
          onTap: () {
            setState(() => _selectedIndex = i);
            Navigator.pop(context); // Close drawer
          },
        ),
      );
    }

    return items;
  }
}

class _NavItem {
  final IconData icon;
  final String label;
  final String category;

  _NavItem({
    required this.icon,
    required this.label,
    required this.category,
  });
}
