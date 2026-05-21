import 'meta.dart';
import 'package:collection/collection.dart';

class VehicleBrandModel {
  final String id;
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
  final VehicleBrandModelMeta? meta;
  final bool isActive;
  final bool isVerified;
  final bool isFeatured;
  final num vehicleCount;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const VehicleBrandModel({
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
    this.meta,
    required this.isActive,
    required this.isVerified,
    required this.isFeatured,
    required this.vehicleCount,
    this.createdAt,
    this.updatedAt,
  });

  VehicleBrandModel copyWith({
    String? id,
    String? name,
    String? code,
    List<String>? aliases,
    String? description,
    String? category,
    String? status,
    List<String>? regions,
    String? logo,
    List<String>? icons,
    List<String>? colors,
    VehicleBrandModelMeta? meta,
    bool? isActive,
    bool? isVerified,
    bool? isFeatured,
    num? vehicleCount,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return VehicleBrandModel(
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

  factory VehicleBrandModel.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return VehicleBrandModel(
      id: map['id']?.toString() ?? "",
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
          : VehicleBrandModelMeta.fromJson(map['meta']),
      isActive: map['isActive'] == true,
      isVerified: map['isVerified'] == true,
      isFeatured: map['isFeatured'] == true,
      vehicleCount: num.tryParse(map['vehicleCount']?.toString() ?? "") ?? 0,
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
      'status': status,
      'regions': regions,
      if (logo != null) 'logo': logo,
      'icons': icons,
      'colors': colors,
      if (meta != null) 'meta': meta?.toJson(),
      'isActive': isActive,
      'isVerified': isVerified,
      'isFeatured': isFeatured,
      'vehicleCount': vehicleCount,
      if (createdAt != null) 'createdAt': createdAt?.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'VehicleBrandModel('
        'id: $id, '
        'name: $name, '
        'code: $code, '
        'aliases: $aliases, '
        'description: $description, '
        'category: $category, '
        'status: $status, '
        'regions: $regions, '
        'logo: $logo, '
        'icons: $icons, '
        'colors: $colors, '
        'meta: $meta, '
        'isActive: $isActive, '
        'isVerified: $isVerified, '
        'isFeatured: $isFeatured, '
        'vehicleCount: $vehicleCount, '
        'createdAt: $createdAt, '
        'updatedAt: $updatedAt'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    const equality = DeepCollectionEquality();

    return other is VehicleBrandModel &&
        other.id == id &&
        other.name == name &&
        other.code == code &&
        equality.equals(other.aliases, aliases) &&
        other.description == description &&
        other.category == category &&
        other.status == status &&
        equality.equals(other.regions, regions) &&
        other.logo == logo &&
        equality.equals(other.icons, icons) &&
        equality.equals(other.colors, colors) &&
        equality.equals(other.meta, meta) &&
        other.isActive == isActive &&
        other.isVerified == isVerified &&
        other.isFeatured == isFeatured &&
        other.vehicleCount == vehicleCount &&
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
      status,
      equality.hash(regions),
      logo,
      equality.hash(icons),
      equality.hash(colors),
      equality.hash(meta),
      isActive,
      isVerified,
      isFeatured,
      vehicleCount,
      createdAt,
      updatedAt,
    ]);
  }
}
