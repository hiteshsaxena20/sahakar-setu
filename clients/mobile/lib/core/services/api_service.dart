import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/auth_provider.dart';

final apiServiceProvider = Provider<ApiService>((ref) {
  final dio = ref.watch(dioProvider);
  return ApiService(dio);
});

class ApiService {
  final Dio _dio;

  ApiService(this._dio);

  // Helper to handle offline-first requests
  Future<T> _request<T>({
    required String method,
    required String path,
    Map<String, dynamic>? data,
    Map<String, dynamic>? queryParameters,
    bool requireAuth = true,
    bool cacheResponse = false,
    String? cacheKey,
  }) async {
    try {
      final options = Options(
        method: method,
        headers: requireAuth ? {'Authorization': _dio.options.headers['Authorization']} : null,
      );

      final response = await _dio.request(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );

      return response.data as T;
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.connectionError) {
        throw OfflineException('No internet connection');
      }
      throw ApiException(
        e.response?.data?['error'] ?? e.message ?? 'API Error',
        statusCode: e.response?.statusCode,
      );
    }
  }

  // Auth
  Future<Map<String, dynamic>> login(String username, String password) {
    return _request(
      method: 'POST',
      path: '/auth/login',
      data: {'username': username, 'password': password},
      requireAuth: false,
    );
  }

  Future<Map<String, dynamic>> refreshToken(String refreshToken) {
    return _request(
      method: 'POST',
      path: '/auth/refresh',
      data: {'refresh_token': refreshToken},
      requireAuth: false,
    );
  }

  Future<Map<String, dynamic>> getProfile() {
    return _request(
      method: 'GET',
      path: '/auth/me',
      cacheResponse: true,
      cacheKey: 'profile',
    );
  }

  // ERP - Programmes
  Future<Map<String, dynamic>> getProgrammes({
    int page = 1,
    int limit = 20,
    String? institutionId,
    String? status,
  }) {
    return _request(
      method: 'GET',
      path: '/erp/programmes',
      queryParameters: {
        'page': page,
        'limit': limit,
        if (institutionId != null) 'institution_id': institutionId,
        if (status != null) 'status': status,
      },
      cacheResponse: true,
      cacheKey: 'programmes',
    );
  }

  Future<Map<String, dynamic>> getProgramme(String programmeId) {
    return _request(
      method: 'GET',
      path: '/erp/programmes/$programmeId',
      cacheResponse: true,
      cacheKey: 'programme_$programmeId',
    );
  }

  // ERP - Nominations
  Future<Map<String, dynamic>> getNominations({
    int page = 1,
    int limit = 20,
    String? programmeId,
    String? status,
  }) {
    return _request(
      method: 'GET',
      path: '/erp/nominations',
      queryParameters: {
        'page': page,
        'limit': limit,
        if (programmeId != null) 'programme_id': programmeId,
        if (status != null) 'status': status,
      },
    );
  }

  Future<Map<String, dynamic>> createNomination(Map<String, dynamic> nomination) {
    return _request(
      method: 'POST',
      path: '/erp/nominations',
      data: nomination,
    );
  }

  // ERP - Trainees
  Future<Map<String, dynamic>> getTraineeProfile(String traineeId) {
    return _request(
      method: 'GET',
      path: '/erp/trainees/$traineeId',
      cacheResponse: true,
      cacheKey: 'trainee_$traineeId',
    );
  }

  Future<Map<String, dynamic>> getMyProfile() {
    return _request(
      method: 'GET',
      path: '/erp/trainees/by-user/me',
      cacheResponse: true,
      cacheKey: 'my_profile',
    );
  }

  // LMS - Courses
  Future<Map<String, dynamic>> getCourses({
    int page = 1,
    int limit = 20,
    String? programmeId,
    String? language,
  }) {
    return _request(
      method: 'GET',
      path: '/lms/courses',
      queryParameters: {
        'page': page,
        'limit': limit,
        if (programmeId != null) 'programme_id': programmeId,
        if (language != null) 'language': language,
      },
      cacheResponse: true,
      cacheKey: 'courses',
    );
  }

  Future<Map<String, dynamic>> getCourse(String courseId) {
    return _request(
      method: 'GET',
      path: '/lms/courses/$courseId',
      cacheResponse: true,
      cacheKey: 'course_$courseId',
    );
  }

  Future<Map<String, dynamic>> getModules(String courseId) {
    return _request(
      method: 'GET',
      path: '/lms/modules',
      queryParameters: {'course_id': courseId},
      cacheResponse: true,
      cacheKey: 'modules_$courseId',
    );
  }

  // LMS - Enrollments
  Future<Map<String, dynamic>> getMyEnrollments() {
    return _request(
      method: 'GET',
      path: '/lms/enrollments',
      queryParameters: {'trainee_id': 'me'},
      cacheResponse: true,
      cacheKey: 'my_enrollments',
    );
  }

  Future<Map<String, dynamic>> enrollInCourse(String courseId) {
    return _request(
      method: 'POST',
      path: '/lms/enrollments',
      data: {'course_id': courseId},
    );
  }

  // LMS - Assessments
  Future<Map<String, dynamic>> getAssessments(String courseId) {
    return _request(
      method: 'GET',
      path: '/lms/assessments',
      queryParameters: {'course_id': courseId},
    );
  }

  Future<Map<String, dynamic>> getAssessment(String assessmentId) {
    return _request(
      method: 'GET',
      path: '/lms/assessments/$assessmentId',
    );
  }

  Future<Map<String, dynamic>> submitAssessment(String enrollmentId, Map<String, dynamic> answers) {
    return _request(
      method: 'POST',
      path: '/lms/enrollments/$enrollmentId/submit-assessment',
      data: answers,
    );
  }

  // LMS - Certificates
  Future<Map<String, dynamic>> getMyCertificates() {
    return _request(
      method: 'GET',
      path: '/lms/certificates',
      queryParameters: {'trainee_id': 'me'},
      cacheResponse: true,
      cacheKey: 'my_certificates',
    );
  }

  Future<Map<String, dynamic>> verifyCertificate(String certificateNumber) {
    return _request(
      method: 'GET',
      path: '/lms/certificates/verify/$certificateNumber',
      requireAuth: false,
    );
  }

  // Attendance
  Future<Map<String, dynamic>> markFaceAttendance({
    required String programmeId,
    required String imageBase64,
    String? traineeId,
    double? lat,
    double? long,
  }) {
    return _request(
      method: 'POST',
      path: '/attendance/face',
      data: {
        'programme_id': programmeId,
        'image_base64': imageBase64,
        if (traineeId != null) 'trainee_id': traineeId,
        if (lat != null) 'lat': lat,
        if (long != null) 'long': long,
      },
    );
  }

  Future<Map<String, dynamic>> markQRAttendance({
    required String programmeId,
    required String qrCode,
    double? lat,
    double? long,
  }) {
    return _request(
      method: 'POST',
      path: '/attendance/qr',
      data: {
        'programme_id': programmeId,
        'qr_code': qrCode,
        if (lat != null) 'lat': lat,
        if (long != null) 'long': long,
      },
    );
  }

  Future<Map<String, dynamic>> getQRCode(String programmeId, {int expiresHours = 24}) {
    return _request(
      method: 'GET',
      path: '/attendance/qr/generate/$programmeId',
      queryParameters: {'expires_hours': expiresHours},
    );
  }

  Future<Map<String, dynamic>> syncAttendance({DateTime? since, int limit = 100}) {
    return _request(
      method: 'GET',
      path: '/attendance/sync',
      queryParameters: {
        if (since != null) 'since': since.toIso8601String(),
        'limit': limit,
      },
    );
  }

  // Employment - Jobs
  Future<Map<String, dynamic>> getJobs({
    int page = 1,
    int limit = 20,
    String? location,
    String? search,
    bool isActive = true,
  }) {
    return _request(
      method: 'GET',
      path: '/employment/jobs',
      queryParameters: {
        'page': page,
        'limit': limit,
        if (location != null) 'location': location,
        if (search != null) 'search': search,
        'is_active': isActive,
      },
      cacheResponse: true,
      cacheKey: 'jobs',
    );
  }

  Future<Map<String, dynamic>> getJob(String jobId) {
    return _request(
      method: 'GET',
      path: '/employment/jobs/$jobId',
      cacheResponse: true,
      cacheKey: 'job_$jobId',
    );
  }

  Future<Map<String, dynamic>> applyToJob(String jobId, {String? coverLetter}) {
    return _request(
      method: 'POST',
      path: '/employment/applications',
      data: {
        'job_id': jobId,
        if (coverLetter != null) 'cover_letter': coverLetter,
      },
    );
  }

  // Employment - Applications
  Future<Map<String, dynamic>> getMyApplications({
    int page = 1,
    int limit = 20,
    String? status,
  }) {
    return _request(
      method: 'GET',
      path: '/employment/applications',
      queryParameters: {
        'page': page,
        'limit': limit,
        if (status != null) 'status': status,
      },
      cacheResponse: true,
      cacheKey: 'my_applications',
    );
  }

  // Employment - Skill Profile
  Future<Map<String, dynamic>> getSkillProfile(String traineeId) {
    return _request(
      method: 'GET',
      path: '/employment/skill-profiles/$traineeId',
      cacheResponse: true,
      cacheKey: 'skill_profile_$traineeId',
    );
  }

  Future<Map<String, dynamic>> refreshSkillProfile(String traineeId) {
    return _request(
      method: 'POST',
      path: '/employment/skill-profiles/$traineeId/refresh',
    );
  }

  // AI - Chatbot
  Future<Map<String, dynamic>> chatWithBot({
    required String message,
    String? language,
    Map<String, dynamic>? context,
  }) {
    return _request(
      method: 'POST',
      path: '/ai/chat',
      data: {
        'message': message,
        if (language != null) 'language': language,
        if (context != null) 'context': context,
      },
    );
  }

  // AI - Skill Gap
  Future<Map<String, dynamic>> analyzeSkillGap({
    required String traineeId,
    required String targetRole,
    List<String>? targetSkills,
  }) {
    return _request(
      method: 'POST',
      path: '/ai/skill-gap',
      data: {
        'trainee_id': traineeId,
        'target_role': targetRole,
        if (targetSkills != null) 'target_skills': targetSkills,
      },
    );
  }

  // AI - Job Match
  Future<Map<String, dynamic>> matchJobCandidates(String jobId, {int topK = 10}) {
    return _request(
      method: 'POST',
      path: '/ai/job-match',
      data: {'job_id': jobId, 'top_k': topK},
    );
  }

  // Analytics
  Future<Map<String, dynamic>> getDashboardSummary() {
    return _request(
      method: 'GET',
      path: '/analytics/dashboard/summary',
    );
  }

  Future<Map<String, dynamic>> getEnrollmentTrends({String granularity = 'monthly', int months = 12}) {
    return _request(
      method: 'GET',
      path: '/analytics/dashboard/enrollment-trends',
      queryParameters: {'granularity': granularity, 'months': months},
    );
  }
}

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, {this.statusCode});

  @override
  String toString() => 'ApiException: $message (Status: $statusCode)';
}

class OfflineException implements Exception {
  final String message;

  OfflineException(this.message);

  @override
  String toString() => 'OfflineException: $message';
}