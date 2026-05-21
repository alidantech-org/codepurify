// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\auth\resolve_email\response\model.dart

import 'package:riderescue_api/dtos/auth/resolve_email/response/fields.dart';
import 'package:riderescue_api/enums/auth_next_step/enum.dart';

class ResolveEmailResponse {
  final bool success;
  final String message;
  final String email;
  final AuthNextStep nextStep;
  const ResolveEmailResponse(
      {required this.success,
      required this.message,
      required this.email,
      required this.nextStep});
  ResolveEmailResponse copyWith(
      {bool? success, String? message, String? email, AuthNextStep? nextStep}) {
    return ResolveEmailResponse(
        success: success ?? this.success,
        message: message ?? this.message,
        email: email ?? this.email,
        nextStep: nextStep ?? this.nextStep);
  }

  factory ResolveEmailResponse.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return ResolveEmailResponse(
        success: map[ResolveEmailResponseFields.success] == true,
        message: map[ResolveEmailResponseFields.message]?.toString() ?? "",
        email: map[ResolveEmailResponseFields.email]?.toString() ?? "",
        nextStep: AuthNextStep.fromValue(
            map[ResolveEmailResponseFields.nextStep]?.toString() ?? ""));
  }

  Map<String, dynamic> toJson() {
    return {
      ResolveEmailResponseFields.success: success,
      ResolveEmailResponseFields.message: message,
      ResolveEmailResponseFields.email: email,
      ResolveEmailResponseFields.nextStep: nextStep.value
    };
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('success: $success');
    parts.add('message: $message');
    parts.add('email: $email');
    parts.add('nextStep: $nextStep');
    return 'ResolveEmailResponse(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ResolveEmailResponse &&
        other.success == success &&
        other.message == message &&
        other.email == email &&
        other.nextStep == nextStep;
  }

  @override
  int get hashCode {
    return Object.hashAll([success, message, email, nextStep]);
  }
}
