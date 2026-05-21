class LoginRequest {
  final String email;
  final String password;

  const LoginRequest({
    required this.email,
    required this.password,
  });

  factory LoginRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return LoginRequest(
      email: map['email']?.toString() ?? "",
      password: map['password']?.toString() ?? "",
    );
  }

  Map<String, Object?> toJson() {
    return {
      'email': email,
      'password': password,
    };
  }
}
