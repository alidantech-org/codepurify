// GENERATED FILE - DO NOT EDIT MANUALLY
// ignore_for_file: unused_import

class VehicleServiceMeta {
  final VehicleServiceComplexity? skillLevel;
  final List<String>? tools;
  final List<String>? certifications;
  final List<String>? safetyHazards;
  final String? recommendedFrequency;
  final String? warrantyInfo;

  const VehicleServiceMeta({
    this.skillLevel,
    this.tools,
    this.certifications,
    this.safetyHazards,
    this.recommendedFrequency,
    this.warrantyInfo,
  });

  factory VehicleServiceMeta.fromJson(Map<String, dynamic> json) {
    return VehicleServiceMeta(
      skillLevel:
          VehicleServiceComplexity.fromJson(json['skillLevel'] as String?),
      tools: json['tools'] == null ? null : List.from(json['tools'] as List),
      certifications: json['certifications'] == null
          ? null
          : List.from(json['certifications'] as List),
      safetyHazards: json['safetyHazards'] == null
          ? null
          : List.from(json['safetyHazards'] as List),
      recommendedFrequency: json['recommendedFrequency'],
      warrantyInfo: json['warrantyInfo'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'skillLevel': skillLevel?.toJson(),
      'tools': tools,
      'certifications': certifications,
      'safetyHazards': safetyHazards,
      'recommendedFrequency': recommendedFrequency,
      'warrantyInfo': warrantyInfo,
    };
  }

  VehicleServiceMeta copyWith({
    VehicleServiceComplexity? skillLevel,
    List<String>? tools,
    List<String>? certifications,
    List<String>? safetyHazards,
    String? recommendedFrequency,
    String? warrantyInfo,
  }) {
    return VehicleServiceMeta(
      skillLevel: skillLevel ?? this.skillLevel,
      tools: tools ?? this.tools,
      certifications: certifications ?? this.certifications,
      safetyHazards: safetyHazards ?? this.safetyHazards,
      recommendedFrequency: recommendedFrequency ?? this.recommendedFrequency,
      warrantyInfo: warrantyInfo ?? this.warrantyInfo,
    );
  }
}

class VehicleService {
  final String id;
  final String name;
  final String code;
  final List<String> aliases;
  final String? description;
  final VehicleServiceCategory category;
  final List<VehicleServiceType> serviceTypes;
  final VehicleServiceStatus status;
  final String? icon;
  final String? logo;
  final List<String> icons;
  final List<String> colors;
  final VehicleServiceMeta meta;
  final double? estimatedCost;
  final Map<String, dynamic>? estimatedCostRange;
  final double? estimatedDurationHrs;
  final Map<String, dynamic>? estimatedDurationRange;
  final bool isActive;
  final bool isVerified;
  final bool isFeatured;
  final bool isEmergency;
  final bool isMobile;
  final int usageCount;
  final double avgRating;
  final int providerCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  const VehicleService({
    required this.id,
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
    required this.meta,
    this.estimatedCost,
    this.estimatedCostRange,
    this.estimatedDurationHrs,
    this.estimatedDurationRange,
    required this.isActive,
    required this.isVerified,
    required this.isFeatured,
    required this.isEmergency,
    required this.isMobile,
    required this.usageCount,
    required this.avgRating,
    required this.providerCount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory VehicleService.fromJson(Map<String, dynamic> json) {
    return VehicleService(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      code: json['code'] ?? '',
      aliases:
          json['aliases'] == null ? [] : List.from(json['aliases'] as List),
      description: json['description'],
      category: VehicleServiceCategory.fromJson(json['category'] as String?) ??
          VehicleServiceCategory.values.first,
      serviceTypes: json['serviceTypes'] == null
          ? <VehicleServiceType>[]
          : (json['serviceTypes'] as List)
              .map((e) => VehicleServiceType.fromJson(e as String)!)
              .toList(),
      status: VehicleServiceStatus.fromJson(json['status'] as String?) ??
          VehicleServiceStatus.values.first,
      icon: json['icon'],
      logo: json['logo'],
      icons: json['icons'] == null ? [] : List.from(json['icons'] as List),
      colors: json['colors'] == null ? [] : List.from(json['colors'] as List),
      meta: json['meta'] == null
          ? VehicleServiceMeta.fromJson(<String, dynamic>{})
          : VehicleServiceMeta.fromJson(
              Map<String, dynamic>.from(json['meta'] as Map)),
      estimatedCost: json['estimatedCost'],
      estimatedCostRange: json['estimatedCostRange'] == null
          ? null
          : Map<String, dynamic>.from(json['estimatedCostRange'] as Map),
      estimatedDurationHrs: json['estimatedDurationHrs'],
      estimatedDurationRange: json['estimatedDurationRange'] == null
          ? null
          : Map<String, dynamic>.from(json['estimatedDurationRange'] as Map),
      isActive: json['isActive'] ?? false,
      isVerified: json['isVerified'] ?? false,
      isFeatured: json['isFeatured'] ?? false,
      isEmergency: json['isEmergency'] ?? false,
      isMobile: json['isMobile'] ?? false,
      usageCount: json['usageCount'] ?? 0,
      avgRating: json['avgRating'] ?? 0,
      providerCount: json['providerCount'] ?? 0,
      createdAt: json['createdAt'] == null
          ? DateTime.now()
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? DateTime.now()
          : DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'code': code,
      'aliases': aliases,
      'description': description,
      'category': category.toJson(),
      'serviceTypes': serviceTypes.map((e) => e.toJson()).toList(),
      'status': status.toJson(),
      'icon': icon,
      'logo': logo,
      'icons': icons,
      'colors': colors,
      'meta': meta.toJson(),
      'estimatedCost': estimatedCost,
      'estimatedCostRange': estimatedCostRange,
      'estimatedDurationHrs': estimatedDurationHrs,
      'estimatedDurationRange': estimatedDurationRange,
      'isActive': isActive,
      'isVerified': isVerified,
      'isFeatured': isFeatured,
      'isEmergency': isEmergency,
      'isMobile': isMobile,
      'usageCount': usageCount,
      'avgRating': avgRating,
      'providerCount': providerCount,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  VehicleService copyWith({
    String? id,
    String? name,
    String? code,
    List<String>? aliases,
    String? description,
    VehicleServiceCategory? category,
    List<VehicleServiceType>? serviceTypes,
    VehicleServiceStatus? status,
    String? icon,
    String? logo,
    List<String>? icons,
    List<String>? colors,
    VehicleServiceMeta? meta,
    double? estimatedCost,
    Map<String, dynamic>? estimatedCostRange,
    double? estimatedDurationHrs,
    Map<String, dynamic>? estimatedDurationRange,
    bool? isActive,
    bool? isVerified,
    bool? isFeatured,
    bool? isEmergency,
    bool? isMobile,
    int? usageCount,
    double? avgRating,
    int? providerCount,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return VehicleService(
      id: id ?? this.id,
      name: name ?? this.name,
      code: code ?? this.code,
      aliases: aliases ?? this.aliases,
      description: description ?? this.description,
      category: category ?? this.category,
      serviceTypes: serviceTypes ?? this.serviceTypes,
      status: status ?? this.status,
      icon: icon ?? this.icon,
      logo: logo ?? this.logo,
      icons: icons ?? this.icons,
      colors: colors ?? this.colors,
      meta: meta ?? this.meta,
      estimatedCost: estimatedCost ?? this.estimatedCost,
      estimatedCostRange: estimatedCostRange ?? this.estimatedCostRange,
      estimatedDurationHrs: estimatedDurationHrs ?? this.estimatedDurationHrs,
      estimatedDurationRange:
          estimatedDurationRange ?? this.estimatedDurationRange,
      isActive: isActive ?? this.isActive,
      isVerified: isVerified ?? this.isVerified,
      isFeatured: isFeatured ?? this.isFeatured,
      isEmergency: isEmergency ?? this.isEmergency,
      isMobile: isMobile ?? this.isMobile,
      usageCount: usageCount ?? this.usageCount,
      avgRating: avgRating ?? this.avgRating,
      providerCount: providerCount ?? this.providerCount,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

enum VehicleServiceCategory {
  mechanical('mechanical'),
  electrical('electrical'),
  diagnostic('diagnostic'),
  body('body'),
  detailing('detailing'),
  tire('tire'),
  glass('glass'),
  other('other');

  final String value;

  const VehicleServiceCategory(this.value);

  static VehicleServiceCategory? fromJson(String? value) {
    if (value == null) return null;

    return VehicleServiceCategory.values.firstWhere(
      (item) => item.value == value,
      orElse: () => VehicleServiceCategory.mechanical,
    );
  }

  String toJson() => value;
}

enum VehicleServiceType {
  maintenance('maintenance'),
  repair('repair'),
  diagnostic('diagnostic'),
  inspection('inspection'),
  installation('installation'),
  replacement('replacement'),
  upgrade('upgrade'),
  other('other');

  final String value;

  const VehicleServiceType(this.value);

  static VehicleServiceType? fromJson(String? value) {
    if (value == null) return null;

    return VehicleServiceType.values.firstWhere(
      (item) => item.value == value,
      orElse: () => VehicleServiceType.maintenance,
    );
  }

  String toJson() => value;
}

enum VehicleServiceStatus {
  active('active'),
  inactive('inactive'),
  seasonal('seasonal'),
  deprecated('deprecated');

  final String value;

  const VehicleServiceStatus(this.value);

  static VehicleServiceStatus? fromJson(String? value) {
    if (value == null) return null;

    return VehicleServiceStatus.values.firstWhere(
      (item) => item.value == value,
      orElse: () => VehicleServiceStatus.active,
    );
  }

  String toJson() => value;
}

enum VehicleServiceComplexity {
  basic('basic'),
  intermediate('intermediate'),
  advanced('advanced'),
  expert('expert');

  final String value;

  const VehicleServiceComplexity(this.value);

  static VehicleServiceComplexity? fromJson(String? value) {
    if (value == null) return null;

    return VehicleServiceComplexity.values.firstWhere(
      (item) => item.value == value,
      orElse: () => VehicleServiceComplexity.basic,
    );
  }

  String toJson() => value;
}
