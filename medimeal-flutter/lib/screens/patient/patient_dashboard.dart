import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';
import '../../providers/appointment_provider.dart';
import '../../providers/meal_provider.dart';

class PatientDashboard extends StatefulWidget {
  const PatientDashboard({super.key});

  @override
  State<PatientDashboard> createState() => _PatientDashboardState();
}

class _PatientDashboardState extends State<PatientDashboard> {
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final appointmentProvider = Provider.of<AppointmentProvider>(context, listen: false);
    final mealProvider = Provider.of<MealProvider>(context, listen: false);
    
    await Future.wait([
      appointmentProvider.fetchUserAppointments(),
      mealProvider.fetchMealPlan(),
      mealProvider.fetchFoodDiary(),
    ]);
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    final List<Widget> pages = [
      _DashboardHome(user: user, onRefresh: _loadData),
      _MealPlanPage(),
      _FoodDiaryPage(),
      _AppointmentsPage(),
    ];

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
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          PopupMenuButton(
            icon: CircleAvatar(
              backgroundColor: const Color(0xFF2563EB),
              child: Text(
                user?.firstName[0].toUpperCase() ?? 'U',
                style: const TextStyle(color: Colors.white),
              ),
            ),
            itemBuilder: (context) => [
              PopupMenuItem(
                child: const ListTile(
                  leading: Icon(Icons.person),
                  title: Text('Profile'),
                  contentPadding: EdgeInsets.zero,
                ),
                onTap: () {},
              ),
              PopupMenuItem(
                child: const ListTile(
                  leading: Icon(Icons.settings),
                  title: Text('Settings'),
                  contentPadding: EdgeInsets.zero,
                ),
                onTap: () {},
              ),
              PopupMenuItem(
                child: const ListTile(
                  leading: Icon(Icons.logout),
                  title: Text('Logout'),
                  contentPadding: EdgeInsets.zero,
                ),
                onTap: () async {
                  await authProvider.logout();
                  if (context.mounted) {
                    context.go('/login');
                  }
                },
              ),
            ],
          ),
        ],
      ),
      body: pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF2563EB),
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.restaurant_menu),
            label: 'Meal Plan',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.book),
            label: 'Food Diary',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today),
            label: 'Appointments',
          ),
        ],
      ),
    );
  }
}

class _DashboardHome extends StatelessWidget {
  final dynamic user;
  final VoidCallback onRefresh;

  const _DashboardHome({required this.user, required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async => onRefresh(),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Section
            Text(
              'Welcome back, ${user?.firstName ?? 'User'}!',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFF111827),
              ),
            ),
            
            const SizedBox(height: 8),
            
