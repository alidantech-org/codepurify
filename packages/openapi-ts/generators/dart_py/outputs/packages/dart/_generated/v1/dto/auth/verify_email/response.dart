class VerifyEmailResponse {
  final bool success;
  final String message;

  const VerifyEmailResponse({
    required this.success,
    required this.message,
  });

  factory VerifyEmailResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return VerifyEmailResponse(
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
