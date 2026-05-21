// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: enums\user_role\enum.dart

/// UserRole enum.
///
/// Generated from OpenAPI schema: `UserRole`.
enum UserRole {
  admin('admin'),
  user('user'),
  serviceProvider('service_provider'),
  driver('driver');

  const UserRole(this.value);

  final String value;

  static UserRole fromValue(String value) {
    return UserRole.values.firstWhere(
      (item) => item.value == value,
      orElse: () => throw ArgumentError('Invalid UserRole value: $value'),
    );
  }

  static UserRole fromJson(String value) => fromValue(value);

  String toJson() => value;

  @override
  String toString() => value;
}
