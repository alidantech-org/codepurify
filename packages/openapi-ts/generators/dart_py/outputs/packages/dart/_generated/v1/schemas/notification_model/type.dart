enum NotificationModelType {
  SERVICEAPPROVED('service_approved'),
  SERVICEREJECTED('service_rejected'),
  NEWREQUEST('new_request'),
  PAYMENTRECEIVED('payment_received'),
  SERVICEUPDATE('service_update'),
  BOOKINGSTATUSUPDATE('booking_status_update'),
  SYSTEMMESSAGE('system_message'),
  ;

  final String value;

  const NotificationModelType(this.value);

  static NotificationModelType fromValue(String value) {
    return NotificationModelType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => throw ArgumentError("Invalid enum value: $value"),
    );
  }
}
