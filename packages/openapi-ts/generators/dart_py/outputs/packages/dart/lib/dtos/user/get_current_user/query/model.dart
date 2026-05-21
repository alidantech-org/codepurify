// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\user\get_current_user\query\model.dart

import 'package:riderescue_api/dtos/user/get_current_user/query/fields.dart';

class GetCurrentUserQuery {
  final String? fields;
  final String? populate;
  const GetCurrentUserQuery({this.fields, this.populate});
  GetCurrentUserQuery copyWith({String? fields, String? populate}) {
    return GetCurrentUserQuery(
        fields: fields ?? this.fields, populate: populate ?? this.populate);
  }

  factory GetCurrentUserQuery.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return GetCurrentUserQuery(
        fields: map[GetCurrentUserQueryFields.fields]?.toString(),
        populate: map[GetCurrentUserQueryFields.populate]?.toString());
  }

  Map<String, dynamic> toJson() {
    return {
      if (fields != null) GetCurrentUserQueryFields.fields: fields,
      if (populate != null) GetCurrentUserQueryFields.populate: populate
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('fields: $fields');
    parts.add('populate: $populate');
    return 'GetCurrentUserQuery(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is GetCurrentUserQuery &&
        other.fields == fields &&
        other.populate == populate;
  }

  @override
  int get hashCode {
    return Object.hashAll([fields, populate]);
  }
}
