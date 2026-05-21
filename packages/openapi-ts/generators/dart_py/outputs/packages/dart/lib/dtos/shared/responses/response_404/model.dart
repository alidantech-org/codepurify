// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\shared\responses\response_404\model.dart

import 'package:riderescue_api/dtos/shared/responses/response_404/fields.dart';

class NotFoundResponse {
  final bool success;
  final String message;
  const NotFoundResponse({required this.success, required this.message});
  NotFoundResponse copyWith({bool? success, String? message}) {
    return NotFoundResponse(
        success: success ?? this.success, message: message ?? this.message);
  }

  factory NotFoundResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return NotFoundResponse(
        success: map[NotFoundResponseFields.success] == true,
        message: map[NotFoundResponseFields.message]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {
      NotFoundResponseFields.success: success,
      NotFoundResponseFields.message: message
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    return 'NotFoundResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is NotFoundResponse &&
        other.success == success &&
        other.message == message;
  }

  @override
  int get hashCode {
    return Object.hashAll([success, message]);
  }
}
