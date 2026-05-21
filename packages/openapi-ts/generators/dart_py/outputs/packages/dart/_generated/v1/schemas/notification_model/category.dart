enum NotificationModelCategory {
  ACCOUNT('account'),
  SECURITY('security'),
  BOOKING('booking'),
  PAYMENT('payment'),
  MESSAGE('message'),
  SYSTEM('system'),
  MARKETING('marketing'),
  ;

  final String value;

  const NotificationModelCategory(this.value);

  static NotificationModelCategory fromValue(String value) {
    return NotificationModelCategory.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
