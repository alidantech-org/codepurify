// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\auth\resend_verification_email\response\model.dart

import 'package:riderescue_api/dtos/auth/resend_verification_email/response/fields.dart';

class ResendVerificationEmailResponse {
  final bool success;
  final String message;
  const ResendVerificationEmailResponse(
      {required this.success, required this.message});
  ResendVerificationEmailResponse copyWith({bool? success, String? message}) {
    return ResendVerificationEmailResponse(
        success: success ?? this.success, message: message ?? this.message);
  }

  factory ResendVerificationEmailResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return ResendVerificationEmailResponse(
        success: map[ResendVerificationEmailResponseFields.success] == true,
        message:
            map[ResendVerificationEmailResponseFields.message]?.toString() ??
                "");
  }

  Map<String, dynamic> toJson() {
    return {
      ResendVerificationEmailResponseFields.success: success,
      ResendVerificationEmailResponseFields.message: message
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    return 'ResendVerificationEmailResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ResendVerificationEmailResponse &&
        other.success == success &&
        other.message == message;
  }

  @override
  int get hashCode {
    return Object.hashAll([success, message]);
  }
}
