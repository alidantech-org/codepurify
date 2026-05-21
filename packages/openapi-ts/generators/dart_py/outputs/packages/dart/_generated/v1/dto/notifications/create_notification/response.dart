class CreateNotificationResponse {
  final bool success;
  final String message;
  final Map<String, Object?> notification;

  const CreateNotificationResponse({
    required this.success,
    required this.message,
    required this.notification,
  });

  factory CreateNotificationResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return CreateNotificationResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
      notification:
          Map<String, Object?>.from((map['notification'] as Map?) ?? {}),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'success': success,
      'message': message,
      'notification': notification,
    };
  }
}
