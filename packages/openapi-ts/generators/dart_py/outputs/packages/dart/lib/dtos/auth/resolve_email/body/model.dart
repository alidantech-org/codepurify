// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\auth\resolve_email\body\model.dart

import 'package:riderescue_api/dtos/auth/resolve_email/body/fields.dart';

class ResolveEmailBody {
  final String email;
  const ResolveEmailBody({required this.email});
  ResolveEmailBody copyWith({String? email}) {
    return ResolveEmailBody(email: email ?? this.email);
  }

  factory ResolveEmailBody.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return ResolveEmailBody(
        email: map[ResolveEmailBodyFields.email]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {ResolveEmailBodyFields.email: email};
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('email: $email');
    return 'ResolveEmailBody(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ResolveEmailBody && other.email == email;
  }

  @override
  int get hashCode {
    return Object.hashAll([email]);
  }
}
