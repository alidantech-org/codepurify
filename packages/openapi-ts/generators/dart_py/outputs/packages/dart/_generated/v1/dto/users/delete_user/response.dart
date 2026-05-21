class DeleteUserResponse {
  final bool success;
  final String message;
  final Map<String, Object?>? user;

  const DeleteUserResponse({
    required this.success,
    required this.message,
    this.user,
  });

  factory DeleteUserResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return DeleteUserResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
      user: map['user'] == null
          ? null
          : Map<String, Object?>.from(map['user'] as Map),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'success': success,
      'message': message,
      if (user != null) 'user': user,
    };
  }
}
