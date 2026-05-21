enum UserSettingsModelUserRoles {
  ADMIN('admin'),
  USER('user'),
  SERVICEPROVIDER('service_provider'),
  DRIVER('driver'),
  ;

  final String value;

  const UserSettingsModelUserRoles(this.value);

  static UserSettingsModelUserRoles fromValue(String value) {
    return UserSettingsModelUserRoles.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
