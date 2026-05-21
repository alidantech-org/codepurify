class GoogleSignInResponse {
  final bool success;
  final String message;
  final Map<String, Object?> user;
  final String token;

  const GoogleSignInResponse({
    required this.success,
    required this.message,
    required this.user,
    required this.token,
  });

  factory GoogleSignInResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return GoogleSignInResponse(
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
