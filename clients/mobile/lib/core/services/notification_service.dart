import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz;

final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

class NotificationService {
  static Future<void> init() async {
    tz.initializeTimeZones();
    tz.setLocalLocation(tz.getLocation('Asia/Kolkata'));

    const AndroidInitializationSettings initializationSettingsAndroid = AndroidInitializationSettings('@mipmap/ic_launcher');
    const DarwinInitializationSettings initializationSettingsIOS = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    const InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsIOS,
    );

    await flutterLocalNotificationsPlugin.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: _onNotificationTap,
    );

    // Create notification channels for Android
    const AndroidNotificationChannel channel = AndroidNotificationChannel(
      'sahakar_default',
      'Sahakar Setu Notifications',
      description: 'General notifications for Sahakar Setu app',
      importance: Importance.high,
    );
    await flutterLocalNotificationsPlugin.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()?.createNotificationChannel(channel);
  }

  static void _onNotificationTap(NotificationResponse response) {
    // Handle notification tap - navigate based on payload
    if (response.payload != null) {
      // Navigate to relevant page
    }
  }

  static Future<void> showNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
    NotificationPriority priority = NotificationPriority.high,
  }) async {
    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'sahakar_default',
      'Sahakar Setu Notifications',
      channelDescription: 'General notifications for Sahakar Setu app',
      importance: Importance.high,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
    );
    const DarwinNotificationDetails iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );
    const NotificationDetails details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await flutterLocalNotificationsPlugin.show(id, title, body, details, payload: payload);
  }

  static Future<void> scheduleNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledDate,
    String? payload,
  }) async {
    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'sahakar_default',
      'Sahakar Setu Notifications',
      channelDescription: 'General notifications for Sahakar Setu app',
      importance: Importance.high,
      priority: Priority.high,
    );
    const DarwinNotificationDetails iosDetails = DarwinNotificationDetails();
    const NotificationDetails details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await flutterLocalNotificationsPlugin.zonedSchedule(
      id,
      title,
      body,
      tz.TZDateTime.from(scheduledDate, tz.local),
      details,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      payload: payload,
      uiLocalNotificationDateInterpretation: UILocalNotificationDateInterpretation.absoluteTime,
    );
  }

  static Future<void> cancelNotification(int id) async {
    await flutterLocalNotificationsPlugin.cancel(id);
  }

  static Future<void> cancelAllNotifications() async {
    await flutterLocalNotificationsPlugin.cancelAll();
  }

  // Pre-defined notification types
  static Future<void> showAttendanceReminder(String programmeName, DateTime sessionTime) async {
    await showNotification(
      id: sessionTime.millisecondsSinceEpoch ~/ 1000,
      title: 'Attendance Reminder',
      body: 'Session for $programmeName starts in 15 minutes',
      payload: 'attendance_$programmeName',
    );
  }

  static Future<void> showAssessmentDue(String assessmentName, DateTime dueDate) async {
    await showNotification(
      id: dueDate.millisecondsSinceEpoch ~/ 1000,
      title: 'Assessment Due',
      body: '$assessmentName is due tomorrow',
      payload: 'assessment_$assessmentName',
    );
  }

  static Future<void> showCertificateReady(String courseName) async {
    await showNotification(
      id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title: 'Certificate Ready',
      body: 'Your certificate for $courseName is ready to download',
      payload: 'certificate_$courseName',
    );
  }

  static Future<void> showJobMatch(String jobTitle, String employer) async {
    await showNotification(
      id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title: 'New Job Match',
      body: 'You\'re a great match for $jobTitle at $employer',
      payload: 'job_$jobTitle',
    );
  }

  static Future<void> showApplicationUpdate(String jobTitle, String status) async {
    await showNotification(
      id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title: 'Application Update',
      body: 'Your application for $jobTitle is now $status',
      payload: 'application_$jobTitle',
    );
  }
}