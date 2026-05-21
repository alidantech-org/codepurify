enum PartialPublicUserModelRoles {
  ADMIN('admin'),
  USER('user'),
  SERVICEPROVIDER('service_provider'),
  DRIVER('driver'),
  ;

  final String value;

  const PartialPublicUserModelRoles(this.value);

  static PartialPublicUserModelRoles fromValue(String value) {
    return PartialPublicUserModelRoles.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
