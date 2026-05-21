// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\shared\filters\model.dart

import 'package:riderescue_api/dtos/shared/filters/fields.dart';

class Filters {
  const Filters();
  factory Filters.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return Filters();
  }

  Map<String, dynamic> toJson() {
    return {};
  }

  @override
  String toString() {
    return 'Filters()';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Filters;
  }

  @override
  int get hashCode {
    return super.hashCode;
  }
}
