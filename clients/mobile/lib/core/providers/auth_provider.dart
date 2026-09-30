import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

import '../../config/app_config.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class AuthState {
  final bool isLoggedIn;
  final String? accessToken;
  final String? refreshToken;
  final User? user;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.isLoggedIn = false,
    this.accessToken,
    this.refreshToken,
    this.user,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    bool? isLoggedIn,
    String? accessToken,
    String? refreshToken,
    User? user,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class User {
  final String id;
  final String username;
  final String? email;
  final String? firstName;
  final String? lastName;
  final String? phone;
  final String? district;
  final String? pacsId;
  final List<String> roles;
  final String? institutionId;
  final String? institutionName;

  User({
    required this.id,
    required this.username,
    this.email,
    this.firstName,
    this.lastName,
    this.phone,
    this.district,
    this.pacsId,
    required this.roles,
    this.institutionId,
    this.institutionName,
  });

  String get displayName => firstName ?? username;

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? json['_id'] ?? '',
      username: json['username'] ?? '',
      email: json['email'],
      firstName: json['firstName'] ?? json['profile']?['name'],
      lastName: json['lastName'],
      phone: json['phone'] ?? json['profile']?['phone'],
      district: json['district'] ?? json['profile']?['district'],
      pacsId: json['pacsId'] ?? json['profile']?['pacsId'],
      roles: List<String>.from(json['roles'] ?? json['realm_access']?['roles'] ?? []),
      institutionId: json['institutionId'] ?? json['institution_id'],
      institutionName: json['institutionName'] ?? json['institution_name'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'phone': phone,
      'district': district,
      'pacsId': pacsId,
      'roles': roles,
      'institutionId': institutionId,
      'institutionName': institutionName,
    };
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final Dio _dio;
  final FlutterSecureStorage _storage;
  final StorageService _storageService;

  AuthNotifier(this._dio, this._storage, this._storageService) : super(const AuthState()) {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    state = state.copyWith(isLoading: true);
    
    try {
      final accessToken = await _storage.read(key: AppConfig.accessTokenKey);
      final refreshToken = await _storage.read(key: AppConfig.refreshTokenKey);
      final userData = await _storageService.getUserData();

      if (accessToken != null && !JwtDecoder.isExpired(accessToken)) {
        User? user;
        if (userData != null) {
          user = User.fromJson(userData);
        }
        
        state = state.copyWith(
          isLoggedIn: true,
          accessToken: accessToken,
          refreshToken: refreshToken,
          user: user,
          isLoading: false,
        );
        
        _dio.options.headers['Authorization'] = 'Bearer $accessToken';
      } else if (refreshToken != null) {
        await _refreshToken(refreshToken);
      } else {
        state = state.copyWith(isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> login(String username, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final response = await _dio.post('/auth/login', data: {
        'username': username,
        'password': password,
      });
      
      final data = response.data;
      final accessToken = data['access_token'];
      final refreshToken = data['refresh_token'];
      final user = User.fromJson(data['user']);
      
      await _saveAuthData(accessToken, refreshToken, user);
      
      state = state.copyWith(
        isLoggedIn: true,
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: user,
        isLoading: false,
      );
      
      _dio.options.headers['Authorization'] = 'Bearer $accessToken';
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> _refreshToken(String refreshToken) async {
    try {
      final response = await _dio.post('/auth/refresh', data: {
        'refresh_token': refreshToken,
      });
      
      final data = response.data;
      final newAccessToken = data['access_token'];
      final newRefreshToken = data['refresh_token'] ?? refreshToken;
      
      await _storage.write(key: AppConfig.accessTokenKey, value: newAccessToken);
      await _storage.write(key: AppConfig.refreshTokenKey, value: newRefreshToken);
      
      _dio.options.headers['Authorization'] = 'Bearer $newAccessToken';
      
      state = state.copyWith(
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      );
    } catch (e) {
      await logout();
    }
  }

  Future<void> _saveAuthData(String accessToken, String refreshToken, User user) async {
    await _storage.write(key: AppConfig.accessTokenKey, value: accessToken);
    await _storage.write(key: AppConfig.refreshTokenKey, value: refreshToken);
    await _storageService.saveUserData(user.toJson());
  }

  Future<void> logout() async {
    await _storage.delete(key: AppConfig.accessTokenKey);
    await _storage.delete(key: AppConfig.refreshTokenKey);
    await _storageService.clearUserData();
    
    _dio.options.headers.remove('Authorization');
    
    state = const AuthState();
  }

  Future<void> updateUser(User user) async {
    await _storageService.saveUserData(user.toJson());
    state = state.copyWith(user: user);
  }
}

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: AppConfig.apiBaseUrl,
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
    headers: {'Content-Type': 'application/json'},
  ));
  
  dio.interceptors.add(PrettyDioLogger(
    requestHeader: true,
    requestBody: true,
    responseHeader: false,
    responseBody: true,
    error: true,
  ));
  
  return dio;
});

final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOptions(accessibility: KeychainAccessibility.first_unlock_this_device),
  );
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final dio = ref.watch(dioProvider);
  final storage = ref.watch(secureStorageProvider);
  final storageService = ref.watch(storageServiceProvider);
  return AuthNotifier(dio, storage, storageService);
});