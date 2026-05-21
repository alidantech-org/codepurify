// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\auth\admin_login\body\model.dart

import 'package:riderescue_api/dtos/auth/admin_login/body/fields.dart';

class AdminLoginBody {
  final String email;
  final String password;
  const AdminLoginBody({required this.email, required this.password});
  AdminLoginBody copyWith({String? email, String? password}) {
    return AdminLoginBody(
        email: email ?? this.email, password: password ?? this.password);
  }

  factory AdminLoginBody.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return AdminLoginBody(
        email: map[AdminLoginBodyFields.email]?.toString() ?? "",
        password: map[AdminLoginBodyFields.password]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {
      AdminLoginBodyFields.email: email,
      AdminLoginBodyFields.password: password
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('email: $email');
    parts.add('password: ***');
    return 'AdminLoginBody(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AdminLoginBody &&
        other.email == email &&
        other.password == password;
  }

  @override
  int get hashCode {
    return Object.hashAll([email, password]);
  }
}
