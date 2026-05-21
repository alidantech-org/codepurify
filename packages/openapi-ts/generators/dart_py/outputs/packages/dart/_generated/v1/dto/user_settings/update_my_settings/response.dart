class UpdateMySettingsResponse {
  final bool success;
  final String message;
  final Map<String, Object?> settings;

  const UpdateMySettingsResponse({
    required this.success,
    required this.message,
    required this.settings,
  });

  factory UpdateMySettingsResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return UpdateMySettingsResponse(
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
