// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\user\list_users\response\model.dart

import 'package:collection/collection.dart';
import 'package:riderescue_api/dtos/shared/filters/model.dart';
import 'package:riderescue_api/dtos/shared/pagination_meta/model.dart';
import 'package:riderescue_api/dtos/shared/sort/model.dart';
import 'package:riderescue_api/dtos/user/list_users/response/fields.dart';
import 'package:riderescue_api/models/user/partial_public_user/model.dart';

class ListUsersResponse {
  final bool success;
  final String message;
  final List<PartialPublicUser> users;
  final PaginationMeta pagination;
  final Filters? filters;
  final Sort? sort;
  const ListUsersResponse(
      {required this.success,
      required this.message,
      required this.users,
      required this.pagination,
      this.filters,
      this.sort});
  ListUsersResponse copyWith(
      {bool? success,
      String? message,
      List<PartialPublicUser>? users,
      PaginationMeta? pagination,
      Filters? filters,
      Sort? sort}) {
    return ListUsersResponse(
        success: success ?? this.success,
        message: message ?? this.message,
        users: users ?? this.users,
        pagination: pagination ?? this.pagination,
        filters: filters ?? this.filters,
        sort: sort ?? this.sort);
  }

  factory ListUsersResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return ListUsersResponse(
        success: map[ListUsersResponseFields.success] == true,
        message: map[ListUsersResponseFields.message]?.toString() ?? "",
        users: ((map[ListUsersResponseFields.users] as List?) ?? [])
            .map((item) => PartialPublicUser.fromJson(
                Map<String, dynamic>.from((item as Map?) ?? {})))
            .toList(),
        pagination: PaginationMeta.fromJson(Map<String, dynamic>.from(
            (map[ListUsersResponseFields.pagination] as Map?) ?? {})),
        filters: map[ListUsersResponseFields.filters] == null
            ? null
            : Filters.fromJson(Map<String, dynamic>.from(
                (map[ListUsersResponseFields.filters] as Map?) ?? {})),
        sort: map[ListUsersResponseFields.sort] == null
            ? null
            : Sort.fromJson(
                Map<String, dynamic>.from((map[ListUsersResponseFields.sort] as Map?) ?? {})));
  }

  Map<String, dynamic> toJson() {
    return {
      ListUsersResponseFields.success: success,
      ListUsersResponseFields.message: message,
      ListUsersResponseFields.users:
          users.map((item) => item.toJson()).toList(),
      ListUsersResponseFields.pagination: pagination.toJson(),
      if (filters != null) ListUsersResponseFields.filters: filters?.toJson(),
      if (sort != null) ListUsersResponseFields.sort: sort?.toJson()
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    parts.add('users: $users');
    parts.add('pagination: $pagination');
    parts.add('filters: $filters');
    parts.add('sort: $sort');
    return 'ListUsersResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    const equality = DeepCollectionEquality();

    return other is ListUsersResponse &&
        other.success == success &&
        other.message == message &&
        equality.equals(other.users, users) &&
        other.pagination == pagination &&
        other.filters == filters &&
        other.sort == sort;
  }

  @override
  int get hashCode {
    const equality = DeepCollectionEquality();

    return Object.hashAll(
        [success, message, equality.hash(users), pagination, filters, sort]);
  }
}
