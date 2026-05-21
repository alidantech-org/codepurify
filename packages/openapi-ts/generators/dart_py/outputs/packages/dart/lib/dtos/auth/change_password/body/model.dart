// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\auth\change_password\body\model.dart

import 'package:riderescue_api/dtos/auth/change_password/body/fields.dart';

class ChangePasswordBody {
  final String currentPassword;
  final String newPassword;
  final String confirmPassword;
  const ChangePasswordBody(
      {required this.currentPassword,
      required this.newPassword,
      required this.confirmPassword});
  ChangePasswordBody copyWith(
      {String? currentPassword, String? newPassword, String? confirmPassword}) {
    return ChangePasswordBody(
        currentPassword: currentPassword ?? this.currentPassword,
        newPassword: newPassword ?? this.newPassword,
        confirmPassword: confirmPassword ?? this.confirmPassword);
  }

  factory ChangePasswordBody.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return ChangePasswordBody(
        currentPassword:
            map[ChangePasswordBodyFields.currentPassword]?.toString() ?? "",
        newPassword:
            map[ChangePasswordBodyFields.newPassword]?.toString() ?? "",
        confirmPassword:
            map[ChangePasswordBodyFields.confirmPassword]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {
      ChangePasswordBodyFields.currentPassword: currentPassword,
      ChangePasswordBodyFields.newPassword: newPassword,
      ChangePasswordBodyFields.confirmPassword: confirmPassword
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('currentPassword: ***');
    parts.add('newPassword: ***');
    parts.add('confirmPassword: ***');
    return 'ChangePasswordBody(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ChangePasswordBody &&
        other.currentPassword == currentPassword &&
        other.newPassword == newPassword &&
        other.confirmPassword == confirmPassword;
  }

  @override
  int get hashCode {
    return Object.hashAll([currentPassword, newPassword, confirmPassword]);
  }
}
