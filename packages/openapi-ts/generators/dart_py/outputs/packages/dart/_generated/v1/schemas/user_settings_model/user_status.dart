enum UserSettingsModelUserStatus {
  ACTIVE('active'),
  SUSPENDED('suspended'),
  DELETED('deleted'),
  ;

  final String value;

  const UserSettingsModelUserStatus(this.value);

  static UserSettingsModelUserStatus fromValue(String value) {
    return UserSettingsModelUserStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
