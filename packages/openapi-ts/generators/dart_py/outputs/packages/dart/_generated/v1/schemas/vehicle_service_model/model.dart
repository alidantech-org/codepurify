import 'estimated_cost_range.dart';
import 'estimated_duration_range.dart';
import 'meta.dart';
import 'package:collection/collection.dart';

class VehicleServiceModel {
  final String id;
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
  final VehicleServiceModelMeta? meta;
  final num? estimatedCost;
  final VehicleServiceModelEstimatedCostRange? estimatedCostRange;
  final num? estimatedDurationHrs;
  final VehicleServiceModelEstimatedDurationRange? estimatedDurationRange;
  final bool isActive;
  final bool isVerified;
  final bool isFeatured;
  final bool isEmergency;
  final bool isMobile;
  final num usageCount;
  final num avgRating;
  final num providerCount;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const VehicleServiceModel({
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
    required this.usageCount,
    required this.avgRating,
    required this.providerCount,
    this.createdAt,
    this.updatedAt,
  });

  VehicleServiceModel copyWith({
    String? id,
    String? name,
    String? code,
    List<String>? aliases,
    String? description,
    String? category,
    List<String>? serviceTypes,
    String? status,
    String? icon,
    String? logo,
    List<String>? icons,
    List<String>? colors,
    VehicleServiceModelMeta? meta,
    num? estimatedCost,
    VehicleServiceModelEstimatedCostRange? estimatedCostRange,
    num? estimatedDurationHrs,
    VehicleServiceModelEstimatedDurationRange? estimatedDurationRange,
    bool? isActive,
    bool? isVerified,
    bool? isFeatured,
    bool? isEmergency,
    bool? isMobile,
    num? usageCount,
    num? avgRating,
    num? providerCount,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return VehicleServiceModel(
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

  factory VehicleServiceModel.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return VehicleServiceModel(
      id: map['id']?.toString() ?? "",
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
          : VehicleServiceModelMeta.fromJson(map['meta']),
      estimatedCost: map['estimatedCost'] == null
          ? null
          : num.tryParse(map['estimatedCost'].toString()),
      estimatedCostRange: map['estimatedCostRange'] == null
          ? null
          : VehicleServiceModelEstimatedCostRange.fromJson(
              map['estimatedCostRange']),
      estimatedDurationHrs: map['estimatedDurationHrs'] == null
          ? null
          : num.tryParse(map['estimatedDurationHrs'].toString()),
      estimatedDurationRange: map['estimatedDurationRange'] == null
          ? null
          : VehicleServiceModelEstimatedDurationRange.fromJson(
              map['estimatedDurationRange']),
      isActive: map['isActive'] == true,
      isVerified: map['isVerified'] == true,
      isFeatured: map['isFeatured'] == true,
      isEmergency: map['isEmergency'] == true,
      isMobile: map['isMobile'] == true,
      usageCount: num.tryParse(map['usageCount']?.toString() ?? "") ?? 0,
      avgRating: num.tryParse(map['avgRating']?.toString() ?? "") ?? 0,
      providerCount: num.tryParse(map['providerCount']?.toString() ?? "") ?? 0,
      createdAt: map['createdAt'] == null
          ? null
          : DateTime.parse(map['createdAt'].toString()),
      updatedAt: map['updatedAt'] == null
          ? null
          : DateTime.parse(map['updatedAt'].toString()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
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
      if (meta != null) 'meta': meta?.toJson(),
      if (estimatedCost != null) 'estimatedCost': estimatedCost,
      if (estimatedCostRange != null)
        'estimatedCostRange': estimatedCostRange?.toJson(),
      if (estimatedDurationHrs != null)
        'estimatedDurationHrs': estimatedDurationHrs,
      if (estimatedDurationRange != null)
        'estimatedDurationRange': estimatedDurationRange?.toJson(),
      'isActive': isActive,
      'isVerified': isVerified,
      'isFeatured': isFeatured,
      'isEmergency': isEmergency,
      'isMobile': isMobile,
      'usageCount': usageCount,
      'avgRating': avgRating,
      'providerCount': providerCount,
      if (createdAt != null) 'createdAt': createdAt?.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'VehicleServiceModel('
        'id: $id, '
        'name: $name, '
        'code: $code, '
        'aliases: $aliases, '
        'description: $description, '
        'category: $category, '
        'serviceTypes: $serviceTypes, '
        'status: $status, '
        'icon: $icon, '
        'logo: $logo, '
        'icons: $icons, '
        'colors: $colors, '
        'meta: $meta, '
        'estimatedCost: $estimatedCost, '
        'estimatedCostRange: $estimatedCostRange, '
        'estimatedDurationHrs: $estimatedDurationHrs, '
        'estimatedDurationRange: $estimatedDurationRange, '
        'isActive: $isActive, '
        'isVerified: $isVerified, '
        'isFeatured: $isFeatured, '
        'isEmergency: $isEmergency, '
        'isMobile: $isMobile, '
        'usageCount: $usageCount, '
        'avgRating: $avgRating, '
        'providerCount: $providerCount, '
        'createdAt: $createdAt, '
        'updatedAt: $updatedAt'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    const equality = DeepCollectionEquality();

    return other is VehicleServiceModel &&
        other.id == id &&
        other.name == name &&
        other.code == code &&
        equality.equals(other.aliases, aliases) &&
        other.description == description &&
        other.category == category &&
        equality.equals(other.serviceTypes, serviceTypes) &&
        other.status == status &&
        other.icon == icon &&
        other.logo == logo &&
        equality.equals(other.icons, icons) &&
        equality.equals(other.colors, colors) &&
        equality.equals(other.meta, meta) &&
        other.estimatedCost == estimatedCost &&
        equality.equals(other.estimatedCostRange, estimatedCostRange) &&
        other.estimatedDurationHrs == estimatedDurationHrs &&
        equality.equals(other.estimatedDurationRange, estimatedDurationRange) &&
        other.isActive == isActive &&
        other.isVerified == isVerified &&
        other.isFeatured == isFeatured &&
        other.isEmergency == isEmergency &&
        other.isMobile == isMobile &&
        other.usageCount == usageCount &&
        other.avgRating == avgRating &&
        other.providerCount == providerCount &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt;
  }

  @override
  int get hashCode {
    const equality = DeepCollectionEquality();

    return Object.hashAll([
      id,
      name,
      code,
      equality.hash(aliases),
      description,
      category,
      equality.hash(serviceTypes),
      status,
      icon,
      logo,
      equality.hash(icons),
      equality.hash(colors),
      equality.hash(meta),
      estimatedCost,
      equality.hash(estimatedCostRange),
      estimatedDurationHrs,
      equality.hash(estimatedDurationRange),
      isActive,
      isVerified,
      isFeatured,
      isEmergency,
      isMobile,
      usageCount,
      avgRating,
      providerCount,
      createdAt,
      updatedAt,
    ]);
  }
}
