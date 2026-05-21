class AdminLoginResponse {
  final bool success;
  final String message;
  final Map<String, Object?> user;
  final String token;

  const AdminLoginResponse({
    required this.success,
    required this.message,
    required this.user,
    required this.token,
  });

  factory AdminLoginResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return AdminLoginResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
      user: Map<String, Object?>.from((map['user'] as Map?) ?? {}),
      token: map['token']?.toString() ?? "",
    );
  }

  Map<String, Object?> toJson() {
    return {
      'success': success,
      'message': message,
      'user': user,
      'token': token,
    };
  }
}
