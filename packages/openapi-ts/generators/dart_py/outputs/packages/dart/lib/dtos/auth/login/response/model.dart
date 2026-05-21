// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\auth\login\response\model.dart

import 'package:riderescue_api/dtos/auth/login/response/fields.dart';
import 'package:riderescue_api/models/user/public_user/model.dart';

class LoginResponse {
  final bool success;
  final String message;
  final PublicUser user;
  final String token;
  const LoginResponse(
      {required this.success,
      required this.message,
      required this.user,
      required this.token});
  LoginResponse copyWith(
      {bool? success, String? message, PublicUser? user, String? token}) {
    return LoginResponse(
        success: success ?? this.success,
        message: message ?? this.message,
        user: user ?? this.user,
        token: token ?? this.token);
  }

  factory LoginResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return LoginResponse(
        success: map[LoginResponseFields.success] == true,
        message: map[LoginResponseFields.message]?.toString() ?? "",
        user: PublicUser.fromJson(Map<String, dynamic>.from(
            (map[LoginResponseFields.user] as Map?) ?? {})),
        token: map[LoginResponseFields.token]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {
      LoginResponseFields.success: success,
      LoginResponseFields.message: message,
      LoginResponseFields.user: user.toJson(),
      LoginResponseFields.token: token
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    parts.add('user: $user');
    parts.add('token: ***');
    return 'LoginResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is LoginResponse &&
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
