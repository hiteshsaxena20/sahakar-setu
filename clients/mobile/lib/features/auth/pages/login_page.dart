import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../l10n/app_localizations.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _rememberMe = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    final authNotifier = ref.read(authProvider.notifier);
    
    try {
      await authNotifier.login(
        _usernameController.text.trim(),
        _passwordController.text,
      );
      if (mounted) {
        context.go('/home');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: AppTheme.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final authState = ref.watch(authProvider);
    
    return Scaffold(
      backgroundColor: AppTheme.gray50,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 40),
                // Logo
                Center(
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: AppTheme.primary600,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Icon(
                      Icons.agriculture_outlined,
                      size: 40,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Center(
                  child: Text(
                    'Sahakar Setu',
                    style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppTheme.gray900,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Center(
                  child: Text(
                    l10n.loginSubtitle ?? 'Sign in to access your training dashboard',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: AppTheme.gray600,
                    ),
                  ),
                ),
                const SizedBox(height: 40),
                
                // Username Field
                CustomTextField(
                  controller: _usernameController,
                  label: l10n.username,
                  hint: l10n.enterUsername,
                  prefixIcon: Icons.person_outline,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return l10n.usernameRequired;
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                
                // Password Field
                CustomTextField(
                  controller: _passwordController,
                  label: l10n.password,
                  hint: l10n.enterPassword,
                  prefixIcon: Icons.lock_outline,
                  obscureText: _obscurePassword,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? Icons.visibility_off : Icons.visibility,
                      color: AppTheme.gray400,
                    ),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return l10n.passwordRequired;
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 12),
                
                // Remember Me & Forgot Password
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Checkbox(
                          value: _rememberMe,
                          onChanged: (value) => setState(() => _rememberMe = value ?? false),
                          activeColor: AppTheme.primary600,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                        ),
                        Text(l10n.rememberMe, style: Theme.of(context).textTheme.bodyMedium),
                      ],
                    ),
                    TextButton(
                      onPressed: () {},
                      child: Text(l10n.forgotPassword, style: TextStyle(color: AppTheme.primary600)),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                
                // Login Button
                CustomButton(
                  text: l10n.login,
                  onPressed: _handleLogin,
                  isLoading: authState.isLoading,
                  icon: Icons.login,
                ),
                const SizedBox(height: 24),
                
                // Demo Credentials
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.primary50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.primary200),
                  ),
                  child: Column(
                    children: [
                      Text(
                        l10n.demoCredentials ?? 'Demo Credentials',
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppTheme.primary700,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'admin / admin',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontFamily: 'monospace',
                          color: AppTheme.primary700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'trainer / trainer123',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontFamily: 'monospace',
                          color: AppTheme.primary700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'trainee / trainee123',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontFamily: 'monospace',
                          color: AppTheme.primary700,
                        ),
                      ),
                    ],
                  ),
                ),
                
                if (authState.error != null) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.error.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppTheme.error.withOpacity(0.3)),
                    ),
                    child: Text(
                      authState.error!,
                      style: TextStyle(color: AppTheme.error),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}