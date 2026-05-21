class ResetPasswordRequest {
  final String email;
  final String otp;
  final String newPassword;
  final String confirmPassword;

  const ResetPasswordRequest({
    required this.email,
    required this.otp,
    required this.newPassword,
    required this.confirmPassword,
  });

  factory ResetPasswordRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return ResetPasswordRequest(
      email: map['email']?.toString() ?? "",
      otp: map['otp']?.toString() ?? "",
      newPassword: map['newPassword']?.toString() ?? "",
      confirmPassword: map['confirmPassword']?.toString() ?? "",
    );
  }

  Map<String, Object?> toJson() {
    return {
      'email': email,
      'otp': otp,
      'newPassword': newPassword,
      'confirmPassword': confirmPassword,
    };
  }
}
