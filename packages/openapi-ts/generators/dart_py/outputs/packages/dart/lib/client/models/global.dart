// GENERATED FILE - DO NOT EDIT MANUALLY
// ignore_for_file: unused_import

enum DocumentType {
  license('license'),
  registration('registration'),
  insurance('insurance'),
  warranty('warranty'),
  other('other');

  final String value;

  const DocumentType(this.value);

  static DocumentType? fromJson(String? value) {
    if (value == null) return null;

    return DocumentType.values.firstWhere(
      (item) => item.value == value,
      orElse: () => DocumentType.license,
    );
  }

  String toJson() => value;
}

class GeoLocation {
  final String type;
  final List<double>? coordinates;

  const GeoLocation({
    required this.type,
    this.coordinates,
  });

  factory GeoLocation.fromJson(Map<String, dynamic> json) {
    return GeoLocation(
      type: json['type'] ?? '',
      coordinates: json['coordinates'] == null
          ? null
          : List.from(json['coordinates'] as List),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'coordinates': coordinates,
    };
  }

  GeoLocation copyWith({
    String? type,
    List<double>? coordinates,
  }) {
    return GeoLocation(
      type: type ?? this.type,
      coordinates: coordinates ?? this.coordinates,
    );
  }
}

enum ServiceType {
  mechanic('mechanic'),
  garage('garage'),
  towing('towing');

  final String value;

  const ServiceType(this.value);

  static ServiceType? fromJson(String? value) {
    if (value == null) return null;

    return ServiceType.values.firstWhere(
      (item) => item.value == value,
      orElse: () => ServiceType.mechanic,
    );
  }

  String toJson() => value;
}
