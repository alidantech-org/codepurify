class GetAllServicesQuery {
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
  final String? category;
  final String? status;
  final bool? isActive;
  final bool? isVerified;
  final bool? isFeatured;
  final bool? isEmergency;
  final bool? isMobile;

  const GetAllServicesQuery({
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
    this.category,
    this.status,
    this.isActive,
    this.isVerified,
    this.isFeatured,
    this.isEmergency,
    this.isMobile,
  });

  factory GetAllServicesQuery.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return GetAllServicesQuery(
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
      category: map['category']?.toString(),
      status: map['status']?.toString(),
      isActive: map['isActive'] == null ? null : map['isActive'] == true,
      isVerified: map['isVerified'] == null ? null : map['isVerified'] == true,
      isFeatured: map['isFeatured'] == null ? null : map['isFeatured'] == true,
      isEmergency:
          map['isEmergency'] == null ? null : map['isEmergency'] == true,
      isMobile: map['isMobile'] == null ? null : map['isMobile'] == true,
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
      if (category != null) 'category': category,
      if (status != null) 'status': status,
      if (isActive != null) 'isActive': isActive,
      if (isVerified != null) 'isVerified': isVerified,
      if (isFeatured != null) 'isFeatured': isFeatured,
      if (isEmergency != null) 'isEmergency': isEmergency,
      if (isMobile != null) 'isMobile': isMobile,
    };
  }
}
