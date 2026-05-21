// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\auth\admin_login\response\model.dart

import 'package:riderescue_api/dtos/auth/admin_login/response/fields.dart';
import 'package:riderescue_api/models/user/public_user/model.dart';

class AdminLoginResponse {
  final bool success;
  final String message;
  final PublicUser user;
  final String token;
  const AdminLoginResponse(
      {required this.success,
      required this.message,
      required this.user,
      required this.token});
  AdminLoginResponse copyWith(
      {bool? success, String? message, PublicUser? user, String? token}) {
    return AdminLoginResponse(
        success: success ?? this.success,
        message: message ?? this.message,
        user: user ?? this.user,
        token: token ?? this.token);
  }

  factory AdminLoginResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return AdminLoginResponse(
        success: map[AdminLoginResponseFields.success] == true,
        message: map[AdminLoginResponseFields.message]?.toString() ?? "",
        user: PublicUser.fromJson(Map<String, dynamic>.from(
            (map[AdminLoginResponseFields.user] as Map?) ?? {})),
        token: map[AdminLoginResponseFields.token]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {
      AdminLoginResponseFields.success: success,
      AdminLoginResponseFields.message: message,
      AdminLoginResponseFields.user: user.toJson(),
      AdminLoginResponseFields.token: token
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    parts.add('user: $user');
    parts.add('token: ***');
    return 'AdminLoginResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AdminLoginResponse &&
        other.success == success &&
        other.message == message &&
        other.user == user &&
        other.token == token;
  }

  @override
  int get hashCode {
    return Object.hashAll([success, message, user, token]);
  }
}
