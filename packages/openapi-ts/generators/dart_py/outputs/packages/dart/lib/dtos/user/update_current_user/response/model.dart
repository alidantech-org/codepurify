// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\user\update_current_user\response\model.dart

import 'package:riderescue_api/dtos/user/update_current_user/response/fields.dart';
import 'package:riderescue_api/models/user/public_user/model.dart';

class UpdateCurrentUserResponse {
  final bool success;
  final String message;
  final PublicUser user;
  const UpdateCurrentUserResponse(
      {required this.success, required this.message, required this.user});
  UpdateCurrentUserResponse copyWith(
      {bool? success, String? message, PublicUser? user}) {
    return UpdateCurrentUserResponse(
        success: success ?? this.success,
        message: message ?? this.message,
        user: user ?? this.user);
  }

  factory UpdateCurrentUserResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return UpdateCurrentUserResponse(
        success: map[UpdateCurrentUserResponseFields.success] == true,
        message: map[UpdateCurrentUserResponseFields.message]?.toString() ?? "",
        user: PublicUser.fromJson(Map<String, dynamic>.from(
            (map[UpdateCurrentUserResponseFields.user] as Map?) ?? {})));
  }

  Map<String, dynamic> toJson() {
    return {
      UpdateCurrentUserResponseFields.success: success,
      UpdateCurrentUserResponseFields.message: message,
      UpdateCurrentUserResponseFields.user: user.toJson()
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    parts.add('user: $user');
    return 'UpdateCurrentUserResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is UpdateCurrentUserResponse &&
        other.success == success &&
        other.message == message &&
        other.user == user;
  }

  @override
  int get hashCode {
    return Object.hashAll([success, message, user]);
  }
}
