class UpdateUserResponse {
  final bool success;
  final String message;
  final Map<String, Object?> user;

  const UpdateUserResponse({
    required this.success,
    required this.message,
    required this.user,
  });

  factory UpdateUserResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return UpdateUserResponse(
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
