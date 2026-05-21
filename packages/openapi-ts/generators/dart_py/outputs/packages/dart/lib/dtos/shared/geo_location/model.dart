// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\shared\geo_location\model.dart

import 'package:riderescue_api/dtos/shared/geo_location/fields.dart';

class GeoLocation {
  final String type;
  final Object coordinates;
  const GeoLocation({required this.type, required this.coordinates});
  GeoLocation copyWith({String? type, Object? coordinates}) {
    return GeoLocation(
        type: type ?? this.type, coordinates: coordinates ?? this.coordinates);
  }

  factory GeoLocation.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return GeoLocation(
        type: map[GeoLocationFields.type]?.toString() ?? "",
        coordinates: map[GeoLocationFields.coordinates]);
  }

  Map<String, dynamic> toJson() {
    return {
      GeoLocationFields.type: type,
      GeoLocationFields.coordinates: coordinates
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('type: $type');
    parts.add('coordinates: $coordinates');
    return 'GeoLocation(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is GeoLocation &&
        other.type == type &&
        other.coordinates == coordinates;
  }

  @override
  int get hashCode {
    return Object.hashAll([type, coordinates]);
  }
}
