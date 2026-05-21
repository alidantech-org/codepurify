// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\shared\responses\response_409\model.dart

import 'package:riderescue_api/dtos/shared/responses/response_409/fields.dart';

class ConflictResponse {
  final bool success;
  final String message;
  const ConflictResponse({required this.success, required this.message});
  ConflictResponse copyWith({bool? success, String? message}) {
    return ConflictResponse(
        success: success ?? this.success, message: message ?? this.message);
  }

  factory ConflictResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return ConflictResponse(
        success: map[ConflictResponseFields.success] == true,
        message: map[ConflictResponseFields.message]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {
      ConflictResponseFields.success: success,
      ConflictResponseFields.message: message
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    return 'ConflictResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ConflictResponse &&
        other.success == success &&
        other.message == message;
  }

  @override
  int get hashCode {
    return Object.hashAll([success, message]);
  }
}
