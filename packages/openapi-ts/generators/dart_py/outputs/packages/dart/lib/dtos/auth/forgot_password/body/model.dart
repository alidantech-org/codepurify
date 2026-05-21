// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\auth\forgot_password\body\model.dart

import 'package:riderescue_api/dtos/auth/forgot_password/body/fields.dart';

class ForgotPasswordBody {
  final String email;
  const ForgotPasswordBody({required this.email});
  ForgotPasswordBody copyWith({String? email}) {
    return ForgotPasswordBody(email: email ?? this.email);
  }

  factory ForgotPasswordBody.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return ForgotPasswordBody(
        email: map[ForgotPasswordBodyFields.email]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {ForgotPasswordBodyFields.email: email};
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('email: $email');
    return 'ForgotPasswordBody(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ForgotPasswordBody && other.email == email;
  }

  @override
  int get hashCode {
    return Object.hashAll([email]);
  }
}
