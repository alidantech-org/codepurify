// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\shared\validation_errors\model.dart

import 'package:riderescue_api/dtos/shared/validation_errors/fields.dart';

class ValidationErrors {
  final Object form;
  final Object fields;
  const ValidationErrors({required this.form, required this.fields});
  ValidationErrors copyWith({Object? form, Object? fields}) {
    return ValidationErrors(
        form: form ?? this.form, fields: fields ?? this.fields);
  }

  factory ValidationErrors.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return ValidationErrors(
        form: map[ValidationErrorsFields.form],
        fields: map[ValidationErrorsFields.fields]);
  }

  Map<String, dynamic> toJson() {
    return {
      ValidationErrorsFields.form: form,
      ValidationErrorsFields.fields: fields
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('form: $form');
    parts.add('fields: $fields');
    return 'ValidationErrors(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ValidationErrors &&
        other.form == form &&
        other.fields == fields;
  }

  @override
  int get hashCode {
    return Object.hashAll([form, fields]);
  }
}
