// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\user\admin_get_user_by_id\response\model.dart

import 'package:riderescue_api/dtos/user/admin_get_user_by_id/response/fields.dart';
import 'package:riderescue_api/models/user/user/model.dart';

class AdminGetUserByIdResponse {
  final bool success;
  final String message;
  final User user;
  const AdminGetUserByIdResponse(
      {required this.success, required this.message, required this.user});
  AdminGetUserByIdResponse copyWith(
      {bool? success, String? message, User? user}) {
    return AdminGetUserByIdResponse(
        success: success ?? this.success,
        message: message ?? this.message,
        user: user ?? this.user);
  }

  factory AdminGetUserByIdResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return AdminGetUserByIdResponse(
        success: map[AdminGetUserByIdResponseFields.success] == true,
        message: map[AdminGetUserByIdResponseFields.message]?.toString() ?? "",
        user: User.fromJson(Map<String, dynamic>.from(
            (map[AdminGetUserByIdResponseFields.user] as Map?) ?? {})));
  }

  Map<String, dynamic> toJson() {
    return {
      AdminGetUserByIdResponseFields.success: success,
      AdminGetUserByIdResponseFields.message: message,
      AdminGetUserByIdResponseFields.user: user.toJson()
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    parts.add('user: $user');
    return 'AdminGetUserByIdResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AdminGetUserByIdResponse &&
        other.success == success &&
        other.message == message &&
        other.user == user;
  }

  @override
  int get hashCode {
    return Object.hashAll([success, message, user]);
  }
}
