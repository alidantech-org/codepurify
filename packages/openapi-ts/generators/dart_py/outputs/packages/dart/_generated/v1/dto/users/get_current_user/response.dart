class GetCurrentUserResponse {
  final bool success;
  final String message;
  final Map<String, Object?> user;

  const GetCurrentUserResponse({
    required this.success,
    required this.message,
    required this.user,
  });

  factory GetCurrentUserResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return GetCurrentUserResponse(
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
