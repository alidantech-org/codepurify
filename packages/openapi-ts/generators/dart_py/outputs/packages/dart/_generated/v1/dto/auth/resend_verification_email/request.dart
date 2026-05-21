class ResendVerificationEmailRequest {
  final String email;

  const ResendVerificationEmailRequest({
    required this.email,
  });

  factory ResendVerificationEmailRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return ResendVerificationEmailRequest(
      email: map['email']?.toString() ?? "",
    );
  }

  Map<String, Object?> toJson() {
    return {
      'email': email,
    };
  }
}
