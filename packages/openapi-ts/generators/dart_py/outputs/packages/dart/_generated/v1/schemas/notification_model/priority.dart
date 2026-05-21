enum NotificationModelPriority {
  LOW('low'),
  NORMAL('normal'),
  HIGH('high'),
  URGENT('urgent'),
  ;

  final String value;

  const NotificationModelPriority(this.value);

  static NotificationModelPriority fromValue(String value) {
    return NotificationModelPriority.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
