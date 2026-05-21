// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: dtos\auth\google_sign_in\body\model.dart

import 'package:riderescue_api/dtos/auth/google_sign_in/body/fields.dart';

class GoogleSignInBody {
  final String idToken;
  const GoogleSignInBody({required this.idToken});
  GoogleSignInBody copyWith({String? idToken}) {
    return GoogleSignInBody(idToken: idToken ?? this.idToken);
  }

  factory GoogleSignInBody.fromJson(dynamic json) {
    final map = Map<String, dynamic>.from((json as Map?) ?? {});
    return GoogleSignInBody(
        idToken: map[GoogleSignInBodyFields.idToken]?.toString() ?? "");
  }

  Map<String, dynamic> toJson() {
    return {GoogleSignInBodyFields.idToken: idToken};
  }

  @override
  String toString() {
    final parts = <String>[];
    parts.add('idToken: ***');
    return 'GoogleSignInBody(${parts.join(", ")})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is GoogleSignInBody && other.idToken == idToken;
  }

  @override
  int get hashCode {
    return Object.hashAll([idToken]);
  }
}
