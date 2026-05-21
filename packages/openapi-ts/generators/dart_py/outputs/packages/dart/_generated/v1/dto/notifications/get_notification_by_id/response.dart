class GetNotificationByIdResponse {
  final bool success;
  final String message;
  final Map<String, Object?> notification;

  const GetNotificationByIdResponse({
    required this.success,
    required this.message,
    required this.notification,
  });

  factory GetNotificationByIdResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return GetNotificationByIdResponse(
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
