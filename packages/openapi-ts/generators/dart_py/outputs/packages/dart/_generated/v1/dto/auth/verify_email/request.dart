class VerifyEmailRequest {
  final String email;
  final String otp;

  const VerifyEmailRequest({
    required this.email,
    required this.otp,
  });

  factory VerifyEmailRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return VerifyEmailRequest(
      email: map['email']?.toString() ?? "",
      otp: map['otp']?.toString() ?? "",
    );
  }

  Map<String, Object?> toJson() {
    return {
      'email': email,
      'otp': otp,
    };
  }
}
