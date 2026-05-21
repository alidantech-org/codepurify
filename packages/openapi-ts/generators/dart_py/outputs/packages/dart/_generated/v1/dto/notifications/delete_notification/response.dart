class DeleteNotificationResponse {
  final bool success;
  final String message;

  const DeleteNotificationResponse({
    required this.success,
    required this.message,
  });

  factory DeleteNotificationResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return DeleteNotificationResponse(
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
