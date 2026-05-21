class GetMyNotificationsQuery {
  final int? page;
  final int? limit;
  final int? skip;
  final String? sort;
  final String? fields;
  final String? q;
  final String? search;
  final String? from;
  final String? to;
  final String? populate;
  final bool? isRead;
  final String? category;

  const GetMyNotificationsQuery({
    this.page,
    this.limit,
    this.skip,
    this.sort,
    this.fields,
    this.q,
    this.search,
    this.from,
    this.to,
    this.populate,
    this.isRead,
    this.category,
  });

  factory GetMyNotificationsQuery.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return GetMyNotificationsQuery(
      page: map['page'] == null ? null : int.tryParse(map['page'].toString()),
      limit:
          map['limit'] == null ? null : int.tryParse(map['limit'].toString()),
      skip: map['skip'] == null ? null : int.tryParse(map['skip'].toString()),
      sort: map['sort']?.toString(),
      fields: map['fields']?.toString(),
      q: map['q']?.toString(),
      search: map['search']?.toString(),
      from: map['from']?.toString(),
      to: map['to']?.toString(),
      populate: map['populate']?.toString(),
      isRead: map['isRead'] == null ? null : map['isRead'] == true,
      category: map['category']?.toString(),
    );
  }

  Map<String, Object?> toJson() {
    return {
      if (page != null) 'page': page,
      if (limit != null) 'limit': limit,
      if (skip != null) 'skip': skip,
      if (sort != null) 'sort': sort,
      if (fields != null) 'fields': fields,
      if (q != null) 'q': q,
      if (search != null) 'search': search,
      if (from != null) 'from': from,
      if (to != null) 'to': to,
      if (populate != null) 'populate': populate,
      if (isRead != null) 'isRead': isRead,
      if (category != null) 'category': category,
    };
  }
}
