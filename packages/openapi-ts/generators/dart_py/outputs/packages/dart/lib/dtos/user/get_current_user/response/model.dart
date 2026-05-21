// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\user\get_current_user\response\model.dart

import 'package:riderescue_api/dtos/user/get_current_user/response/fields.dart';
import 'package:riderescue_api/models/user/public_user/model.dart';

class GetCurrentUserResponse {
  final bool success;
  final String message;
  final PublicUser user;
  const GetCurrentUserResponse(
      {required this.success, required this.message, required this.user});
  GetCurrentUserResponse copyWith(
      {bool? success, String? message, PublicUser? user}) {
    return GetCurrentUserResponse(
        success: success ?? this.success,
        message: message ?? this.message,
        user: user ?? this.user);
  }

  factory GetCurrentUserResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return GetCurrentUserResponse(
        success: map[GetCurrentUserResponseFields.success] == true,
        message: map[GetCurrentUserResponseFields.message]?.toString() ?? "",
        user: PublicUser.fromJson(Map<String, dynamic>.from(
            (map[GetCurrentUserResponseFields.user] as Map?) ?? {})));
  }

  Map<String, dynamic> toJson() {
    return {
      GetCurrentUserResponseFields.success: success,
      GetCurrentUserResponseFields.message: message,
      GetCurrentUserResponseFields.user: user.toJson()
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    parts.add('user: $user');
    return 'GetCurrentUserResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is GetCurrentUserResponse &&
        other.success == success &&
        other.message == message &&
        other.user == user;
  }

  @override
  int get hashCode {
    return Object.hashAll([success, message, user]);
  }
}
