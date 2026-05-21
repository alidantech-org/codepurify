// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\auth\reset_password\response\model.dart

import 'package:riderescue_api/dtos/auth/reset_password/response/fields.dart';

class ResetPasswordResponse {
  final bool success;
  final String message;
  const ResetPasswordResponse({required this.success, required this.message});
  ResetPasswordResponse copyWith({bool? success, String? message}) {
    return ResetPasswordResponse(
        success: success ?? this.success, message: message ?? this.message);
  }

  factory ResetPasswordResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return ResetPasswordResponse(
        success: map[ResetPasswordResponseFields.success] == true,
        message: map[ResetPasswordResponseFields.message]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {
      ResetPasswordResponseFields.success: success,
      ResetPasswordResponseFields.message: message
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    return 'ResetPasswordResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ResetPasswordResponse &&
        other.success == success &&
        other.message == message;
  }

  @override
  int get hashCode {
    return Object.hashAll([success, message]);
  }
}
