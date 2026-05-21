class SignupRequest {
  final String email;
  final String password;
  final String name;
  final String? phone;
  final String? avatar;
  final String? address;
  final String confirmPassword;

  const SignupRequest({
    required this.email,
    required this.password,
    required this.name,
    this.phone,
    this.avatar,
    this.address,
    required this.confirmPassword,
  });

  factory SignupRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return SignupRequest(
      email: map['email']?.toString() ?? "",
      password: map['password']?.toString() ?? "",
      name: map['name']?.toString() ?? "",
      phone: map['phone']?.toString(),
      avatar: map['avatar']?.toString(),
      address: map['address']?.toString(),
      confirmPassword: map['confirmPassword']?.toString() ?? "",
    );
  }

  Map<String, Object?> toJson() {
    return {
      'email': email,
      'password': password,
      'name': name,
      if (phone != null) 'phone': phone,
      if (avatar != null) 'avatar': avatar,
      if (address != null) 'address': address,
      'confirmPassword': confirmPassword,
    };
  }
}
