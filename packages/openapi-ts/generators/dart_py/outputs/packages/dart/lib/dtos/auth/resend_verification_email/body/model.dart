// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\auth\resend_verification_email\body\model.dart

import 'package:riderescue_api/dtos/auth/resend_verification_email/body/fields.dart';

class ResendVerificationEmailBody {
  final String email;
  const ResendVerificationEmailBody({required this.email});
  ResendVerificationEmailBody copyWith({String? email}) {
    return ResendVerificationEmailBody(email: email ?? this.email);
  }

  factory ResendVerificationEmailBody.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return ResendVerificationEmailBody(
        email: map[ResendVerificationEmailBodyFields.email]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {ResendVerificationEmailBodyFields.email: email};
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('email: $email');
    return 'ResendVerificationEmailBody(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ResendVerificationEmailBody && other.email == email;
  }

  @override
  int get hashCode {
    return Object.hashAll([email]);
  }
}
