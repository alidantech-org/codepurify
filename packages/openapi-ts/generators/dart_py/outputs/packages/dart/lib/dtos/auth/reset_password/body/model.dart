// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\auth\reset_password\body\model.dart

import 'package:riderescue_api/dtos/auth/reset_password/body/fields.dart';

class ResetPasswordBody {
  final String email;
  final String otp;
  final String newPassword;
  final String confirmPassword;
  const ResetPasswordBody(
      {required this.email,
      required this.otp,
      required this.newPassword,
      required this.confirmPassword});
  ResetPasswordBody copyWith(
      {String? email,
      String? otp,
      String? newPassword,
      String? confirmPassword}) {
    return ResetPasswordBody(
        email: email ?? this.email,
        otp: otp ?? this.otp,
        newPassword: newPassword ?? this.newPassword,
        confirmPassword: confirmPassword ?? this.confirmPassword);
  }

  factory ResetPasswordBody.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return ResetPasswordBody(
        email: map[ResetPasswordBodyFields.email]?.toString() ?? "",
        otp: map[ResetPasswordBodyFields.otp]?.toString() ?? "",
        newPassword: map[ResetPasswordBodyFields.newPassword]?.toString() ?? "",
        confirmPassword:
            map[ResetPasswordBodyFields.confirmPassword]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {
      ResetPasswordBodyFields.email: email,
      ResetPasswordBodyFields.otp: otp,
      ResetPasswordBodyFields.newPassword: newPassword,
      ResetPasswordBodyFields.confirmPassword: confirmPassword
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('email: $email');
    parts.add('otp: ***');
    parts.add('newPassword: ***');
    parts.add('confirmPassword: ***');
    return 'ResetPasswordBody(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ResetPasswordBody &&
        other.email == email &&
        other.otp == otp &&
        other.newPassword == newPassword &&
        other.confirmPassword == confirmPassword;
  }

  @override
  int get hashCode {
    return Object.hashAll([email, otp, newPassword, confirmPassword]);
  }
}
