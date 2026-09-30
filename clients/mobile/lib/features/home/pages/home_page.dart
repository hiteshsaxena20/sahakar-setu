import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/stat_card.dart';
import '../../../l10n/app_localizations.dart';

class HomePage extends ConsumerWidget {
  final Widget child;

  const HomePage({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _getSelectedIndex(context),
        onDestinationSelected: (index) => _onDestinationSelected(context, index),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.menu_book_outlined),
            selectedIcon: Icon(Icons.menu_book),
            label: 'Courses',
          ),
          NavigationDestination(
            icon: Icon(Icons.work_outline),
            selectedIcon: Icon(Icons.work),
            label: 'Jobs',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showSyncDialog(context, ref),
        icon: const Icon(Icons.sync),
        label: const Text('Sync'),
        backgroundColor: AppTheme.primary600,
        foregroundColor: Colors.white,
      ),
    );
  }

  int _getSelectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    if (location.startsWith('/courses')) return 1;
    if (location.startsWith('/jobs') || location.startsWith('/applications')) return 2;
    if (location.startsWith('/profile') || location.startsWith('/settings') || location.startsWith('/certificates')) return 3;
    return 0;
  }

  void _onDestinationSelected(BuildContext context, int index) {
    switch (index) {
      case 0: context.go('/home'); break;
      case 1: context.go('/courses'); break;
      case 2: context.go('/jobs'); break;
      case 3: context.go('/profile'); break;
    }
  }

  void _showSyncDialog(BuildContext context, WidgetRef ref) async {
    final syncService = ref.read(syncServiceProvider);
    if (syncService.isSyncing) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Syncing Data'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Syncing your data with server...'),
          ],
        ),
      ),
    );

    try {
      await syncService.syncAll();
      if (context.mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Sync completed successfully!')),
        );
      }
    } catch (e) {
      if (context.mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Sync failed: $e'), backgroundColor: AppTheme.error),
        );
      }
    }
  }
}

class _HomeTab extends ConsumerWidget {
  const _HomeTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.primary600, AppTheme.primary700],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: Colors.white.withOpacity(0.2),
                      child: Text(
                        user?.displayName.isNotEmpty == true 
                            ? user!.displayName[0].toUpperCase() 
                            : 'U',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${l10n.welcomeBack},',
                            style: const TextStyle(color: Colors.white70, fontSize: 14),
                          ),
                          Text(
                            user?.displayName ?? 'User',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        user?.roles.first.toUpperCase() ?? 'TRAINEE',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  l10n.continueLearning ?? 'Continue your learning journey',
                  style: const TextStyle(color: Colors.white70, fontSize: 14),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Quick Stats
          Row(
            children: [
              Expanded(child: StatCard(
                title: l10n.myCourses,
                value: '3',
                icon: Icons.menu_book,
                color: AppTheme.primary600,
              )),
              const SizedBox(width: 12),
              Expanded(child: StatCard(
                title: l10n.pendingAssessments,
                value: '1',
                icon: Icons.quiz_outlined,
                color: AppTheme.warning,
              )),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: StatCard(
                title: l10n.certificatesEarned,
                value: '2',
                icon: Icons.emoji_events,
                color: AppTheme.secondary600,
              )),
              const SizedBox(width: 12),
              Expanded(child: StatCard(
                title: l10n.jobApplications,
                value: '1',
                icon: Icons.work_outline,
                color: AppTheme.info,
              )),
            ],
          ),
          const SizedBox(height: 24),

          // Continue Learning
          Text(
            l10n.continueLearning,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 200,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _CourseCard(
                  title: 'Dairy Cooperative Management',
                  progress: 0.65,
                  nextSession: 'Tomorrow 10:00 AM',
                  onTap: () => context.go('/courses/course-1'),
                ),
                const SizedBox(width: 12),
                _CourseCard(
                  title: 'Financial Management',
                  progress: 0.30,
                  nextSession: 'In 2 days',
                  onTap: () => context.go('/courses/course-2'),
                ),
                const SizedBox(width: 12),
                _CourseCard(
                  title: 'Digital Skills for Rural Youth',
                  progress: 0.90,
                  nextSession: 'Completed',
                  onTap: () => context.go('/courses/course-3'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Quick Actions
          Text(
            l10n.quickActions,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.1,
            children: [
              _ActionCard(
                icon: Icons.menu_book,
                label: l10n.browseCourses,
                color: AppTheme.primary600,
                onTap: () => context.go('/courses'),
              ),
              _ActionCard(
                icon: Icons.quiz,
                label: l10n.takeAssessment,
                color: AppTheme.info,
                onTap: () {},
              ),
              _ActionCard(
                icon: Icons.qr_code_scanner,
                label: l10n.markAttendance,
                color: AppTheme.success,
                onTap: () => context.go('/attendance'),
              ),
              _ActionCard(
                icon: Icons.work,
                label: l10n.findJobs,
                color: AppTheme.secondary600,
                onTap: () => context.go('/jobs'),
              ),
              _ActionCard(
                icon: Icons.emoji_events,
                label: l10n.myCertificates,
                color: AppTheme.warning,
                onTap: () => context.go('/certificates'),
              ),
              _ActionCard(
                icon: Icons.smart_toy,
                label: l10n.careerGuidance,
                color: AppTheme.error,
                onTap: () => context.go('/chatbot'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CourseCard extends StatelessWidget {
  final String title;
  final double progress;
  final String nextSession;
  final VoidCallback onTap;

  const _CourseCard({
    required this.title,
    required this.progress,
    required this.nextSession,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 280,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.gray200),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 80,
              decoration: BoxDecoration(
                color: AppTheme.primary50,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: const Center(
                child: Icon(Icons.menu_book, size: 40, color: AppTheme.primary600),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 12),
                  LinearProgressIndicator(
                    value: progress,
                    backgroundColor: AppTheme.gray200,
                    valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primary600),
                    borderRadius: BorderRadius.circular(4),
                    minHeight: 6,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${(progress * 100).toInt()}% complete',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppTheme.gray600,
                        ),
                      ),
                      Text(
                        nextSession,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppTheme.primary600,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionCard({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.gray200),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, size: 28, color: color),
            ),
            const SizedBox(height: 12),
            Text(
              label,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}