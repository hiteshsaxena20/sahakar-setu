import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/stat_card.dart';
import '../../../l10n/app_localizations.dart';

final coursesProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  // In real app, call API service
  await Future.delayed(const Duration(milliseconds: 500));
  return [
    {
      'id': '1',
      'title': 'Cooperative Principles & Values',
      'programme': 'Dairy Cooperative Management',
      'language': 'en',
      'modules': 8,
      'duration': '20 hrs',
      'progress': 0.65,
      'nextSession': 'Tomorrow 10:00 AM',
    },
    {
      'id': '2',
      'title': 'सहकारी सिद्धांत और मूल्य',
      'programme': 'Dairy Cooperative Management',
      'language': 'hi',
      'modules': 8,
      'duration': '20 hrs',
      'progress': 0.30,
      'nextSession': 'In 2 days',
    },
    {
      'id': '3',
      'title': 'Dairy Farm Management',
      'programme': 'Dairy Cooperative Management',
      'language': 'en',
      'modules': 12,
      'duration': '35 hrs',
      'progress': 0.90,
      'nextSession': 'Completed',
    },
    {
      'id': '4',
      'title': 'Financial Management for Cooperatives',
      'programme': 'Financial Management for Cooperatives',
      'language': 'en',
      'modules': 10,
      'duration': '25 hrs',
      'progress': 0.15,
      'nextSession': 'Next Monday',
    },
  ];
});

class CoursesPage extends ConsumerWidget {
  const CoursesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final coursesAsync = ref.watch(coursesProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.courses),
        actions: [
          IconButton(
            icon: const Icon(Icons.download_outlined),
            onPressed: () {},
            tooltip: l10n.downloadContent,
          ),
          IconButton(
            icon: const Icon(Icons.sync_outlined),
            onPressed: () {},
            tooltip: l10n.syncNow,
          ),
        ],
      ),
      body: coursesAsync.when(
        data: (courses) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(coursesProvider);
          },
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: courses.length,
            itemBuilder: (context, index) {
              final course = courses[index];
              return _CourseCard(
                course: course,
                onTap: () => context.go('/courses/${course['id']}'),
              );
            },
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: AppTheme.error),
              const SizedBox(height: 16),
              Text(l10n.error),
              const SizedBox(height: 16),
              CustomButton(
                text: l10n.retry,
                onPressed: () => ref.invalidate(coursesProvider),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CourseCard extends StatelessWidget {
  final Map<String, dynamic> course;
  final VoidCallback onTap;

  const _CourseCard({required this.course, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final progress = (course['progress'] as double?) ?? 0.0;
    final language = course['language'] as String? ?? 'en';
    
    Color languageColor;
    switch (language) {
      case 'hi': languageColor = AppTheme.warning; break;
      case 'ta': languageColor = AppTheme.info; break;
      case 'te': languageColor = AppTheme.error; break;
      default: languageColor = AppTheme.primary600;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.primary50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.menu_book, size: 24, color: AppTheme.primary600),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          course['title'] as String? ?? '',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          course['programme'] as String? ?? '',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.gray600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: languageColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      language.toUpperCase(),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: languageColor,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${l10n.modules}: ${course['modules']}',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.gray600,
                          ),
                        ),
                        Text(
                          course['duration'] as String? ?? '',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.gray600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '${(progress * 100).toInt()}%',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppTheme.primary600,
                        ),
                      ),
                      Text(
                        l10n.completed,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppTheme.gray500,
                        ),
                      ),
                    ],
                  ),
                ],
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
              Text(
                course['nextSession'] as String? ?? '',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppTheme.primary600,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}