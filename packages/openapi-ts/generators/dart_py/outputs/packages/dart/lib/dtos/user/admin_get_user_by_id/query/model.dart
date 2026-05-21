// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\user\admin_get_user_by_id\query\model.dart

import 'package:riderescue_api/dtos/user/admin_get_user_by_id/query/fields.dart';

class AdminGetUserByIdQuery {
  final String? fields;
  final String? populate;
  const AdminGetUserByIdQuery({this.fields, this.populate});
  AdminGetUserByIdQuery copyWith({String? fields, String? populate}) {
    return AdminGetUserByIdQuery(
        fields: fields ?? this.fields, populate: populate ?? this.populate);
  }

  factory AdminGetUserByIdQuery.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return AdminGetUserByIdQuery(
        fields: map[AdminGetUserByIdQueryFields.fields]?.toString(),
        populate: map[AdminGetUserByIdQueryFields.populate]?.toString());
  }

  Map<String, dynamic> toJson() {
    return {
      if (fields != null) AdminGetUserByIdQueryFields.fields: fields,
      if (populate != null) AdminGetUserByIdQueryFields.populate: populate
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('fields: $fields');
    parts.add('populate: $populate');
    return 'AdminGetUserByIdQuery(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AdminGetUserByIdQuery &&
        other.fields == fields &&
        other.populate == populate;
  }

  @override
  int get hashCode {
    return Object.hashAll([fields, populate]);
  }
}
