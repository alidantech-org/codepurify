// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\user\list_users\query\model.dart

import 'package:riderescue_api/dtos/user/list_users/query/fields.dart';
import 'package:riderescue_api/enums/user_role/enum.dart';
import 'package:riderescue_api/enums/user_status/enum.dart';

class ListUsersQuery {
  final int? page;
  final int? limit;
  final String? sort;
  final String? fields;
  final String? populate;
  final String? search;
  final UserStatus? status;
  final UserRole? role;
  final bool? emailVerified;
  final bool? isOnline;
  const ListUsersQuery(
      {this.page,
      this.limit,
      this.sort,
      this.fields,
      this.populate,
      this.search,
      this.status,
      this.role,
      this.emailVerified,
      this.isOnline});
  ListUsersQuery copyWith(
      {int? page,
      int? limit,
      String? sort,
      String? fields,
      String? populate,
      String? search,
      UserStatus? status,
      UserRole? role,
      bool? emailVerified,
      bool? isOnline}) {
    return ListUsersQuery(
        page: page ?? this.page,
        limit: limit ?? this.limit,
        sort: sort ?? this.sort,
        fields: fields ?? this.fields,
        populate: populate ?? this.populate,
        search: search ?? this.search,
        status: status ?? this.status,
        role: role ?? this.role,
        emailVerified: emailVerified ?? this.emailVerified,
        isOnline: isOnline ?? this.isOnline);
  }

  factory ListUsersQuery.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return ListUsersQuery(
        page: map[ListUsersQueryFields.page] == null
            ? null
            : (map[ListUsersQueryFields.page] is int
                ? map[ListUsersQueryFields.page]
                : int.tryParse(map[ListUsersQueryFields.page].toString())),
        limit: map[ListUsersQueryFields.limit] == null
            ? null
            : (map[ListUsersQueryFields.limit] is int
                ? map[ListUsersQueryFields.limit]
                : int.tryParse(map[ListUsersQueryFields.limit].toString())),
        sort: map[ListUsersQueryFields.sort]?.toString(),
        fields: map[ListUsersQueryFields.fields]?.toString(),
        populate: map[ListUsersQueryFields.populate]?.toString(),
        search: map[ListUsersQueryFields.search]?.toString(),
        status: map[ListUsersQueryFields.status] == null
            ? null
            : UserStatus.fromValue(map[ListUsersQueryFields.status].toString()),
        role: map[ListUsersQueryFields.role] == null
            ? null
            : UserRole.fromValue(map[ListUsersQueryFields.role].toString()),
        emailVerified: map[ListUsersQueryFields.emailVerified] == null
            ? null
            : map[ListUsersQueryFields.emailVerified] == true,
        isOnline: map[ListUsersQueryFields.isOnline] == null
            ? null
            : map[ListUsersQueryFields.isOnline] == true);
  }

  Map<String, dynamic> toJson() {
    return {
      if (page != null) ListUsersQueryFields.page: page,
      if (limit != null) ListUsersQueryFields.limit: limit,
      if (sort != null) ListUsersQueryFields.sort: sort,
      if (fields != null) ListUsersQueryFields.fields: fields,
      if (populate != null) ListUsersQueryFields.populate: populate,
      if (search != null) ListUsersQueryFields.search: search,
      if (status != null) ListUsersQueryFields.status: status?.value,
      if (role != null) ListUsersQueryFields.role: role?.value,
      if (emailVerified != null)
        ListUsersQueryFields.emailVerified: emailVerified,
      if (isOnline != null) ListUsersQueryFields.isOnline: isOnline
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('page: $page');
    parts.add('limit: $limit');
    parts.add('sort: $sort');
    parts.add('fields: $fields');
    parts.add('populate: $populate');
    parts.add('search: $search');
    parts.add('status: $status');
    parts.add('role: $role');
    parts.add('emailVerified: $emailVerified');
    parts.add('isOnline: $isOnline');
    return 'ListUsersQuery(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ListUsersQuery &&
        other.page == page &&
        other.limit == limit &&
        other.sort == sort &&
        other.fields == fields &&
        other.populate == populate &&
        other.search == search &&
        other.status == status &&
        other.role == role &&
        other.emailVerified == emailVerified &&
        other.isOnline == isOnline;
  }

  @override
  int get hashCode {
    return Object.hashAll([
      page,
      limit,
      sort,
      fields,
      populate,
      search,
      status,
      role,
      emailVerified,
      isOnline
    ]);
  }
}
