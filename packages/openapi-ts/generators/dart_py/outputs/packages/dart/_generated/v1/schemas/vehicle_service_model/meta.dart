import 'package:collection/collection.dart';

class VehicleServiceModelMeta {
  final String? skillLevel;
  final List<String>? tools;
  final List<String>? certifications;
  final List<String>? safetyHazards;
  final String? recommendedFrequency;
  final String? warrantyInfo;

  const VehicleServiceModelMeta({
    this.skillLevel,
    this.tools,
    this.certifications,
    this.safetyHazards,
    this.recommendedFrequency,
    this.warrantyInfo,
  });

  VehicleServiceModelMeta copyWith({
    String? skillLevel,
    List<String>? tools,
    List<String>? certifications,
    List<String>? safetyHazards,
    String? recommendedFrequency,
    String? warrantyInfo,
  }) {
    return VehicleServiceModelMeta(
      skillLevel: skillLevel ?? this.skillLevel,
      tools: tools ?? this.tools,
      certifications: certifications ?? this.certifications,
      safetyHazards: safetyHazards ?? this.safetyHazards,
      recommendedFrequency: recommendedFrequency ?? this.recommendedFrequency,
      warrantyInfo: warrantyInfo ?? this.warrantyInfo,
    );
  }

  factory VehicleServiceModelMeta.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return VehicleServiceModelMeta(
      skillLevel: map['skillLevel']?.toString(),
      tools: map['tools'] == null
          ? null
          : ((map['tools'] as List?) ?? [])
              .map((item) => item.toString())
              .toList(),
      certifications: map['certifications'] == null
          ? null
          : ((map['certifications'] as List?) ?? [])
              .map((item) => item.toString())
              .toList(),
      safetyHazards: map['safetyHazards'] == null
          ? null
          : ((map['safetyHazards'] as List?) ?? [])
              .map((item) => item.toString())
              .toList(),
      recommendedFrequency: map['recommendedFrequency']?.toString(),
      warrantyInfo: map['warrantyInfo']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (skillLevel != null) 'skillLevel': skillLevel,
      if (tools != null) 'tools': tools,
      if (certifications != null) 'certifications': certifications,
      if (safetyHazards != null) 'safetyHazards': safetyHazards,
      if (recommendedFrequency != null)
        'recommendedFrequency': recommendedFrequency,
      if (warrantyInfo != null) 'warrantyInfo': warrantyInfo,
    };
  }

  @override
  String toString() {
    return 'VehicleServiceModelMeta('
        'skillLevel: $skillLevel, '
        'tools: $tools, '
        'certifications: $certifications, '
        'safetyHazards: $safetyHazards, '
        'recommendedFrequency: $recommendedFrequency, '
        'warrantyInfo: $warrantyInfo'
        ')';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    const equality = DeepCollectionEquality();

    return other is VehicleServiceModelMeta &&
        other.skillLevel == skillLevel &&
        equality.equals(other.tools, tools) &&
        equality.equals(other.certifications, certifications) &&
        equality.equals(other.safetyHazards, safetyHazards) &&
        other.recommendedFrequency == recommendedFrequency &&
        other.warrantyInfo == warrantyInfo;
  }

  @override
  int get hashCode {
    const equality = DeepCollectionEquality();

    return Object.hashAll([
      skillLevel,
      equality.hash(tools),
      equality.hash(certifications),
      equality.hash(safetyHazards),
      recommendedFrequency,
      warrantyInfo,
    ]);
  }
}
