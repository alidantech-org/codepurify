// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\auth\login\body\model.dart

import 'package:riderescue_api/dtos/auth/login/body/fields.dart';

class LoginBody {
  final String email;
  final String password;
  const LoginBody({required this.email, required this.password});
  LoginBody copyWith({String? email, String? password}) {
    return LoginBody(
        email: email ?? this.email, password: password ?? this.password);
  }

  factory LoginBody.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return LoginBody(
        email: map[LoginBodyFields.email]?.toString() ?? "",
        password: map[LoginBodyFields.password]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {LoginBodyFields.email: email, LoginBodyFields.password: password};
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('email: $email');
    parts.add('password: ***');
    return 'LoginBody(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is LoginBody &&
        other.email == email &&
        other.password == password;
  }

  @override
  int get hashCode {
    return Object.hashAll([email, password]);
  }
}
