// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\user\admin_update_user\params\model.dart

import 'package:riderescue_api/dtos/user/admin_update_user/params/fields.dart';

class AdminUpdateUserParams {
  final String userId;
  const AdminUpdateUserParams({required this.userId});
  AdminUpdateUserParams copyWith({String? userId}) {
    return AdminUpdateUserParams(userId: userId ?? this.userId);
  }

  factory AdminUpdateUserParams.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return AdminUpdateUserParams(
        userId: map[AdminUpdateUserParamsFields.userId]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {AdminUpdateUserParamsFields.userId: userId};
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('userId: $userId');
    return 'AdminUpdateUserParams(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AdminUpdateUserParams && other.userId == userId;
  }

  @override
  int get hashCode {
    return Object.hashAll([userId]);
  }
}
