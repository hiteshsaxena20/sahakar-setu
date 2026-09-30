import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Primary Colors
  static const Color primary50 = Color(0xFFF0FDF4);
  static const Color primary100 = Color(0xFFDCFCE7);
  static const Color primary200 = Color(0xFFBBF7D0);
  static const Color primary300 = Color(0xFF86EFAC);
  static const Color primary400 = Color(0xFF4ADE80);
  static const Color primary500 = Color(0xFF22C55E);
  static const Color primary600 = Color(0xFF16A34A);
  static const Color primary700 = Color(0xFF15803D);
  static const Color primary800 = Color(0xFF166534);
  static const Color primary900 = Color(0xFF14532D);

  // Secondary Colors
  static const Color secondary50 = Color(0xFFFEFCE8);
  static const Color secondary100 = Color(0xFFFEF9C3);
  static const Color secondary200 = Color(0xFFFEF08A);
  static const Color secondary300 = Color(0xFFFDE047);
  static const Color secondary400 = Color(0xFFFACC15);
  static const Color secondary500 = Color(0xFFEAB308);
  static const Color secondary600 = Color(0xFFCA8A04);
  static const Color secondary700 = Color(0xFFA16207);
  static const Color secondary800 = Color(0xFF854D0E);
  static const Color secondary900 = Color(0xFF713F12);

  // Neutral Colors
  static const Color gray50 = Color(0xFFF9FAFB);
  static const Color gray100 = Color(0xFFF3F4F6);
  static const Color gray200 = Color(0xFFE5E7EB);
  static const Color gray300 = Color(0xFFD1D5DB);
  static const Color gray400 = Color(0xFF9CA3AF);
  static const Color gray500 = Color(0xFF6B7280);
  static const Color gray600 = Color(0xFF4B5563);
  static const Color gray700 = Color(0xFF374151);
  static const Color gray800 = Color(0xFF1F2937);
  static const Color gray900 = Color(0xFF111827);

  // Semantic Colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      fontFamily: GoogleFonts.inter().fontFamily,
      colorScheme: const ColorScheme.light(
        primary: primary600,
        onPrimary: Colors.white,
        secondary: secondary600,
        onSecondary: Colors.white,
        surface: Colors.white,
        onSurface: gray900,
        error: error,
        onError: Colors.white,
        outline: gray300,
      ),
      scaffoldBackgroundColor: gray50,
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: gray900,
        elevation: 0,
        scrolledUnderElevation: 1,
        shadowColor: Colors.black12,
        surfaceTintColor: Colors.white,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: gray900,
        ),
        iconTheme: const IconThemeData(color: gray700),
      ),
      cardTheme: CardTheme(
        color: Colors.white,
        elevation: 0,
        shadowColor: Colors.black12,
        surfaceTintColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: gray200),
        ),
        margin: EdgeInsets.zero,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary600,
          foregroundColor: Colors.white,
          elevation: 0,
          shadowColor: Colors.transparent,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primary600,
          side: const BorderSide(color: primary600, width: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primary600,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: gray300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: gray300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primary600, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: error),
        ),
        labelStyle: GoogleFonts.inter(color: gray600, fontSize: 16),
        hintStyle: GoogleFonts.inter(color: gray400, fontSize: 16),
        errorStyle: GoogleFonts.inter(color: error, fontSize: 12),
        floatingLabelStyle: GoogleFonts.inter(color: primary600),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: primary600,
        unselectedItemColor: gray400,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
        selectedLabelStyle: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500),
        unselectedLabelStyle: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w400),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.white,
        indicatorColor: primary50,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: primary600,
            );
          }
          return GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w400,
            color: gray500,
          );
        }),
      ),
      tabBarTheme: TabBarTheme(
        labelColor: primary600,
        unselectedLabelColor: gray500,
        indicatorColor: primary600,
        indicatorSize: TabBarIndicatorSize.label,
        labelStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600),
        unselectedLabelStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w400),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: gray100,
        selectedColor: primary100,
        labelStyle: GoogleFonts.inter(color: gray700),
        secondaryLabelStyle: GoogleFonts.inter(color: primary700),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        side: BorderSide.none,
      ),
      dialogTheme: DialogTheme(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        titleTextStyle: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w600, color: gray900),
        contentTextStyle: GoogleFonts.inter(fontSize: 16, color: gray700),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: gray800,
        contentTextStyle: GoogleFonts.inter(color: Colors.white),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        behavior: SnackBarBehavior.floating,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      ),
      dividerTheme: const DividerThemeData(
        color: gray200,
        thickness: 1,
        space: 1,
      ),
      listTileTheme: ListTileThemeData(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        titleTextStyle: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w500, color: gray900),
        subtitleTextStyle: GoogleFonts.inter(fontSize: 14, color: gray600),
        leadingAndTrailingTextStyle: GoogleFonts.inter(fontSize: 14, color: gray600),
        iconColor: gray600,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: primary600,
        linearTrackColor: gray200,
        circularTrackColor: gray200,
      ),
      sliderTheme: SliderThemeData(
        activeTrackColor: primary600,
        inactiveTrackColor: gray200,
        thumbColor: primary600,
        overlayColor: primary100,
        valueIndicatorColor: primary600,
        valueIndicatorTextStyle: GoogleFonts.inter(color: Colors.white),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      fontFamily: GoogleFonts.inter().fontFamily,
      colorScheme: const ColorScheme.dark(
        primary: primary400,
        onPrimary: gray900,
        secondary: secondary400,
        onSecondary: gray900,
        surface: gray800,
        onSurface: gray50,
        error: error,
        onError: Colors.white,
        outline: gray700,
      ),
      scaffoldBackgroundColor: gray900,
      appBarTheme: AppBarTheme(
        backgroundColor: gray900,
        foregroundColor: gray50,
        elevation: 0,
        scrolledUnderElevation: 1,
        shadowColor: Colors.black26,
        surfaceTintColor: gray900,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: gray50,
        ),
        iconTheme: const IconThemeData(color: gray300),
      ),
      cardTheme: CardTheme(
        color: gray800,
        elevation: 0,
        shadowColor: Colors.black26,
        surfaceTintColor: gray800,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: gray700),
        ),
        margin: EdgeInsets.zero,
      ),
    );
  }
}