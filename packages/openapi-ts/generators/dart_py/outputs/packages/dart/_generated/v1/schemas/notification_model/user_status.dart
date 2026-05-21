enum NotificationModelUserStatus {
  ACTIVE('active'),
  SUSPENDED('suspended'),
  DELETED('deleted'),
  ;

  final String value;

  const NotificationModelUserStatus(this.value);

  static NotificationModelUserStatus fromValue(String value) {
    return NotificationModelUserStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
