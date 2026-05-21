class AuthEndpoints {
  const AuthEndpoints();
  String get resolveEmail => '/auth/resolve-email';
  String get signup => '/auth/signup';
  String get login => '/auth/login';
  String get adminLogin => '/auth/admin/login';
  String get googleSignIn => '/auth/google';
  String get verifyEmail => '/auth/verify-email';
  String get resendVerificationEmail => '/auth/resend-verification-email';
  String get forgotPassword => '/auth/forgot-password';
  String get resetPassword => '/auth/reset-password';
  String get changePassword => '/auth/change-password';
}
