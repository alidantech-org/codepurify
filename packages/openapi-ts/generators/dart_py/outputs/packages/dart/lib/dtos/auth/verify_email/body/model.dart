// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\auth\verify_email\body\model.dart

import 'package:riderescue_api/dtos/auth/verify_email/body/fields.dart';

class VerifyEmailBody {
  final String email;
  final String otp;
  const VerifyEmailBody({required this.email, required this.otp});
  VerifyEmailBody copyWith({String? email, String? otp}) {
    return VerifyEmailBody(email: email ?? this.email, otp: otp ?? this.otp);
  }

  factory VerifyEmailBody.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return VerifyEmailBody(
        email: map[VerifyEmailBodyFields.email]?.toString() ?? "",
        otp: map[VerifyEmailBodyFields.otp]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {VerifyEmailBodyFields.email: email, VerifyEmailBodyFields.otp: otp};
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('email: $email');
    parts.add('otp: ***');
    return 'VerifyEmailBody(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is VerifyEmailBody && other.email == email && other.otp == otp;
  }

  @override
  int get hashCode {
    return Object.hashAll([email, otp]);
  }
}
