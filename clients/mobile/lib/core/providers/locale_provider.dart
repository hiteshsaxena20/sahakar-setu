import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

final localeProvider = StateNotifierProvider<LocaleNotifier, Locale>((ref) {
  return LocaleNotifier();
});

class LocaleNotifier extends StateNotifier<Locale> {
  LocaleNotifier() : super(const Locale('en')) {
    _loadLocale();
  }

  Future<void> _loadLocale() async {
    final prefs = await SharedPreferences.getInstance();
    final languageCode = prefs.getString('language_code') ?? 'en';
    final countryCode = prefs.getString('country_code') ?? '';
    state = Locale(languageCode, countryCode.isEmpty ? null : countryCode);
  }

  Future<void> setLocale(Locale locale) async {
    state = locale;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('language_code', locale.languageCode);
    if (locale.countryCode != null && locale.countryCode!.isNotEmpty) {
      await prefs.setString('country_code', locale.countryCode!);
    }
  }

  static const supportedLocales = [
    Locale('en', ''),
    Locale('hi', ''),
    Locale('ta', ''),
    Locale('te', ''),
  ];
}