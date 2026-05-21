// GENERATED CODE - DO NOT MODIFY BY HAND.
//
// Generator: dart-py
// Generated on: Wednesday, May 20, 2026
// Source: OpenAPI spec
// Output: enums\user_status\enum.dart

/// UserStatus enum.
///
/// Generated from OpenAPI schema: `UserStatus`.
enum UserStatus {
  active('active'),
  suspended('suspended'),
  deleted('deleted');

  const UserStatus(this.value);

  final String value;

  static UserStatus fromValue(String value) {
    return UserStatus.values.firstWhere(
      (item) => item.value == value,
      orElse: () => throw ArgumentError('Invalid UserStatus value: $value'),
    );
  }

  static UserStatus fromJson(String value) => fromValue(value);

  String toJson() => value;

  @override
  String toString() => value;
}
