// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\shared\responses\response_422\model.dart

import 'package:riderescue_api/dtos/shared/responses/response_422/fields.dart';
import 'package:riderescue_api/dtos/shared/validation_errors/model.dart';

class ValidationErrorResponse {
  final bool success;
  final String message;
  final ValidationErrors errors;
  const ValidationErrorResponse(
      {required this.success, required this.message, required this.errors});
  ValidationErrorResponse copyWith(
      {bool? success, String? message, ValidationErrors? errors}) {
    return ValidationErrorResponse(
        success: success ?? this.success,
        message: message ?? this.message,
        errors: errors ?? this.errors);
  }

  factory ValidationErrorResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return ValidationErrorResponse(
        success: map[ValidationErrorResponseFields.success] == true,
        message: map[ValidationErrorResponseFields.message]?.toString() ?? "",
        errors: ValidationErrors.fromJson(Map<String, dynamic>.from(
            (map[ValidationErrorResponseFields.errors] as Map?) ?? {})));
  }

  Map<String, dynamic> toJson() {
    return {
      ValidationErrorResponseFields.success: success,
      ValidationErrorResponseFields.message: message,
      ValidationErrorResponseFields.errors: errors.toJson()
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    parts.add('errors: $errors');
    return 'ValidationErrorResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ValidationErrorResponse &&
        other.success == success &&
        other.message == message &&
        other.errors == errors;
  }

  @override
  int get hashCode {
    return Object.hashAll([success, message, errors]);
  }
}
