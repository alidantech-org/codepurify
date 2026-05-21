// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\user\admin_update_user\response\model.dart

import 'package:riderescue_api/dtos/user/admin_update_user/response/fields.dart';
import 'package:riderescue_api/models/user/user/model.dart';

class AdminUpdateUserResponse {
  final bool success;
  final String message;
  final User user;
  const AdminUpdateUserResponse(
      {required this.success, required this.message, required this.user});
  AdminUpdateUserResponse copyWith(
      {bool? success, String? message, User? user}) {
    return AdminUpdateUserResponse(
        success: success ?? this.success,
        message: message ?? this.message,
        user: user ?? this.user);
  }

  factory AdminUpdateUserResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return AdminUpdateUserResponse(
        success: map[AdminUpdateUserResponseFields.success] == true,
        message: map[AdminUpdateUserResponseFields.message]?.toString() ?? "",
        user: User.fromJson(Map<String, dynamic>.from(
            (map[AdminUpdateUserResponseFields.user] as Map?) ?? {})));
  }

  Map<String, dynamic> toJson() {
    return {
      AdminUpdateUserResponseFields.success: success,
      AdminUpdateUserResponseFields.message: message,
      AdminUpdateUserResponseFields.user: user.toJson()
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    parts.add('user: $user');
    return 'AdminUpdateUserResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AdminUpdateUserResponse &&
        other.success == success &&
        other.message == message &&
        other.user == user;
  }

  @override
  int get hashCode {
    return Object.hashAll([success, message, user]);
  }
}
