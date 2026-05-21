class CreateBrandRequest {
  final String name;
  final String code;
  final List<String> aliases;
  final String? description;
  final String category;
  final String status;
  final List<String> regions;
  final String? logo;
  final List<String> icons;
  final List<String> colors;
  final Map<String, Object>? meta;
  final bool isActive;
  final bool isVerified;
  final bool isFeatured;

  const CreateBrandRequest({
    required this.name,
    required this.code,
    required this.aliases,
    this.description,
    required this.category,
    required this.status,
    required this.regions,
    this.logo,
    required this.icons,
    required this.colors,
    this.meta,
    required this.isActive,
    required this.isVerified,
    required this.isFeatured,
  });

  factory CreateBrandRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return CreateBrandRequest(
      name: map['name']?.toString() ?? "",
      code: map['code']?.toString() ?? "",
      aliases: ((map['aliases'] as List?) ?? [])
          .map((item) => item.toString())
          .toList(),
      description: map['description']?.toString(),
      category: map['category']?.toString() ?? "",
      status: map['status']?.toString() ?? "",
      regions: ((map['regions'] as List?) ?? [])
          .map((item) => item.toString())
          .toList(),
      logo: map['logo']?.toString(),
      icons: ((map['icons'] as List?) ?? [])
          .map((item) => item.toString())
          .toList(),
      colors: ((map['colors'] as List?) ?? [])
          .map((item) => item.toString())
          .toList(),
      meta: map['meta'] == null
          ? null
          : Map<String, Object>.from(map['meta'] as Map),
      isActive: map['isActive'] == true,
      isVerified: map['isVerified'] == true,
      isFeatured: map['isFeatured'] == true,
    );
  }

  Map<String, Object?> toJson() {
    return {
      'name': name,
      'code': code,
      'aliases': aliases,
      if (description != null) 'description': description,
      'category': category,
      'status': status,
      'regions': regions,
      if (logo != null) 'logo': logo,
      'icons': icons,
      'colors': colors,
      if (meta != null) 'meta': meta,
      'isActive': isActive,
      'isVerified': isVerified,
      'isFeatured': isFeatured,
    };
  }
}
