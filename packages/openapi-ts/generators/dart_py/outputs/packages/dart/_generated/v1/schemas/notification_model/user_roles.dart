enum NotificationModelUserRoles {
  ADMIN('admin'),
  USER('user'),
  SERVICEPROVIDER('service_provider'),
  DRIVER('driver'),
  ;

  final String value;

  const NotificationModelUserRoles(this.value);

  static NotificationModelUserRoles fromValue(String value) {
    return NotificationModelUserRoles.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
