import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static const String appName = 'Sahakar Setu';
  static const String appVersion = '1.0.0';
  
  // API Configuration
  static String get apiBaseUrl => dotenv.env['API_BASE_URL'] ?? 'http://10.0.2.2:3000/api';
  static String get keycloakUrl => dotenv.env['KEYCLOAK_URL'] ?? 'http://10.0.2.2:8080';
  static String get keycloakRealm => dotenv.env['KEYCLOAK_REALM'] ?? 'sahakar';
  static String get keycloakClientId => dotenv.env['KEYCLOAK_CLIENT_ID'] ?? 'mobile-app';
  
  // Storage Keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  static const String localeKey = 'app_locale';
  static const String offlineModeKey = 'offline_mode';
  static const String lastSyncKey = 'last_sync';
  
  // Sync Configuration
  static const int syncIntervalMinutes = 15;
  static const int maxSyncRetries = 3;
  static const int syncBatchSize = 50;
  
  // Cache Configuration
  static const int maxCacheSizeMB = 100;
  static const int cacheExpiryDays = 30;
  
  // Attendance Configuration
  static const double geofenceRadiusMeters = 100.0;
  static const int qrTokenExpiryHours = 24;
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // File Upload
  static const int maxFileSizeMB = 10;
  static const List<String> allowedImageTypes = ['jpg', 'jpeg', 'png'];
  static const List<String> allowedDocumentTypes = ['pdf', 'doc', 'docx'];
}