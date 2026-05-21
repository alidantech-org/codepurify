class CreateServiceRequest {
  final String name;
  final String code;
  final List<String> aliases;
  final String? description;
  final String category;
  final List<String> serviceTypes;
  final String status;
  final String? icon;
  final String? logo;
  final List<String> icons;
  final List<String> colors;
  final Map<String, Object?>? meta;
  final num? estimatedCost;
  final Map<String, Object?>? estimatedCostRange;
  final num? estimatedDurationHrs;
  final Map<String, Object?>? estimatedDurationRange;
  final bool isActive;
  final bool isVerified;
  final bool isFeatured;
  final bool isEmergency;
  final bool isMobile;

  const CreateServiceRequest({
    required this.name,
    required this.code,
    required this.aliases,
    this.description,
    required this.category,
    required this.serviceTypes,
    required this.status,
    this.icon,
    this.logo,
    required this.icons,
    required this.colors,
    this.meta,
    this.estimatedCost,
    this.estimatedCostRange,
    this.estimatedDurationHrs,
    this.estimatedDurationRange,
    required this.isActive,
    required this.isVerified,
    required this.isFeatured,
    required this.isEmergency,
    required this.isMobile,
  });

  factory CreateServiceRequest.fromJson(dynamic json) {
    final map = Map<String, Object?>.from((json as Map?) ?? {});

    return CreateServiceRequest(
      name: map['name']?.toString() ?? "",
      code: map['code']?.toString() ?? "",
      aliases: ((map['aliases'] as List?) ?? [])
          .map((item) => item.toString())
          .toList(),
      description: map['description']?.toString(),
      category: map['category']?.toString() ?? "",
      serviceTypes: ((map['serviceTypes'] as List?) ?? [])
          .map((item) => item.toString())
          .toList(),
      status: map['status']?.toString() ?? "",
      icon: map['icon']?.toString(),
      logo: map['logo']?.toString(),
      icons: ((map['icons'] as List?) ?? [])
          .map((item) => item.toString())
          .toList(),
      colors: ((map['colors'] as List?) ?? [])
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
      isActive: map['isActive'] == true,
      isVerified: map['isVerified'] == true,
      isFeatured: map['isFeatured'] == true,
      isEmergency: map['isEmergency'] == true,
      isMobile: map['isMobile'] == true,
    );
  }

  Map<String, Object?> toJson() {
    return {
      'name': name,
      'code': code,
      'aliases': aliases,
      if (description != null) 'description': description,
      'category': category,
      'serviceTypes': serviceTypes,
      'status': status,
      if (icon != null) 'icon': icon,
      if (logo != null) 'logo': logo,
      'icons': icons,
      'colors': colors,
      if (meta != null) 'meta': meta,
      if (estimatedCost != null) 'estimatedCost': estimatedCost,
      if (estimatedCostRange != null) 'estimatedCostRange': estimatedCostRange,
      if (estimatedDurationHrs != null)
        'estimatedDurationHrs': estimatedDurationHrs,
      if (estimatedDurationRange != null)
        'estimatedDurationRange': estimatedDurationRange,
      'isActive': isActive,
      'isVerified': isVerified,
      'isFeatured': isFeatured,
      'isEmergency': isEmergency,
      'isMobile': isMobile,
    };
  }
}
