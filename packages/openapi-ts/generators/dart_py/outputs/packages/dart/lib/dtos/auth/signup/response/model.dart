// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\auth\signup\response\model.dart

import 'package:riderescue_api/dtos/auth/signup/response/fields.dart';
import 'package:riderescue_api/models/user/public_user/model.dart';

class SignupResponse {
  final bool success;
  final String message;
  final PublicUser user;
  final String token;
  const SignupResponse(
      {required this.success,
      required this.message,
      required this.user,
      required this.token});
  SignupResponse copyWith(
      {bool? success, String? message, PublicUser? user, String? token}) {
    return SignupResponse(
        success: success ?? this.success,
        message: message ?? this.message,
        user: user ?? this.user,
        token: token ?? this.token);
  }

  factory SignupResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return SignupResponse(
        success: map[SignupResponseFields.success] == true,
        message: map[SignupResponseFields.message]?.toString() ?? "",
        user: PublicUser.fromJson(Map<String, dynamic>.from(
            (map[SignupResponseFields.user] as Map?) ?? {})),
        token: map[SignupResponseFields.token]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {
      SignupResponseFields.success: success,
      SignupResponseFields.message: message,
      SignupResponseFields.user: user.toJson(),
      SignupResponseFields.token: token
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    parts.add('user: $user');
    parts.add('token: ***');
    return 'SignupResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is SignupResponse &&
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
