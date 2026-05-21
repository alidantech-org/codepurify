enum NotificationModelChannels {
  INAPP('in_app'),
  EMAIL('email'),
  PUSH('push'),
  SMS('sms'),
  ;

  final String value;

  const NotificationModelChannels(this.value);

  static NotificationModelChannels fromValue(String value) {
    return NotificationModelChannels.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
