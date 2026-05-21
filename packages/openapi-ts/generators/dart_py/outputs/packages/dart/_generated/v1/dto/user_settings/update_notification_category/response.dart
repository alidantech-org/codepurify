class UpdateNotificationCategoryResponse {
  final bool success;
  final String message;
  final Map<String, Object?> settings;

  const UpdateNotificationCategoryResponse({
    required this.success,
    required this.message,
    required this.settings,
  });

  factory UpdateNotificationCategoryResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return UpdateNotificationCategoryResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
      settings: Map<String, Object?>.from((map['settings'] as Map?) ?? {}),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'success': success,
      'message': message,
      'settings': settings,
    };
  }
}
