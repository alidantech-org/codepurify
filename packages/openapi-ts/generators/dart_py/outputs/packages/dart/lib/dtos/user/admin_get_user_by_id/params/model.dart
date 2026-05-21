// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\user\admin_get_user_by_id\params\model.dart

import 'package:riderescue_api/dtos/user/admin_get_user_by_id/params/fields.dart';

class AdminGetUserByIdParams {
  final String userId;
  const AdminGetUserByIdParams({required this.userId});
  AdminGetUserByIdParams copyWith({String? userId}) {
    return AdminGetUserByIdParams(userId: userId ?? this.userId);
  }

  factory AdminGetUserByIdParams.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return AdminGetUserByIdParams(
        userId: map[AdminGetUserByIdParamsFields.userId]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {AdminGetUserByIdParamsFields.userId: userId};
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('userId: $userId');
    return 'AdminGetUserByIdParams(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AdminGetUserByIdParams && other.userId == userId;
  }

  @override
  int get hashCode {
    return Object.hashAll([userId]);
  }
}
