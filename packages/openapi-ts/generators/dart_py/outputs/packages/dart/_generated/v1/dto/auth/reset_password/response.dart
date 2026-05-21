class ResetPasswordResponse {
  final bool success;
  final String message;

  const ResetPasswordResponse({
    required this.success,
    required this.message,
  });

  factory ResetPasswordResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return ResetPasswordResponse(
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
