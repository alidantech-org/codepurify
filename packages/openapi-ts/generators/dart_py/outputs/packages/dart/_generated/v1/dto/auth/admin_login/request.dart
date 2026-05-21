class AdminLoginRequest {
  final String email;
  final String password;

  const AdminLoginRequest({
    required this.email,
    required this.password,
  });

  factory AdminLoginRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return AdminLoginRequest(
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
