// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\user\delete_user\params\model.dart

import 'package:riderescue_api/dtos/user/delete_user/params/fields.dart';

class DeleteUserParams {
  final String userId;
  const DeleteUserParams({required this.userId});
  DeleteUserParams copyWith({String? userId}) {
    return DeleteUserParams(userId: userId ?? this.userId);
  }

  factory DeleteUserParams.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return DeleteUserParams(
        userId: map[DeleteUserParamsFields.userId]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {DeleteUserParamsFields.userId: userId};
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('userId: $userId');
    return 'DeleteUserParams(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is DeleteUserParams && other.userId == userId;
  }

  @override
  int get hashCode {
    return Object.hashAll([userId]);
  }
}
