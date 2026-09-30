import 'package:hive/hive.dart';
import 'package:path_provider/path_provider.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StorageService {
  static const String _boxName = 'sahakar_cache';
  static const String _userDataKey = 'user_data';
  static const String _coursesKey = 'courses_cache';
  static const String _assessmentsKey = 'assessments_cache';
  static const String _certificatesKey = 'certificates_cache';
  static const String _attendanceKey = 'attendance_cache';
  static const String _jobsKey = 'jobs_cache';
  static const String _applicationsKey = 'applications_cache';
  static const String _syncQueueKey = 'sync_queue';
  static const String _settingsKey = 'settings';

  static late Box _box;
  static late FlutterSecureStorage _secureStorage;

  static Future<void> init() async {
    final appDocDir = await getApplicationDocumentsDirectory();
    Hive.init(appDocDir.path);
    
    _box = await Hive.openBox(_boxName);
    _secureStorage = const FlutterSecureStorage();
  }

  // User Data
  static Future<void> saveUserData(Map<String, dynamic> userData) async {
    await _box.put(_userDataKey, userData);
  }

  static Map<String, dynamic>? getUserData() {
    return _box.get(_userDataKey);
  }

  static Future<void> clearUserData() async {
    await _box.delete(_userDataKey);
  }

  // Cache Management
  static Future<void> cacheCourses(List<Map<String, dynamic>> courses) async {
    await _box.put(_coursesKey, courses);
  }

  static List<Map<String, dynamic>> getCachedCourses() {
    final data = _box.get(_coursesKey);
    return data != null ? List<Map<String, dynamic>>.from(data) : [];
  }

  static Future<void> cacheAssessments(List<Map<String, dynamic>> assessments) async {
    await _box.put(_assessmentsKey, assessments);
  }

  static List<Map<String, dynamic>> getCachedAssessments() {
    final data = _box.get(_assessmentsKey);
    return data != null ? List<Map<String, dynamic>>.from(data) : [];
  }

  static Future<void> cacheCertificates(List<Map<String, dynamic>> certificates) async {
    await _box.put(_certificatesKey, certificates);
  }

  static List<Map<String, dynamic>> getCachedCertificates() {
    final data = _box.get(_certificatesKey);
    return data != null ? List<Map<String, dynamic>>.from(data) : [];
  }

  static Future<void> cacheAttendance(List<Map<String, dynamic>> attendance) async {
    await _box.put(_attendanceKey, attendance);
  }

  static List<Map<String, dynamic>> getCachedAttendance() {
    final data = _box.get(_attendanceKey);
    return data != null ? List<Map<String, dynamic>>.from(data) : [];
  }

  static Future<void> cacheJobs(List<Map<String, dynamic>> jobs) async {
    await _box.put(_jobsKey, jobs);
  }

  static List<Map<String, dynamic>> getCachedJobs() {
    final data = _box.get(_jobsKey);
    return data != null ? List<Map<String, dynamic>>.from(data) : [];
  }

  static Future<void> cacheApplications(List<Map<String, dynamic>> applications) async {
    await _box.put(_applicationsKey, applications);
  }

  static List<Map<String, dynamic>> getCachedApplications() {
    final data = _box.get(_applicationsKey);
    return data != null ? List<Map<String, dynamic>>.from(data) : [];
  }

  // Sync Queue
  static Future<void> addToSyncQueue(Map<String, dynamic> operation) async {
    final queue = getSyncQueue();
    queue.add({
      ...operation,
      'timestamp': DateTime.now().toIso8601String(),
      'retries': 0,
    });
    await _box.put(_syncQueueKey, queue);
  }

  static List<Map<String, dynamic>> getSyncQueue() {
    final data = _box.get(_syncQueueKey);
    return data != null ? List<Map<String, dynamic>>.from(data) : [];
  }

  static Future<void> removeFromSyncQueue(int index) async {
    final queue = getSyncQueue();
    if (index >= 0 && index < queue.length) {
      queue.removeAt(index);
      await _box.put(_syncQueueKey, queue);
    }
  }

  static Future<void> updateSyncQueueItem(int index, Map<String, dynamic> item) async {
    final queue = getSyncQueue();
    if (index >= 0 && index < queue.length) {
      queue[index] = item;
      await _box.put(_syncQueueKey, queue);
    }
  }

  static Future<void> clearSyncQueue() async {
    await _box.delete(_syncQueueKey);
  }

  // Settings
  static Future<void> saveSettings(Map<String, dynamic> settings) async {
    await _box.put(_settingsKey, settings);
  }

  static Map<String, dynamic> getSettings() {
    final data = _box.get(_settingsKey);
    return data != null ? Map<String, dynamic>.from(data) : {};
  }

  // Secure Storage for tokens
  static Future<void> saveSecureString(String key, String value) async {
    await _secureStorage.write(key: key, value: value);
  }

  static Future<String?> getSecureString(String key) async {
    return await _secureStorage.read(key: key);
  }

  static Future<void> deleteSecureString(String key) async {
    await _secureStorage.delete(key: key);
  }

  // Clear all cache
  static Future<void> clearAllCache() async {
    await _box.clear();
  }

  static Future<int> getCacheSize() async {
    // Approximate size in bytes
    return _box.length * 1024; // rough estimate
  }
}