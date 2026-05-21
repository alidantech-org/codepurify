// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\user\get_user_by_id\query\model.dart

import 'package:riderescue_api/dtos/user/get_user_by_id/query/fields.dart';

class GetUserByIdQuery {
  final String? fields;
  final String? populate;
  const GetUserByIdQuery({this.fields, this.populate});
  GetUserByIdQuery copyWith({String? fields, String? populate}) {
    return GetUserByIdQuery(
        fields: fields ?? this.fields, populate: populate ?? this.populate);
  }

  factory GetUserByIdQuery.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return GetUserByIdQuery(
        fields: map[GetUserByIdQueryFields.fields]?.toString(),
        populate: map[GetUserByIdQueryFields.populate]?.toString());
  }

  Map<String, dynamic> toJson() {
    return {
      if (fields != null) GetUserByIdQueryFields.fields: fields,
      if (populate != null) GetUserByIdQueryFields.populate: populate
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('fields: $fields');
    parts.add('populate: $populate');
    return 'GetUserByIdQuery(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is GetUserByIdQuery &&
        other.fields == fields &&
        other.populate == populate;
  }

  @override
  int get hashCode {
    return Object.hashAll([fields, populate]);
  }
}
