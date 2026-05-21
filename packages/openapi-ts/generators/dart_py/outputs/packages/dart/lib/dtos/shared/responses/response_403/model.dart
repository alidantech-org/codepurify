// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\shared\responses\response_403\model.dart

import 'package:riderescue_api/dtos/shared/responses/response_403/fields.dart';

class ForbiddenResponse {
  final bool success;
  final String message;
  const ForbiddenResponse({required this.success, required this.message});
  ForbiddenResponse copyWith({bool? success, String? message}) {
    return ForbiddenResponse(
        success: success ?? this.success, message: message ?? this.message);
  }

  factory ForbiddenResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return ForbiddenResponse(
        success: map[ForbiddenResponseFields.success] == true,
        message: map[ForbiddenResponseFields.message]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {
      ForbiddenResponseFields.success: success,
      ForbiddenResponseFields.message: message
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    return 'ForbiddenResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ForbiddenResponse &&
        other.success == success &&
        other.message == message;
  }

  @override
  int get hashCode {
    return Object.hashAll([success, message]);
  }
}
