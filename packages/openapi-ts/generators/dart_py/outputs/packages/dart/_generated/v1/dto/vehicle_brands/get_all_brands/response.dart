class GetAllBrandsResponse {
  final bool success;
  final String message;
  final List<Map<String, Object?>> brands;
  final Map<String, Object?>? pagination;
  final Map<String, Object>? filters;
  final Map<String, num>? sort;
  final Map<String, Object?>? fields;

  const GetAllBrandsResponse({
    required this.success,
    required this.message,
    required this.brands,
    this.pagination,
    this.filters,
    this.sort,
    this.fields,
  });

  factory GetAllBrandsResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return GetAllBrandsResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
      brands: ((map['brands'] as List?) ?? [])
          .map((item) => Map<String, Object?>.from(item as Map))
          .toList(),
      pagination: map['pagination'] == null
          ? null
          : Map<String, Object?>.from(map['pagination'] as Map),
      filters: map['filters'] == null
          ? null
          : Map<String, Object>.from(map['filters'] as Map),
      sort: map['sort'] == null
          ? null
          : Map<String, num>.from(map['sort'] as Map),
      fields: map['fields'] == null
          ? null
          : Map<String, Object?>.from(map['fields'] as Map),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'success': success,
      'message': message,
      'brands': brands,
      if (pagination != null) 'pagination': pagination,
      if (filters != null) 'filters': filters,
      if (sort != null) 'sort': sort,
      if (fields != null) 'fields': fields,
    };
  }
}
