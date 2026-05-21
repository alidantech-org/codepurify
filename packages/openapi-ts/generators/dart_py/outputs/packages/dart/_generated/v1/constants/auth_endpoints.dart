class AuthEndpoints {
  const AuthEndpoints();

  /// Check if an email exists and determine the next auth step.
  String get resolveEmail => '/auth/resolve-email';

  /// Register a new user account.
  String get signup => '/auth/signup';

  /// Login a user using email and password.
  String get login => '/auth/login';

  /// Login an admin user using email and password.
  String get adminLogin => '/auth/admin/login';

  /// Authenticate user using Google OAuth.
  String get googleSignIn => '/auth/google';

  /// Verify user email using OTP.
  String get verifyEmail => '/auth/verify-email';

  /// Resend email verification OTP to user.
  String get resendVerificationEmail => '/auth/resend-verification-email';

  /// Request password reset OTP via email.
  String get forgotPassword => '/auth/forgot-password';

  /// Reset password using OTP.
  String get resetPassword => '/auth/reset-password';

  /// Change password for the authenticated user.
  String get changePassword => '/auth/change-password';
}
