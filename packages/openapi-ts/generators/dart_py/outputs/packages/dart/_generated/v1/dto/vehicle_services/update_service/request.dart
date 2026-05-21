class UpdateServiceRequest {
  final String? name;
  final String? code;
  final List<String>? aliases;
  final String? description;
  final String? category;
  final List<String>? serviceTypes;
  final String? status;
  final String? icon;
  final String? logo;
  final List<String>? icons;
  final List<String>? colors;
  final Map<String, Object?>? meta;
  final num? estimatedCost;
  final Map<String, Object?>? estimatedCostRange;
  final num? estimatedDurationHrs;
  final Map<String, Object?>? estimatedDurationRange;
  final bool? isActive;
  final bool? isVerified;
  final bool? isFeatured;
  final bool? isEmergency;
  final bool? isMobile;

  const UpdateServiceRequest({
    this.name,
    this.code,
    this.aliases,
    this.description,
    this.category,
    this.serviceTypes,
    this.status,
    this.icon,
    this.logo,
    this.icons,
    this.colors,
    this.meta,
    this.estimatedCost,
    this.estimatedCostRange,
    this.estimatedDurationHrs,
    this.estimatedDurationRange,
    this.isActive,
    this.isVerified,
    this.isFeatured,
    this.isEmergency,
    this.isMobile,
  });

  factory UpdateServiceRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return UpdateServiceRequest(
      name: map['name']?.toString(),
      code: map['code']?.toString(),
      aliases: map['aliases'] == null
          ? null
          : ((map['aliases'] as List?) ?? [])
              .map((item) => item.toString())
              .toList(),
      description: map['description']?.toString(),
      category: map['category']?.toString(),
      serviceTypes: map['serviceTypes'] == null
          ? null
          : ((map['serviceTypes'] as List?) ?? [])
              .map((item) => item.toString())
              .toList(),
      status: map['status']?.toString(),
      icon: map['icon']?.toString(),
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
          : Map<String, Object?>.from(map['meta'] as Map),
      estimatedCost: map['estimatedCost'] == null
          ? null
          : num.tryParse(map['estimatedCost'].toString()),
      estimatedCostRange: map['estimatedCostRange'] == null
          ? null
          : Map<String, Object?>.from(map['estimatedCostRange'] as Map),
      estimatedDurationHrs: map['estimatedDurationHrs'] == null
          ? null
          : num.tryParse(map['estimatedDurationHrs'].toString()),
      estimatedDurationRange: map['estimatedDurationRange'] == null
          ? null
          : Map<String, Object?>.from(map['estimatedDurationRange'] as Map),
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
      if (name != null) 'name': name,
      if (code != null) 'code': code,
      if (aliases != null) 'aliases': aliases,
      if (description != null) 'description': description,
      if (category != null) 'category': category,
      if (serviceTypes != null) 'serviceTypes': serviceTypes,
      if (status != null) 'status': status,
      if (icon != null) 'icon': icon,
      if (logo != null) 'logo': logo,
      if (icons != null) 'icons': icons,
      if (colors != null) 'colors': colors,
      if (meta != null) 'meta': meta,
      if (estimatedCost != null) 'estimatedCost': estimatedCost,
      if (estimatedCostRange != null) 'estimatedCostRange': estimatedCostRange,
      if (estimatedDurationHrs != null)
        'estimatedDurationHrs': estimatedDurationHrs,
      if (estimatedDurationRange != null)
        'estimatedDurationRange': estimatedDurationRange,
      if (isActive != null) 'isActive': isActive,
      if (isVerified != null) 'isVerified': isVerified,
      if (isFeatured != null) 'isFeatured': isFeatured,
      if (isEmergency != null) 'isEmergency': isEmergency,
      if (isMobile != null) 'isMobile': isMobile,
    };
  }
}
