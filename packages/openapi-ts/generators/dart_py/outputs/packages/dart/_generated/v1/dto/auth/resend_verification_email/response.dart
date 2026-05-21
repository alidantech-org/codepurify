class ResendVerificationEmailResponse {
  final bool success;
  final String message;

  const ResendVerificationEmailResponse({
    required this.success,
    required this.message,
  });

  factory ResendVerificationEmailResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return ResendVerificationEmailResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
    );
  }

  Map<String, Object?> toJson() {
    return {
      'success': success,
      'message': message,
    };
  }
}
