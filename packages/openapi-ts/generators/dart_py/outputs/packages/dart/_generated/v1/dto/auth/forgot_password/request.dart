class ForgotPasswordRequest {
  final String email;

  const ForgotPasswordRequest({
    required this.email,
  });

  factory ForgotPasswordRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return ForgotPasswordRequest(
      email: map['email']?.toString() ?? "",
    );
  }

  Map<String, Object?> toJson() {
    return {
      'email': email,
    };
  }
}
