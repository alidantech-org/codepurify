class UpdateCurrentUserResponse {
  final bool success;
  final String message;
  final Map<String, Object?> user;

  const UpdateCurrentUserResponse({
    required this.success,
    required this.message,
    required this.user,
  });

  factory UpdateCurrentUserResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return UpdateCurrentUserResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
      user: Map<String, Object?>.from((map['user'] as Map?) ?? {}),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'success': success,
      'message': message,
      'user': user,
    };
  }
}
