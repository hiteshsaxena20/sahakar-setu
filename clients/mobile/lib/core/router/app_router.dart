import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/pages/login_page.dart';
import '../../features/auth/pages/splash_page.dart';
import '../../features/home/pages/home_page.dart';
import '../../features/courses/pages/courses_page.dart';
import '../../features/courses/pages/course_detail_page.dart';
import '../../features/courses/pages/assessment_page.dart';
import '../../features/attendance/pages/attendance_page.dart';
import '../../features/attendance/pages/qr_scanner_page.dart';
import '../../features/attendance/pages/face_attendance_page.dart';
import '../../features/certificates/pages/certificates_page.dart';
import '../../features/certificates/pages/certificate_detail_page.dart';
import '../../features/jobs/pages/jobs_page.dart';
import '../../features/jobs/pages/job_detail_page.dart';
import '../../features/jobs/pages/applications_page.dart';
import '../../features/chatbot/pages/chatbot_page.dart';
import '../../features/profile/pages/profile_page.dart';
import '../../features/settings/pages/settings_page.dart';
import '../providers/auth_provider.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);
  
  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final isLoggedIn = authState.value?.isLoggedIn ?? false;
      final isAuthRoute = state.matchedLocation.startsWith('/login');
      final isSplash = state.matchedLocation == '/splash';
      
      if (isSplash) return null;
      if (!isLoggedIn && !isAuthRoute) return '/login';
      if (isLoggedIn && isAuthRoute) return '/home';
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      ShellRoute(
        builder: (context, state, child) => HomePage(child: child),
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const _HomeTab(),
          ),
          GoRoute(
            path: '/courses',
            builder: (context, state) => const CoursesPage(),
          ),
          GoRoute(
            path: '/courses/:courseId',
            builder: (context, state) => CourseDetailPage(
              courseId: state.pathParameters['courseId']!,
            ),
          ),
          GoRoute(
            path: '/assessment/:assessmentId',
            builder: (context, state) => AssessmentPage(
              assessmentId: state.pathParameters['assessmentId']!,
            ),
          ),
          GoRoute(
            path: '/attendance',
            builder: (context, state) => const AttendancePage(),
          ),
          GoRoute(
            path: '/qr-scanner/:programmeId',
            builder: (context, state) => QRScannerPage(
              programmeId: state.pathParameters['programmeId']!,
            ),
          ),
          GoRoute(
            path: '/face-attendance/:programmeId',
            builder: (context, state) => FaceAttendancePage(
              programmeId: state.pathParameters['programmeId']!,
            ),
          ),
          GoRoute(
            path: '/certificates',
            builder: (context, state) => const CertificatesPage(),
          ),
          GoRoute(
            path: '/certificates/:certificateId',
            builder: (context, state) => CertificateDetailPage(
              certificateId: state.pathParameters['certificateId']!,
            ),
          ),
          GoRoute(
            path: '/jobs',
            builder: (context, state) => const JobsPage(),
          ),
          GoRoute(
            path: '/jobs/:jobId',
            builder: (context, state) => JobDetailPage(
              jobId: state.pathParameters['jobId']!,
            ),
          ),
          GoRoute(
            path: '/applications',
            builder: (context, state) => const ApplicationsPage(),
          ),
          GoRoute(
            path: '/chatbot',
            builder: (context, state) => const ChatbotPage(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfilePage(),
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsPage(),
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text('Page not found: ${state.error}'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context.go('/home'),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
  );
});

class _HomeTab extends StatelessWidget {
  const _HomeTab();

  @override
  Widget build(BuildContext context) {
    return const HomePage();
  }
}