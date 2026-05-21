// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\user\get_user_by_id\params\model.dart

import 'package:riderescue_api/dtos/user/get_user_by_id/params/fields.dart';

class GetUserByIdParams {
  final String userId;
  const GetUserByIdParams({required this.userId});
  GetUserByIdParams copyWith({String? userId}) {
    return GetUserByIdParams(userId: userId ?? this.userId);
  }

  factory GetUserByIdParams.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return GetUserByIdParams(
        userId: map[GetUserByIdParamsFields.userId]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {GetUserByIdParamsFields.userId: userId};
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('userId: $userId');
    return 'GetUserByIdParams(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is GetUserByIdParams && other.userId == userId;
  }

  @override
  int get hashCode {
    return Object.hashAll([userId]);
  }
}
