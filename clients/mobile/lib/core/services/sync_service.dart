import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';

import '../services/storage_service.dart';
import '../services/api_service.dart';

final syncServiceProvider = Provider<SyncService>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return SyncService(apiService);
});

class SyncService {
  final ApiService _apiService;
  bool _isSyncing = false;
  
  SyncService(this._apiService);

  bool get isSyncing => _isSyncing;

  Future<void> syncAll() async {
    if (_isSyncing) return;
    
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity == ConnectivityResult.none) {
      throw OfflineException('No internet connection');
    }

    _isSyncing = true;
    
    try {
      // Sync pending operations from queue
      await _syncQueue();
      
      // Sync fresh data from server
      await Future.wait([
        _syncCourses(),
        _syncAssessments(),
        _syncCertificates(),
        _syncAttendance(),
        _syncJobs(),
        _syncApplications(),
        _syncSkillProfile(),
      ]);
      
      // Update last sync time
      final settings = StorageService.getSettings();
      settings['last_sync'] = DateTime.now().toIso8601String();
      await StorageService.saveSettings(settings);
      
    } finally {
      _isSyncing = false;
    }
  }

  Future<void> _syncQueue() async {
    final queue = StorageService.getSyncQueue();
    
    for (int i = 0; i < queue.length; i++) {
      final operation = queue[i];
      
      try {
        await _executeOperation(operation);
        await StorageService.removeFromSyncQueue(i);
        i--; // Adjust index after removal
      } catch (e) {
        // Increment retry count
        operation['retries'] = (operation['retries'] ?? 0) + 1;
        if (operation['retries'] >= 3) {
          await StorageService.removeFromSyncQueue(i);
          i--;
        } else {
          await StorageService.updateSyncQueueItem(i, operation);
        }
      }
    }
  }

  Future<void> _executeOperation(Map<String, dynamic> operation) async {
    final type = operation['type'] as String;
    final data = operation['data'] as Map<String, dynamic>;
    
    switch (type) {
      case 'enroll':
        await _apiService.enrollInCourse(data['courseId'] as String);
        break;
      case 'submit_assessment':
        await _apiService.submitAssessment(data['enrollmentId'] as String, data['answers'] as Map<String, dynamic>);
        break;
      case 'apply_job':
        await _apiService.applyToJob(data['jobId'] as String, coverLetter: data['coverLetter'] as String?);
        break;
      case 'face_attendance':
        await _apiService.markFaceAttendance(
          programmeId: data['programmeId'] as String,
          imageBase64: data['imageBase64'] as String,
          traineeId: data['traineeId'] as String?,
          lat: data['lat'] as double?,
          long: data['long'] as double?,
        );
        break;
      case 'qr_attendance':
        await _apiService.markQRAttendance(
          programmeId: data['programmeId'] as String,
          qrCode: data['qrCode'] as String,
          lat: data['lat'] as double?,
          long: data['long'] as double?,
        );
        break;
      case 'refresh_skill_profile':
        await _apiService.refreshSkillProfile(data['traineeId'] as String);
        break;
    }
  }

  Future<void> _syncCourses() async {
    try {
      final response = await _apiService.getCourses(limit: 100);
      final courses = List<Map<String, dynamic>>.from(response['items'] ?? []);
      await StorageService.cacheCourses(courses);
    } catch (e) {
      // Use cached data
    }
  }

  Future<void> _syncAssessments() async {
    try {
      final courses = StorageService.getCachedCourses();
      for (final course in courses) {
        final response = await _apiService.getAssessments(course['_id'] as String);
        final assessments = List<Map<String, dynamic>>.from(response['items'] ?? []);
        // Store per course
      }
    } catch (e) {
      // Use cached data
    }
  }

  Future<void> _syncCertificates() async {
    try {
      final response = await _apiService.getMyCertificates();
      final certs = List<Map<String, dynamic>>.from(response['items'] ?? []);
      await StorageService.cacheCertificates(certs);
    } catch (e) {
      // Use cached data
    }
  }

  Future<void> _syncAttendance() async {
    try {
      final lastSync = StorageService.getSettings()['last_sync'] as String?;
      final since = lastSync != null ? DateTime.parse(lastSync) : null;
      final response = await _apiService.syncAttendance(since: since);
      final logs = List<Map<String, dynamic>>.from(response['logs'] ?? []);
      await StorageService.cacheAttendance(logs);
    } catch (e) {
      // Use cached data
    }
  }

  Future<void> _syncJobs() async {
    try {
      final response = await _apiService.getJobs(limit: 100);
      final jobs = List<Map<String, dynamic>>.from(response['items'] ?? []);
      await StorageService.cacheJobs(jobs);
    } catch (e) {
      // Use cached data
    }
  }

  Future<void> _syncApplications() async {
    try {
      final response = await _apiService.getMyApplications(limit: 100);
      final apps = List<Map<String, dynamic>>.from(response['items'] ?? []);
      await StorageService.cacheApplications(apps);
    } catch (e) {
      // Use cached data
    }
  }

  Future<void> _syncSkillProfile() async {
    try {
      final userData = StorageService.getUserData();
      if (userData != null) {
        final traineeId = userData['id'] as String;
        final response = await _apiService.getSkillProfile(traineeId);
        // Cache skill profile
      }
    } catch (e) {
      // Use cached data
    }
  }

  // Queue operations for offline execution
  Future<void> queueEnrollment(String courseId) async {
    await StorageService.addToSyncQueue({
      'type': 'enroll',
      'data': {'courseId': courseId},
    });
  }

  Future<void> queueAssessmentSubmission(String enrollmentId, Map<String, dynamic> answers) async {
    await StorageService.addToSyncQueue({
      'type': 'submit_assessment',
      'data': {'enrollmentId': enrollmentId, 'answers': answers},
    });
  }

  Future<void> queueJobApplication(String jobId, {String? coverLetter}) async {
    await StorageService.addToSyncQueue({
      'type': 'apply_job',
      'data': {'jobId': jobId, 'coverLetter': coverLetter},
    });
  }

  Future<void> queueFaceAttendance({
    required String programmeId,
    required String imageBase64,
    String? traineeId,
    double? lat,
    double? long,
  }) async {
    await StorageService.addToSyncQueue({
      'type': 'face_attendance',
      'data': {
        'programmeId': programmeId,
        'imageBase64': imageBase64,
        'traineeId': traineeId,
        'lat': lat,
        'long': long,
      },
    });
  }

  Future<void> queueQRAttendance({
    required String programmeId,
    required String qrCode,
    double? lat,
    double? long,
  }) async {
    await StorageService.addToSyncQueue({
      'type': 'qr_attendance',
      'data': {
        'programmeId': programmeId,
        'qrCode': qrCode,
        'lat': lat,
        'long': long,
      },
    });
  }
}

class OfflineException implements Exception {
  final String message;
  OfflineException(this.message);
  @override
  String toString() => 'OfflineException: $message';
}