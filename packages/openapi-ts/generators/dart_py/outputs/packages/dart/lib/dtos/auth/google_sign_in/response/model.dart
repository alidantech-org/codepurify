// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\auth\google_sign_in\response\model.dart

import 'package:riderescue_api/dtos/auth/google_sign_in/response/fields.dart';
import 'package:riderescue_api/models/user/public_user/model.dart';

class GoogleSignInResponse {
  final bool success;
  final String message;
  final PublicUser user;
  final String token;
  const GoogleSignInResponse(
      {required this.success,
      required this.message,
      required this.user,
      required this.token});
  GoogleSignInResponse copyWith(
      {bool? success, String? message, PublicUser? user, String? token}) {
    return GoogleSignInResponse(
        success: success ?? this.success,
        message: message ?? this.message,
        user: user ?? this.user,
        token: token ?? this.token);
  }

  factory GoogleSignInResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return GoogleSignInResponse(
        success: map[GoogleSignInResponseFields.success] == true,
        message: map[GoogleSignInResponseFields.message]?.toString() ?? "",
        user: PublicUser.fromJson(Map<String, dynamic>.from(
            (map[GoogleSignInResponseFields.user] as Map?) ?? {})),
        token: map[GoogleSignInResponseFields.token]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {
      GoogleSignInResponseFields.success: success,
      GoogleSignInResponseFields.message: message,
      GoogleSignInResponseFields.user: user.toJson(),
      GoogleSignInResponseFields.token: token
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    parts.add('user: $user');
    parts.add('token: ***');
    return 'GoogleSignInResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is GoogleSignInResponse &&
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
