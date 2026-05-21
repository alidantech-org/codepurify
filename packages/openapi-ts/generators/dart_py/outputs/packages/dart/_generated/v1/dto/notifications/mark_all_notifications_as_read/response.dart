class MarkAllNotificationsAsReadResponse {
  final bool success;
  final String message;

  const MarkAllNotificationsAsReadResponse({
    required this.success,
    required this.message,
  });

  factory MarkAllNotificationsAsReadResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return MarkAllNotificationsAsReadResponse(
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
