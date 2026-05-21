enum UploadModelUserRoles {
  ADMIN('admin'),
  USER('user'),
  SERVICEPROVIDER('service_provider'),
  DRIVER('driver'),
  ;

  final String value;

  const UploadModelUserRoles(this.value);

  static UploadModelUserRoles fromValue(String value) {
    return UploadModelUserRoles.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
