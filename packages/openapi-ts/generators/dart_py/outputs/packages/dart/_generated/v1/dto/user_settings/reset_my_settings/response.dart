class ResetMySettingsResponse {
  final bool success;
  final String message;

  const ResetMySettingsResponse({
    required this.success,
    required this.message,
  });

  factory ResetMySettingsResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return ResetMySettingsResponse(
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
