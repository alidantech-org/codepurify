class ChangePasswordResponse {
  final bool success;
  final String message;

  const ChangePasswordResponse({
    required this.success,
    required this.message,
  });

  factory ChangePasswordResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return ChangePasswordResponse(
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
