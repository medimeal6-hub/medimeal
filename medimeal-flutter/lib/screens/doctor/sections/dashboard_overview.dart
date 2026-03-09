import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/appointment_provider.dart';
import '../../../providers/doctor_dashboard_provider.dart';
import '../../../widgets/appointment_card.dart';

class DashboardOverview extends StatelessWidget {
  final VoidCallback onRefresh;

  const DashboardOverview({super.key, required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async => onRefresh(),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Consumer<DoctorDashboardProvider>(
          builder: (context, dashboardProvider, child) {
            if (dashboardProvider.isLoading && dashboardProvider.dashboardData == null) {
              return const Center(
                child: Padding(
                  padding: EdgeInsets.all(64),
                  child: CircularProgressIndicator(),
                ),
              );
            }

            if (dashboardProvider.error != null) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 64, color: Colors.red),
                      const SizedBox(height: 16),
                      Text(
                        'Error loading dashboard',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: Colors.grey[600],
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        dashboardProvider.error ?? 'Unknown error',
                        style: TextStyle(fontSize: 14, color: Colors.grey[500]),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: onRefresh,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
              );
            }

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Welcome, ${dashboardProvider.doctorName}!',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF111827),
                  ),
                ),
                
                const SizedBox(height: 8),
                
                Text(
                  dashboardProvider.specialization,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Color(0xFF6B7280),
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // Stats Cards
                Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: _StatCard(
                            icon: Icons.calendar_today,
                            title: "Today's Appointments",
                            value: dashboardProvider.todayAppointments.toString(),
                            color: const Color(0xFF2563EB),
                            subtitle: '${dashboardProvider.completedAppointments} completed',
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _StatCard(
                            icon: Icons.pending_actions,
                            title: 'Pending Requests',
                            value: dashboardProvider.pendingAppointments.toString(),
                            color: const Color(0xFFF59E0B),
                            subtitle: 'Needs action',
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 12),
                    
                    Row(
                      children: [
                        Expanded(
                          child: _StatCard(
                            icon: Icons.people,
                            title: 'Total Patients',
                            value: dashboardProvider.totalPatients.toString(),
                            color: const Color(0xFF10B981),
                            subtitle: 'All time',
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _StatCard(
                            icon: Icons.event_note,
                            title: 'All Appointments',
                            value: dashboardProvider.allAppointments.toString(),
                            color: const Color(0xFF8B5CF6),
                            subtitle: 'Total',
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                
                const SizedBox(height: 32),
                
                // Quick Actions
                const Text(
                  'Quick Actions',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF111827),
                  ),
                ),
                
                const SizedBox(height: 12),
                
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 1.5,
                  children: [
                    _QuickActionCard(
                      icon: Icons.person_add,
                      title: 'New Patient',
                      color: const Color(0xFF2563EB),
                      onTap: () {},
                    ),
                    _QuickActionCard(
                      icon: Icons.edit_note,
                      title: 'Write Prescription',
                      color: const Color(0xFF10B981),
                      onTap: () {},
                    ),
                    _QuickActionCard(
                      icon: Icons.restaurant_menu,
                      title: 'Review Diet Plan',
                      color: const Color(0xFF8B5CF6),
                      onTap: () {},
                    ),
                    _QuickActionCard(
                      icon: Icons.analytics,
                      title: 'View Analytics',
                      color: const Color(0xFFF59E0B),
                      onTap: () {},
                    ),
                  ],
                ),
                
                const SizedBox(height: 32),
                
                // Assigned Patients
                if (dashboardProvider.assignedPatients.isNotEmpty) ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Recent Patients',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF111827),
                        ),
                      ),
                      TextButton(
                        onPressed: () {},
                        child: const Text('View All'),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 12),
                  
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: dashboardProvider.assignedPatients.take(5).length,
                    itemBuilder: (context, index) {
                      final patient = dashboardProvider.assignedPatients[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: const Color(0xFF2563EB).withOpacity(0.1),
                            child: Text(
                              patient['name']?.toString().substring(0, 1).toUpperCase() ?? 'P',
                              style: const TextStyle(
                                color: Color(0xFF2563EB),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          title: Text(
                            patient['name'] ?? 'Unknown Patient',
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 4),
                              Text(patient['diagnosis'] ?? 'No diagnosis'),
                              if (patient['appointmentStatus'] != null)
                                Text(
                                  'Status: ${patient['appointmentStatus']}',
                                  style: const TextStyle(fontSize: 12),
                                ),
                            ],
                          ),
                          trailing: patient['priority'] != null
                              ? Chip(
                                  label: Text(
                                    patient['priority'].toString().toUpperCase(),
                                    style: const TextStyle(fontSize: 10),
                                  ),
                                  backgroundColor: _getPriorityColor(patient['priority']),
                                  padding: const EdgeInsets.symmetric(horizontal: 8),
                                )
                              : null,
                        ),
                      );
                    },
                  ),
                  
                  const SizedBox(height: 32),
                ],
                
                // Recent Appointment Requests
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Recent Appointment Requests',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF111827),
                      ),
                    ),
                    TextButton(
                      onPressed: () {},
                      child: const Text('View All'),
                    ),
                  ],
                ),
                
                const SizedBox(height: 12),
                
                Consumer<AppointmentProvider>(
                  builder: (context, appointmentProvider, child) {
                    if (appointmentProvider.isLoading) {
                      return const Center(
                        child: Padding(
                          padding: EdgeInsets.all(32),
                          child: CircularProgressIndicator(),
                        ),
                      );
                    }

                    final pendingAppointments = appointmentProvider.appointments
                        .where((apt) => 
                            apt.status.toUpperCase() == 'REQUESTED' ||
                            apt.status.toUpperCase() == 'APPROVED')
                        .take(5)
                        .toList();

                    if (pendingAppointments.isEmpty) {
                      return Card(
                        child: Padding(
                          padding: const EdgeInsets.all(32),
                          child: Column(
                            children: [
                              Icon(
                                Icons.check_circle_outline,
                                size: 48,
                                color: Colors.green[400],
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'All caught up!',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.grey[600],
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'No pending appointment requests',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.grey[500],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }

                    return ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: pendingAppointments.length,
                      itemBuilder: (context, index) {
                        final appointment = pendingAppointments[index];
                        return AppointmentCard(
                          appointment: appointment,
                          isDoctor: true,
                        );
                      },
                    );
                  },
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Color _getPriorityColor(String? priority) {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'critical':
        return Colors.red.withOpacity(0.2);
      case 'medium':
        return Colors.orange.withOpacity(0.2);
      case 'low':
        return Colors.green.withOpacity(0.2);
      default:
        return Colors.grey.withOpacity(0.2);
    }
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final Color color;
  final String subtitle;

  const _StatCard({
    required this.icon,
    required this.title,
    required this.value,
    required this.color,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(height: 12),
            Text(
              value,
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Color(0xFF111827),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: const TextStyle(
                fontSize: 13,
                color: Color(0xFF6B7280),
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 11,
                color: color,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.icon,
    required this.title,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: color, size: 32),
              const SizedBox(height: 8),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF111827),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
