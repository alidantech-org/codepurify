enum UserModelRoles {
  ADMIN('admin'),
  USER('user'),
  SERVICEPROVIDER('service_provider'),
  DRIVER('driver'),
  ;

  final String value;

  const UserModelRoles(this.value);

  static UserModelRoles fromValue(String value) {
    return UserModelRoles.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
