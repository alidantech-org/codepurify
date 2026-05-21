// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\shared\responses\response_401\model.dart

import 'package:riderescue_api/dtos/shared/responses/response_401/fields.dart';

class UnauthorizedResponse {
  final bool success;
  final String message;
  const UnauthorizedResponse({required this.success, required this.message});
  UnauthorizedResponse copyWith({bool? success, String? message}) {
    return UnauthorizedResponse(
        success: success ?? this.success, message: message ?? this.message);
  }

  factory UnauthorizedResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return UnauthorizedResponse(
        success: map[UnauthorizedResponseFields.success] == true,
        message: map[UnauthorizedResponseFields.message]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {
      UnauthorizedResponseFields.success: success,
      UnauthorizedResponseFields.message: message
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    return 'UnauthorizedResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is UnauthorizedResponse &&
        other.success == success &&
        other.message == message;
  }

  @override
  int get hashCode {
    return Object.hashAll([success, message]);
  }
}
