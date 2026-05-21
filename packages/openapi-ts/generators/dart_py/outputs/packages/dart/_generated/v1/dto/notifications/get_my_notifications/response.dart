class GetMyNotificationsResponse {
  final bool success;
  final String message;
  final List<Map<String, Object?>> notifications;
  final Map<String, Object?>? pagination;
  final Map<String, Object>? filters;
  final Map<String, num>? sort;
  final Map<String, Object?>? fields;

  const GetMyNotificationsResponse({
    required this.success,
    required this.message,
    required this.notifications,
    this.pagination,
    this.filters,
    this.sort,
    this.fields,
  });

  factory GetMyNotificationsResponse.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return GetMyNotificationsResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? "",
      notifications: ((map['notifications'] as List?) ?? [])
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
      'notifications': notifications,
      if (pagination != null) 'pagination': pagination,
      if (filters != null) 'filters': filters,
      if (sort != null) 'sort': sort,
      if (fields != null) 'fields': fields,
    };
  }
}
