// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\auth\forgot_password\response\model.dart

import 'package:riderescue_api/dtos/auth/forgot_password/response/fields.dart';

class ForgotPasswordResponse {
  final bool success;
  final String message;
  const ForgotPasswordResponse({required this.success, required this.message});
  ForgotPasswordResponse copyWith({bool? success, String? message}) {
    return ForgotPasswordResponse(
        success: success ?? this.success, message: message ?? this.message);
  }

  factory ForgotPasswordResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return ForgotPasswordResponse(
        success: map[ForgotPasswordResponseFields.success] == true,
        message: map[ForgotPasswordResponseFields.message]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {
      ForgotPasswordResponseFields.success: success,
      ForgotPasswordResponseFields.message: message
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    return 'ForgotPasswordResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ForgotPasswordResponse &&
        other.success == success &&
        other.message == message;
  }

  @override
  int get hashCode {
    return Object.hashAll([success, message]);
  }
}
