import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../screens/home_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/main_navigation.dart';
import '../screens/doctor/doctor_dashboard.dart';
import '../screens/doctor/appointments_screen.dart';
import '../screens/patient/book_appointment_screen.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      
      final isLoggedIn = authProvider.isAuthenticated;
      final isOnAuthPages = state.matchedLocation == '/login' || state.matchedLocation == '/register';
      final isOnHomePage = state.matchedLocation == '/';

      // If user is logged in and trying to access home, login, or register, redirect to dashboard
      if (isLoggedIn && (isOnHomePage || isOnAuthPages)) {
        if (authProvider.user?.isDoctor == true) {
          return '/doctor/dashboard';
        }
        return '/dashboard';
      }

      // If user is not logged in and trying to access protected routes, redirect to home
      if (!isLoggedIn && !isOnHomePage && !isOnAuthPages) {
        return '/';
      }

      return null;
    },
    routes: [
      // Home Route
      GoRoute(
        path: '/',
        builder: (context, state) => const HomeScreen(),
      ),

      // Auth Routes
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),

      // Patient Routes
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const MainNavigation(),
      ),
      GoRoute(
        path: '/patient/dashboard',
        builder: (context, state) => const MainNavigation(),
      ),
      GoRoute(
        path: '/patient/book-appointment',
        builder: (context, state) => const BookAppointmentScreen(),
      ),

      // Doctor Routes
      GoRoute(
        path: '/doctor/dashboard',
        builder: (context, state) => const DoctorDashboard(),
      ),
      GoRoute(
        path: '/doctor/appointments',
        builder: (context, state) => const DoctorAppointmentsScreen(),
      ),
    ],
  );
}
