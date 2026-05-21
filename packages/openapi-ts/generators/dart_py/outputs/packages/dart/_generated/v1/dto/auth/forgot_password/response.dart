class ForgotPasswordResponse {
  final bool success;
  final String message;

  const ForgotPasswordResponse({
    required this.success,
    required this.message,
  });

  factory ForgotPasswordResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return ForgotPasswordResponse(
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
