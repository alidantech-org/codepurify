class PaginationMeta {
  final num page;
  final num limit;
  final num total;
  final num totalPages;

  const PaginationMeta({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  PaginationMeta copyWith({
    num? page,
    num? limit,
    num? total,
    num? totalPages,
  }) {
    return PaginationMeta(
      page: page ?? this.page,
      limit: limit ?? this.limit,
      total: total ?? this.total,
      totalPages: totalPages ?? this.totalPages,
    );
  }

  factory PaginationMeta.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return PaginationMeta(
      page: num.tryParse(map['page']?.toString() ?? "") ?? 0,
      limit: num.tryParse(map['limit']?.toString() ?? "") ?? 0,
      total: num.tryParse(map['total']?.toString() ?? "") ?? 0,
      totalPages: num.tryParse(map['totalPages']?.toString() ?? "") ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'page': page,
      'limit': limit,
      'total': total,
      'totalPages': totalPages,
    };
  }

  @override
  String toString() {
    return 'PaginationMeta('
        'page: $page, '
        'limit: $limit, '
        'total: $total, '
        'totalPages: $totalPages'
        ')';
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
    return Object.hashAll([
      page,
      limit,
      total,
      totalPages,
    ]);
  }
}
