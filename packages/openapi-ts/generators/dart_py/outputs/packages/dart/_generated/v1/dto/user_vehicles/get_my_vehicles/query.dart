class GetMyVehiclesQuery {
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
  final String? status;
  final bool? isPrimary;
  final bool? isVerified;

  const GetMyVehiclesQuery({
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
    this.status,
    this.isPrimary,
    this.isVerified,
  });

  factory GetMyVehiclesQuery.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return GetMyVehiclesQuery(
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
      status: map['status']?.toString(),
      isPrimary: map['isPrimary'] == null ? null : map['isPrimary'] == true,
      isVerified: map['isVerified'] == null ? null : map['isVerified'] == true,
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
      if (status != null) 'status': status,
      if (isPrimary != null) 'isPrimary': isPrimary,
      if (isVerified != null) 'isVerified': isVerified,
    };
  }
}
