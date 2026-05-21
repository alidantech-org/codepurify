import '../../schemas/validation_errors/model.dart';

class ApiErrorResponse {
  final bool success;
  final String message;
  final String code;
  final ValidationErrors? errors;

  const ApiErrorResponse({
    required this.success,
    required this.message,
    required this.code,
    this.errors,
  });

  factory ApiErrorResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});

    return ApiErrorResponse(
      success: map['success'] == true,
      message: map['message']?.toString() ?? '',
      code: map['code']?.toString() ?? 'SERVER_ERROR',
      errors: map['errors'] == null
          ? null
          : ValidationErrors.fromJson(map['errors']),
    );
  }

  String? firstFieldError(String field) {
    final values = errors?.fields[field];
    if (values == null || values.isEmpty) return null;
    return values.first;
  }

  String? get firstFormError {
    final values = errors?.form;
    if (values == null || values.isEmpty) return null;
    return values.first;
  }
}
