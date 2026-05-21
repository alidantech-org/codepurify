// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: enums\auth_next_step\enum.dart

/// AuthNextStep enum.
///
/// Generated from OpenAPI schema: `AuthNextStep`.
enum AuthNextStep {
  login('login'),
  signup('signup'),
  verifyEmail('verify_email');

  const AuthNextStep(this.value);

  final String value;

  static AuthNextStep fromValue(String value) {
    return AuthNextStep.values.firstWhere(
      (item) => item.value == value,
      orElse: () => throw ArgumentError('Invalid AuthNextStep value: $value'),
    );
  }

  static AuthNextStep fromJson(String value) => fromValue(value);

  String toJson() => value;

  @override
  String toString() => value;
}
