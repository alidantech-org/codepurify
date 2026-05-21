// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\shared\pagination_meta\model.dart

import 'package:riderescue_api/dtos/shared/pagination_meta/fields.dart';

class PaginationMeta {
  final int page;
  final int limit;
  final num total;
  final num totalPages;
  const PaginationMeta(
      {required this.page,
      required this.limit,
      required this.total,
      required this.totalPages});
  PaginationMeta copyWith(
      {int? page, int? limit, num? total, num? totalPages}) {
    return PaginationMeta(
        page: page ?? this.page,
        limit: limit ?? this.limit,
        total: total ?? this.total,
        totalPages: totalPages ?? this.totalPages);
  }

  factory PaginationMeta.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return PaginationMeta(
        page: map[PaginationMetaFields.page] is int
            ? map[PaginationMetaFields.page]
            : int.tryParse(map[PaginationMetaFields.page]?.toString() ?? "") ??
                0,
        limit: map[PaginationMetaFields.limit] is int
            ? map[PaginationMetaFields.limit]
            : int.tryParse(map[PaginationMetaFields.limit]?.toString() ?? "") ??
                0,
        total: map[PaginationMetaFields.total] is num
            ? map[PaginationMetaFields.total]
            : num.tryParse(map[PaginationMetaFields.total]?.toString() ?? "") ??
                0,
        totalPages: map[PaginationMetaFields.totalPages] is num
            ? map[PaginationMetaFields.totalPages]
            : num.tryParse(
                    map[PaginationMetaFields.totalPages]?.toString() ?? "") ??
                0);
  }

  Map<String, dynamic> toJson() {
    return {
      PaginationMetaFields.page: page,
      PaginationMetaFields.limit: limit,
      PaginationMetaFields.total: total,
      PaginationMetaFields.totalPages: totalPages
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('page: $page');
    parts.add('limit: $limit');
    parts.add('total: $total');
    parts.add('totalPages: $totalPages');
    return 'PaginationMeta(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is PaginationMeta &&
        other.page == page &&
        other.limit == limit &&
        other.total == total &&
        other.totalPages == totalPages;
  }

  @override
  int get hashCode {
    return Object.hashAll([page, limit, total, totalPages]);
  }
}
