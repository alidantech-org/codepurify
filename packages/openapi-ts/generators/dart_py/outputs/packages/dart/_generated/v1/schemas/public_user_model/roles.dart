enum PublicUserModelRoles {
  ADMIN('admin'),
  USER('user'),
  SERVICEPROVIDER('service_provider'),
  DRIVER('driver'),
  ;

  final String value;

  const PublicUserModelRoles(this.value);

  static PublicUserModelRoles fromValue(String value) {
    return PublicUserModelRoles.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
