// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\auth\verify_email\response\model.dart

import 'package:riderescue_api/dtos/auth/verify_email/response/fields.dart';

class VerifyEmailResponse {
  final bool success;
  final String message;
  const VerifyEmailResponse({required this.success, required this.message});
  VerifyEmailResponse copyWith({bool? success, String? message}) {
    return VerifyEmailResponse(
        success: success ?? this.success, message: message ?? this.message);
  }

  factory VerifyEmailResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return VerifyEmailResponse(
        success: map[VerifyEmailResponseFields.success] == true,
        message: map[VerifyEmailResponseFields.message]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {
      VerifyEmailResponseFields.success: success,
      VerifyEmailResponseFields.message: message
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    return 'VerifyEmailResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is VerifyEmailResponse &&
        other.success == success &&
        other.message == message;
  }

  @override
  int get hashCode {
    return Object.hashAll([success, message]);
  }
}
