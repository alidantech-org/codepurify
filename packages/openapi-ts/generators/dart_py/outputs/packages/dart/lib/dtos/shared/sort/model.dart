// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\shared\sort\model.dart

import 'package:riderescue_api/dtos/shared/sort/fields.dart';

class Sort {
  const Sort();
  factory Sort.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return Sort();
  }

  Map<String, dynamic> toJson() {
    return {};
  }

  @override
  String toString() {
    return 'Sort()';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Sort;
  }

  @override
  int get hashCode {
    return super.hashCode;
  }
}
