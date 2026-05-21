class UpdateBrandRequest {
  final String? name;
  final String? code;
  final List<String>? aliases;
  final String? description;
  final String? category;
  final String? status;
  final List<String>? regions;
  final String? logo;
  final List<String>? icons;
  final List<String>? colors;
  final Map<String, Object>? meta;
  final bool? isActive;
  final bool? isVerified;
  final bool? isFeatured;

  const UpdateBrandRequest({
    this.name,
    this.code,
    this.aliases,
    this.description,
    this.category,
    this.status,
    this.regions,
    this.logo,
    this.icons,
    this.colors,
    this.meta,
    this.isActive,
    this.isVerified,
    this.isFeatured,
  });

  factory UpdateBrandRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return UpdateBrandRequest(
      name: map['name']?.toString(),
      code: map['code']?.toString(),
      aliases: map['aliases'] == null
          ? null
          : ((map['aliases'] as List?) ?? [])
              .map((item) => item.toString())
              .toList(),
      description: map['description']?.toString(),
      category: map['category']?.toString(),
      status: map['status']?.toString(),
      regions: map['regions'] == null
          ? null
          : ((map['regions'] as List?) ?? [])
              .map((item) => item.toString())
              .toList(),
      logo: map['logo']?.toString(),
      icons: map['icons'] == null
          ? null
          : ((map['icons'] as List?) ?? [])
              .map((item) => item.toString())
              .toList(),
      colors: map['colors'] == null
          ? null
          : ((map['colors'] as List?) ?? [])
              .map((item) => item.toString())
              .toList(),
      meta: map['meta'] == null
          ? null
          : Map<String, Object>.from(map['meta'] as Map),
      isActive: map['isActive'] == null ? null : map['isActive'] == true,
      isVerified: map['isVerified'] == null ? null : map['isVerified'] == true,
      isFeatured: map['isFeatured'] == null ? null : map['isFeatured'] == true,
    );
  }

  Map<String, Object?> toJson() {
    return {
      if (name != null) 'name': name,
      if (code != null) 'code': code,
      if (aliases != null) 'aliases': aliases,
      if (description != null) 'description': description,
      if (category != null) 'category': category,
      if (status != null) 'status': status,
      if (regions != null) 'regions': regions,
      if (logo != null) 'logo': logo,
      if (icons != null) 'icons': icons,
      if (colors != null) 'colors': colors,
      if (meta != null) 'meta': meta,
      if (isActive != null) 'isActive': isActive,
      if (isVerified != null) 'isVerified': isVerified,
      if (isFeatured != null) 'isFeatured': isFeatured,
    };
  }
}
