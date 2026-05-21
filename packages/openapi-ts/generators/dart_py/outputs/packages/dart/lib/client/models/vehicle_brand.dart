// GENERATED FILE - DO NOT EDIT MANUALLY
// ignore_for_file: unused_import

class VehicleBrandMeta {
  final int? founded;
  final String? headquarters;
  final String? country;
  final String? website;
  final String? parentBrand;
  final List<VehicleBrandRegion>? regions;

  const VehicleBrandMeta({
    this.founded,
    this.headquarters,
    this.country,
    this.website,
    this.parentBrand,
    this.regions,
  });

  factory VehicleBrandMeta.fromJson(Map<String, dynamic> json) {
    return VehicleBrandMeta(
      founded: json['founded'],
      headquarters: json['headquarters'],
      country: json['country'],
      website: json['website'],
      parentBrand: json['parentBrand'],
      regions: json['regions'] == null
          ? null
          : (json['regions'] as List)
              .map((e) => VehicleBrandRegion.fromJson(e as String)!)
              .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'founded': founded,
      'headquarters': headquarters,
      'country': country,
      'website': website,
      'parentBrand': parentBrand,
      'regions': regions?.map((e) => e.toJson()).toList(),
    };
  }

  VehicleBrandMeta copyWith({
    int? founded,
    String? headquarters,
    String? country,
    String? website,
    String? parentBrand,
    List<VehicleBrandRegion>? regions,
  }) {
    return VehicleBrandMeta(
      founded: founded ?? this.founded,
      headquarters: headquarters ?? this.headquarters,
      country: country ?? this.country,
      website: website ?? this.website,
      parentBrand: parentBrand ?? this.parentBrand,
      regions: regions ?? this.regions,
    );
  }
}

class VehicleBrand {
  final String id;
  final String name;
  final String code;
  final List<String> aliases;
  final String? description;
  final VehicleBrandCategory category;
  final VehicleBrandStatus status;
  final List<VehicleBrandRegion> regions;
  final String? logo;
  final List<String> icons;
  final List<String> colors;
  final VehicleBrandMeta meta;
  final bool isActive;
  final bool isVerified;
  final bool isFeatured;
  final int vehicleCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  const VehicleBrand({
    required this.id,
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
    required this.meta,
    required this.isActive,
    required this.isVerified,
    required this.isFeatured,
    required this.vehicleCount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory VehicleBrand.fromJson(Map<String, dynamic> json) {
    return VehicleBrand(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      code: json['code'] ?? '',
      aliases:
          json['aliases'] == null ? [] : List.from(json['aliases'] as List),
      description: json['description'],
      category: VehicleBrandCategory.fromJson(json['category'] as String?) ??
          VehicleBrandCategory.values.first,
      status: VehicleBrandStatus.fromJson(json['status'] as String?) ??
          VehicleBrandStatus.values.first,
      regions: json['regions'] == null
          ? <VehicleBrandRegion>[]
          : (json['regions'] as List)
              .map((e) => VehicleBrandRegion.fromJson(e as String)!)
              .toList(),
      logo: json['logo'],
      icons: json['icons'] == null ? [] : List.from(json['icons'] as List),
      colors: json['colors'] == null ? [] : List.from(json['colors'] as List),
      meta: json['meta'] == null
          ? VehicleBrandMeta.fromJson(<String, dynamic>{})
          : VehicleBrandMeta.fromJson(
              Map<String, dynamic>.from(json['meta'] as Map)),
      isActive: json['isActive'] ?? false,
      isVerified: json['isVerified'] ?? false,
      isFeatured: json['isFeatured'] ?? false,
      vehicleCount: json['vehicleCount'] ?? 0,
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
      'status': status.toJson(),
      'regions': regions.map((e) => e.toJson()).toList(),
      'logo': logo,
      'icons': icons,
      'colors': colors,
      'meta': meta.toJson(),
      'isActive': isActive,
      'isVerified': isVerified,
      'isFeatured': isFeatured,
      'vehicleCount': vehicleCount,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  VehicleBrand copyWith({
    String? id,
    String? name,
    String? code,
    List<String>? aliases,
    String? description,
    VehicleBrandCategory? category,
    VehicleBrandStatus? status,
    List<VehicleBrandRegion>? regions,
    String? logo,
    List<String>? icons,
    List<String>? colors,
    VehicleBrandMeta? meta,
    bool? isActive,
    bool? isVerified,
    bool? isFeatured,
    int? vehicleCount,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return VehicleBrand(
      id: id ?? this.id,
      name: name ?? this.name,
      code: code ?? this.code,
      aliases: aliases ?? this.aliases,
      description: description ?? this.description,
      category: category ?? this.category,
      status: status ?? this.status,
      regions: regions ?? this.regions,
      logo: logo ?? this.logo,
      icons: icons ?? this.icons,
      colors: colors ?? this.colors,
      meta: meta ?? this.meta,
      isActive: isActive ?? this.isActive,
      isVerified: isVerified ?? this.isVerified,
      isFeatured: isFeatured ?? this.isFeatured,
      vehicleCount: vehicleCount ?? this.vehicleCount,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

enum VehicleBrandCategory {
  automotive('automotive'),
  motorcycle('motorcycle'),
  truck('truck'),
  bus('bus'),
  electric('electric'),
  commercial('commercial'),
  other('other');

  final String value;

  const VehicleBrandCategory(this.value);

  static VehicleBrandCategory? fromJson(String? value) {
    if (value == null) return null;

    return VehicleBrandCategory.values.firstWhere(
      (item) => item.value == value,
      orElse: () => VehicleBrandCategory.automotive,
    );
  }

  String toJson() => value;
}

enum VehicleBrandStatus {
  active('active'),
  inactive('inactive'),
  discontinued('discontinued');

  final String value;

  const VehicleBrandStatus(this.value);

  static VehicleBrandStatus? fromJson(String? value) {
    if (value == null) return null;

    return VehicleBrandStatus.values.firstWhere(
      (item) => item.value == value,
      orElse: () => VehicleBrandStatus.active,
    );
  }

  String toJson() => value;
}

enum VehicleBrandRegion {
  global('global'),
  northAmerica('north_america'),
  europe('europe'),
  asia('asia'),
  africa('africa'),
  latinAmerica('latin_america'),
  middleEast('middle_east'),
  oceania('oceania');

  final String value;

  const VehicleBrandRegion(this.value);

  static VehicleBrandRegion? fromJson(String? value) {
    if (value == null) return null;

    return VehicleBrandRegion.values.firstWhere(
      (item) => item.value == value,
      orElse: () => VehicleBrandRegion.global,
    );
  }

  String toJson() => value;
}