            const Text(
              'Track your health and nutrition journey',
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF6B7280),
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Stats Cards
            Row(
              children: [
                Expanded(
                  child: _StatCard(
                    icon: Icons.upload_file,
                    title: 'Prescriptions',
                    value: '3',
                    color: const Color(0xFF2563EB),
                    subtitle: '+1 this week',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _StatCard(
                    icon: Icons.shield,
                    title: 'Conflicts Avoided',
                    value: '12',
                    color: const Color(0xFF10B981),
                    subtitle: '+3 this week',
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 12),
            
            Row(
              children: [
                Expanded(
                  child: _StatCard(
                    icon: Icons.restaurant,
                    title: 'Meals',
                    value: '28',
                    color: const Color(0xFF8B5CF6),
                    subtitle: '+5 this week',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _StatCard(
                    icon: Icons.trending_up,
                    title: 'Progress',
                    value: '85%',
                    color: const Color(0xFFF59E0B),
                    subtitle: 'On track',
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 24),
            
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
                  icon: Icons.restaurant_menu,
                  title: 'View Meal Plan',
                  color: const Color(0xFF2563EB),
                  onTap: () {},
                ),
                _QuickActionCard(
                  icon: Icons.add_circle,
                  title: 'Log Food',
                  color: const Color(0xFF10B981),
                  onTap: () {},
                ),
                _QuickActionCard(
                  icon: Icons.calendar_today,
                  title: 'Book Appointment',
                  color: const Color(0xFF8B5CF6),
                  onTap: () => context.go('/patient/book-appointment'),
                ),
                _QuickActionCard(
                  icon: Icons.insights,
                  title: 'View Insights',
                  color: const Color(0xFFF59E0B),
                  onTap: () {},
                ),
              ],
            ),
            
            const SizedBox(height: 24),
            
            // Today's Meals
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "Today's Meals",
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
            
            Consumer<MealProvider>(
              builder: (context, mealProvider, child) {
                if (mealProvider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }
                
                final meals = mealProvider.mealPlan.take(3).toList();
                
                if (meals.isEmpty) {
                  return Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        children: [
                          Icon(Icons.restaurant, size: 48, color: Colors.grey[400]),
                          const SizedBox(height: 12),
                          Text(
                            'No meals planned yet',
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    ),
                  );
                }
                
                return Column(
                  children: meals.map((meal) => _MealCard(meal: meal)).toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _MealPlanPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<MealProvider>(
      builder: (context, mealProvider, child) {
        return RefreshIndicator(
          onRefresh: () => mealProvider.fetchMealPlan(forceRefresh: true),
          child: mealProvider.isLoading
              ? const Center(child: CircularProgressIndicator())
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: mealProvider.mealPlan.length,
                  itemBuilder: (context, index) {
                    final meal = mealProvider.mealPlan[index];
                    return _MealCard(meal: meal);
                  },
                ),
        );
      },
    );
  }
}

class _FoodDiaryPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<MealProvider>(
      builder: (context, mealProvider, child) {
        return RefreshIndicator(
          onRefresh: () => mealProvider.fetchFoodDiary(forceRefresh: true),
          child: Column(
            children: [
              Expanded(
                child: mealProvider.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: mealProvider.foodDiary.length,
                        itemBuilder: (context, index) {
                          final entry = mealProvider.foodDiary[index];
                          return _FoodDiaryCard(entry: entry);
                        },
                      ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _AppointmentsPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<AppointmentProvider>(
      builder: (context, appointmentProvider, child) {
        return RefreshIndicator(
          onRefresh: () => appointmentProvider.fetchUserAppointments(forceRefresh: true),
          child: appointmentProvider.isLoading
              ? const Center(child: CircularProgressIndicator())
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: appointmentProvider.appointments.length,
                  itemBuilder: (context, index) {
                    final appointment = appointmentProvider.appointments[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: const Color(0xFF2563EB).withOpacity(0.1),
                          child: const Icon(Icons.calendar_today, color: Color(0xFF2563EB)),
                        ),
                        title: Text(appointment.doctorName ?? 'Doctor'),
                        subtitle: Text(
                          '${appointment.appointmentDate.toString().split(' ')[0]} at ${appointment.time}',
                        ),
                        trailing: Chip(
                          label: Text(appointment.status),
                          backgroundColor: appointment.status == 'scheduled'
                              ? Colors.green.withOpacity(0.1)
                              : Colors.grey.withOpacity(0.1),
                        ),
                      ),
                    );
                  },
                ),
        );
      },
    );
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
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFF111827),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF6B7280),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 11,
                color: color,
                fontWeight: FontWeight.w500,
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
                  fontWeight: FontWeight.w500,
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

class _MealCard extends StatelessWidget {
  final dynamic meal;

  const _MealCard({required this.meal});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.restaurant, color: Color(0xFF2563EB)),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    meal['name'] ?? 'Meal',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF111827),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    meal['mealType'] ?? 'Meal',
                    style: const TextStyle(
                      fontSize: 14,
                      color: Color(0xFF6B7280),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${meal['calories'] ?? 0} cal',
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF2563EB),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.arrow_forward_ios, size: 16),
              onPressed: () {},
            ),
          ],
        ),
      ),
    );
  }
}

class _FoodDiaryCard extends StatelessWidget {
  final dynamic entry;

  const _FoodDiaryCard({required this.entry});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: const Color(0xFF10B981).withOpacity(0.1),
          child: const Icon(Icons.fastfood, color: Color(0xFF10B981)),
        ),
        title: Text(entry['foodName'] ?? 'Food'),
        subtitle: Text('${entry['quantity'] ?? ''} • ${entry['calories'] ?? 0} cal'),
        trailing: Text(
          entry['mealType'] ?? '',
          style: const TextStyle(
            fontSize: 12,
            color: Color(0xFF6B7280),
          ),
        ),
      ),
    );
  }
}
